import { getChildren, type PlanVersion, type WorkNode } from "@desk-os/domain";
import type { MaterializedState } from "@desk-os/events";

export type CurrentActionKind =
  | "ACTION"
  | "SYNTHESIS"
  | "CLOSE_DAY"
  | "RECYCLE"
  | "NO_ACTIONABLE_TARGET"
  | "AMBIGUOUS_IN_PROGRESS"
  | "PLAN_NOT_ACTIVE";

export interface CurrentActionResolution {
  resolved_kind: CurrentActionKind;
  target_id: string | null;
  target_title: string | null;
  block_id: string | null;
  consequence_preview: string;
  expected_version: number;
  confirmation_required: boolean;
  /** Estado atual do alvo quando resolved_kind === "ACTION" — desambigua
   * START_ACTION (TODO) de COMPLETE_ACTION (IN_PROGRESS) na execução. */
  action_status: "TODO" | "IN_PROGRESS" | null;
}

function statusOf(state: MaterializedState, nodeId: string): WorkNode["status"] {
  return (state.node_states[nodeId]?.status as WorkNode["status"] | undefined) ?? "TODO";
}

/**
 * Ordem de blocos = ordem de travessia canônica da árvore (pré-ordem,
 * respeitando `order` em cada nível) — não existe campo "sprint" separado
 * (specs/SPRINT_AND_FOCUS_PROJECTIONS.md: sprint é projeção derivada).
 */
function collectBlocksInOrder(nodes: readonly WorkNode[], rootIds: readonly string[]): WorkNode[] {
  const blocks: WorkNode[] = [];
  const visit = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    if (node.node_type === "block") {
      blocks.push(node);
    }
    for (const child of getChildren(nodes, nodeId)) {
      visit(child.id);
    }
  };
  for (const rootId of rootIds) visit(rootId);
  return blocks;
}

function noTarget(state: MaterializedState, kind: CurrentActionKind = "NO_ACTIONABLE_TARGET"): CurrentActionResolution {
  return {
    resolved_kind: kind,
    target_id: null,
    target_title: null,
    block_id: null,
    consequence_preview:
      kind === "PLAN_NOT_ACTIVE"
        ? "O plano associado a este QR não está mais ativo."
        : "Nenhuma ação elegível no momento — revise bloqueios ou aguarde reconfiguração.",
    expected_version: state.stream_version,
    confirmation_required: false,
    action_status: null,
  };
}

/**
 * specs/QR_SEMANTIC_CURRENT_ACTION.md — resolvedor determinístico de 10
 * passos. O token é opaco e estável durante a semana; cada leitura recalcula
 * o alvo a partir do estado dinâmico atual, nunca do papel.
 */
export function resolveCurrentAction(
  plan: PlanVersion,
  state: MaterializedState,
): CurrentActionResolution {
  if (plan.lifecycle_state !== "ACTIVE") {
    return noTarget(state, "PLAN_NOT_ACTIVE");
  }

  const blocks = collectBlocksInOrder(plan.nodes, plan.root_node_ids);

  for (const block of blocks) {
    if (statusOf(state, block.id) === "DONE") {
      continue; // dia/bloco já fechado — avança para o próximo (passo 8)
    }

    const children = getChildren(plan.nodes, block.id);
    const actions = children.filter((c) => c.node_type === "action").sort((a, b) => a.order - b.order);
    const synthesis = children.find((c) => c.node_type === "synthesis");

    // passo 4: ação IN_PROGRESS — conflito de domínio se houver mais de uma.
    const inProgress = actions.filter((a) => statusOf(state, a.id) === "IN_PROGRESS");
    if (inProgress.length > 1) {
      return {
        resolved_kind: "AMBIGUOUS_IN_PROGRESS",
        target_id: null,
        target_title: null,
        block_id: block.id,
        consequence_preview: `${inProgress.length} ações em andamento simultaneamente no bloco "${block.title}" — resolva manualmente no aplicativo.`,
        expected_version: state.stream_version,
        confirmation_required: false,
        action_status: null,
      };
    }
    if (inProgress.length === 1) {
      const target = inProgress[0]!;
      return {
        resolved_kind: "ACTION",
        target_id: target.id,
        target_title: target.title,
        block_id: block.id,
        consequence_preview: `Continuar/concluir "${target.title}".`,
        expected_version: state.stream_version,
        confirmation_required: true,
        action_status: "IN_PROGRESS",
      };
    }

    // passo 5: primeira TODO com dependências satisfeitas.
    const doneIds = new Set(actions.filter((a) => statusOf(state, a.id) === "DONE").map((a) => a.id));
    const eligible = actions
      .filter((a) => statusOf(state, a.id) === "TODO")
      .filter((a) => (a.dependencies ?? []).every((depId) => doneIds.has(depId)));
    if (eligible.length > 0) {
      const target = eligible[0]!;
      return {
        resolved_kind: "ACTION",
        target_id: target.id,
        target_title: target.title,
        block_id: block.id,
        consequence_preview: `Iniciar "${target.title}".`,
        expected_version: state.stream_version,
        confirmation_required: true,
        action_status: "TODO",
      };
    }

    const allActionsDone = actions.length > 0 && actions.every((a) => statusOf(state, a.id) === "DONE");

    if (!allActionsDone) {
      // ações restantes estão bloqueadas ou aguardando dependência — não
      // avança silenciosamente para o próximo bloco (evitaria esconder o bloqueio).
      return {
        resolved_kind: "NO_ACTIONABLE_TARGET",
        target_id: block.id,
        target_title: block.title,
        block_id: block.id,
        consequence_preview: `Bloco "${block.title}" tem ações bloqueadas ou aguardando dependência.`,
        expected_version: state.stream_version,
        confirmation_required: false,
        action_status: null,
      };
    }

    // passo 6: LINK aberto.
    if (synthesis && statusOf(state, synthesis.id) !== "DONE") {
      return {
        resolved_kind: "SYNTHESIS",
        target_id: synthesis.id,
        target_title: synthesis.title,
        block_id: block.id,
        consequence_preview: `Concluir o LINK "${synthesis.title}" do bloco.`,
        expected_version: state.stream_version,
        confirmation_required: true,
        action_status: null,
      };
    }

    // passo 7/8: LINK concluído, fechamento do bloco/dia pendente.
    return {
      resolved_kind: "CLOSE_DAY",
      target_id: block.id,
      target_title: block.title,
      block_id: block.id,
      consequence_preview: `Registrar fechamento do bloco "${block.title}" (entrega, bloqueio, próxima ação).`,
      expected_version: state.stream_version,
      confirmation_required: true,
      action_status: null,
    };
  }

  // passo 9: todos os blocos fechados.
  if (blocks.length > 0) {
    return {
      resolved_kind: "RECYCLE",
      target_id: null,
      target_title: null,
      block_id: null,
      consequence_preview: "Todos os blocos da semana estão fechados — decidir Recycle.",
      expected_version: state.stream_version,
      confirmation_required: true,
      action_status: null,
    };
  }

  // passo 10: nenhum alvo válido (plano sem blocos operacionais).
  return noTarget(state);
}
