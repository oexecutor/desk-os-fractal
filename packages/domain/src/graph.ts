import type { WorkNodeId } from "./ids.js";
import type { WorkNode } from "./types.js";

export interface GraphValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * specs/CANONICAL_DOMAIN_MODEL.md — invariantes 1 a 7 (estruturais). A
 * invariante 8 (síntese calculada) é checada aqui pela forma da
 * completion_rule; invariantes 9 e 10 (lifecycle e histórico) pertencem a
 * packages/events e packages/approval, não ao grafo em si.
 */
export function validateGraphInvariants(
  nodes: readonly WorkNode[],
  rootNodeIds: readonly WorkNodeId[],
): GraphValidationResult {
  const errors: string[] = [];
  const byId = new Map<string, WorkNode>();

  for (const node of nodes) {
    if (byId.has(node.id)) {
      errors.push(`ID duplicado: ${node.id}`);
      continue;
    }
    byId.set(node.id, node);
  }

  for (const rootId of rootNodeIds) {
    const root = byId.get(rootId);
    if (!root) {
      errors.push(`root_node_ids referencia nó inexistente: ${rootId}`);
    } else if (root.parent_id !== null) {
      errors.push(`nó raiz ${rootId} possui parent_id não nulo`);
    }
  }

  for (const node of nodes) {
    if (node.parent_id === null) {
      if (node.depth !== 0) {
        errors.push(`nó raiz ${node.id} deveria ter depth 0, possui ${node.depth}`);
      }
      continue;
    }
    const parent = byId.get(node.parent_id);
    if (!parent) {
      errors.push(`parent_id inexistente para ${node.id}: ${node.parent_id}`);
      continue;
    }
    if (parent.workspace_id !== node.workspace_id) {
      errors.push(`${node.id} e seu pai pertencem a workspaces diferentes`);
    }
    if (parent.plan_version_id !== node.plan_version_id) {
      errors.push(`${node.id} e seu pai pertencem a versões de plano diferentes`);
    }
    if (parent.depth + 1 !== node.depth) {
      errors.push(
        `depth inconsistente em ${node.id}: esperado ${parent.depth + 1}, obtido ${node.depth}`,
      );
    }
  }

  // Ciclos: coloração DFS (branco/cinza/preto).
  const state = new Map<string, "visiting" | "done">();
  const detectCycle = (nodeId: string, path: string[]): void => {
    const current = state.get(nodeId);
    if (current === "done") return;
    if (current === "visiting") {
      errors.push(`ciclo detectado: ${[...path, nodeId].join(" -> ")}`);
      return;
    }
    state.set(nodeId, "visiting");
    const node = byId.get(nodeId);
    if (node?.parent_id) {
      detectCycle(node.parent_id, [...path, nodeId]);
    }
    state.set(nodeId, "done");
  };
  for (const node of nodes) {
    detectCycle(node.id, []);
  }

  // order único entre irmãos.
  const siblingsByParent = new Map<string, WorkNode[]>();
  for (const node of nodes) {
    const key = node.parent_id ?? "__root__";
    const list = siblingsByParent.get(key) ?? [];
    list.push(node);
    siblingsByParent.set(key, list);
  }
  for (const [parentId, siblings] of siblingsByParent) {
    const seenOrders = new Set<number>();
    for (const sibling of siblings) {
      if (seenOrders.has(sibling.order)) {
        errors.push(`order duplicado entre irmãos de ${parentId}: ${sibling.order}`);
      }
      seenOrders.add(sibling.order);
    }
  }

  // Toda ação possui ao menos um critério de conclusão verificável.
  for (const node of nodes) {
    if (node.node_type === "action" && (node.done_criteria?.length ?? 0) < 1) {
      errors.push(`ação ${node.id} não possui done_criteria`);
    }
  }

  // Síntese não é concluída manualmente quando a regra é calculada.
  for (const node of nodes) {
    if (
      node.node_type === "synthesis" &&
      !["ALL_CHILDREN", "THRESHOLD"].includes(node.completion_rule.kind)
    ) {
      errors.push(
        `synthesis ${node.id} deveria usar completion_rule ALL_CHILDREN ou THRESHOLD, possui ${node.completion_rule.kind}`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

export function getChildren(nodes: readonly WorkNode[], parentId: string): WorkNode[] {
  return nodes
    .filter((node) => node.parent_id === parentId)
    .sort((a, b) => a.order - b.order);
}

/**
 * specs/CANONICAL_DOMAIN_MODEL.md — "Bloco operacional padrão: exatamente
 * três ações filhas e uma síntese calculada." Este é o contrato do bloco
 * *padrão*; violações não invalidam o grafo por si (cardinalidade superior é
 * dinâmica), mas bloqueiam impressão/decomposição conforme ADR-0017/CR-001.
 */
export function validateOperationalBlock(
  block: WorkNode,
  nodes: readonly WorkNode[],
): GraphValidationResult {
  const errors: string[] = [];
  const children = getChildren(nodes, block.id);
  const actions = children.filter((c) => c.node_type === "action");
  const syntheses = children.filter((c) => c.node_type === "synthesis");

  if (actions.length !== 3) {
    errors.push(`bloco ${block.id} possui ${actions.length} ações; esperado exatamente 3`);
  }
  if (syntheses.length !== 1) {
    errors.push(`bloco ${block.id} possui ${syntheses.length} sínteses; esperado exatamente 1`);
  }
  for (const action of actions) {
    if ((action.done_criteria?.length ?? 0) < 1) {
      errors.push(`ação ${action.id} do bloco ${block.id} não possui done_criteria`);
    }
  }

  return { valid: errors.length === 0, errors };
}
