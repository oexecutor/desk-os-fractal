import { canIssueMutableQr, createId, type PlanLifecycleState, type PlanVersion } from "@desk-os/domain";
import { handleCommand, type CommandType, type EventStore } from "@desk-os/events";
import type { MaterializedState } from "@desk-os/events";
import { resolveActiveBlock, resolveCurrentContext } from "./legacy-resolvers.js";
import { resolveCurrentAction, type CurrentActionResolution } from "./resolve-current-action.js";
import type { QrTokenRecord } from "./qr-token.js";

export interface QrResolveResponse {
  kind: string;
  description: string;
  mutates_state: boolean;
  confirmation_required: boolean;
  target: { id: string | null; title: string | null; block_id: string | null };
  expected_version: number;
  action_status: "TODO" | "IN_PROGRESS" | null;
}

/**
 * GET /q/{token}/resolve — puro, nunca muta (AT-037/AT-038). Recalcula o
 * alvo a partir do estado dinâmico atual a cada leitura.
 */
export function resolveQrToken(
  record: QrTokenRecord,
  plan: PlanVersion,
  state: MaterializedState,
): QrResolveResponse {
  if (record.kind === "VIEW_CONTEXT") {
    const target = resolveCurrentContext(plan);
    return {
      kind: record.kind,
      description: `Contexto: ${target.target_title ?? plan.id}`,
      mutates_state: false,
      confirmation_required: false,
      target: { id: target.target_id, title: target.target_title, block_id: null },
      expected_version: state.stream_version,
      action_status: null,
    };
  }

  if (record.kind === "OPEN_FOCUS") {
    const target = resolveActiveBlock(plan, state);
    return {
      kind: record.kind,
      description: target.found ? `Bloco ativo: ${target.target_title}` : "Nenhum bloco ativo.",
      mutates_state: false,
      confirmation_required: false,
      target: { id: target.target_id, title: target.target_title, block_id: target.target_id },
      expected_version: state.stream_version,
      action_status: null,
    };
  }

  if (record.kind === "OPEN_CURRENT_ACTION") {
    const resolution = resolveCurrentAction(plan, state);
    return {
      kind: resolution.resolved_kind,
      description: resolution.consequence_preview,
      mutates_state: resolution.confirmation_required,
      confirmation_required: resolution.confirmation_required,
      target: {
        id: resolution.target_id,
        title: resolution.target_title,
        block_id: resolution.block_id,
      },
      expected_version: resolution.expected_version,
      action_status: resolution.action_status,
    };
  }

  // COMPLETE_ACTION / CLOSE_DAY / RECYCLE: FIXED_NODE — alvo já fixado no token.
  const nodeId = record.target.node_id ?? null;
  const node = nodeId ? plan.nodes.find((n) => n.id === nodeId) : undefined;
  return {
    kind: record.kind,
    description: `Confirmar ${record.kind}${node ? ` em "${node.title}"` : ""}.`,
    mutates_state: true,
    confirmation_required: true,
    target: { id: nodeId, title: node?.title ?? null, block_id: node?.parent_id ?? null },
    expected_version: state.stream_version,
    action_status: null,
  };
}

export class QrConfirmationRequiredError extends Error {
  constructor() {
    super("Execução via QR exige confirmed=true.");
    this.name = "QrConfirmationRequiredError";
  }
}

export class QrRecycleDecisionRequiredError extends Error {
  constructor() {
    super("RECYCLE via QR exige uma decisão explícita (CONTINUE|REDUCE|SPLIT|RECONFIGURE).");
    this.name = "QrRecycleDecisionRequiredError";
  }
}

export class QrNoActionableTargetError extends Error {
  constructor() {
    super("Este QR não possui um alvo executável no momento (resolva novamente antes de tentar).");
    this.name = "QrNoActionableTargetError";
  }
}

export class QrSynthesisNotManualError extends Error {
  constructor() {
    super(
      "O LINK/síntese é calculado automaticamente ao concluir a terceira ação — não existe comando manual para fechá-lo (specs/STATE_AND_EVENT_MODEL.md).",
    );
    this.name = "QrSynthesisNotManualError";
  }
}

function commandTypeFor(
  record: QrTokenRecord,
  resolution: CurrentActionResolution | null,
): CommandType {
  if (record.kind === "COMPLETE_ACTION") return "COMPLETE_ACTION";
  if (record.kind === "CLOSE_DAY") return "CLOSE_DAY";
  if (record.kind === "RECYCLE") return "DECIDE_RECYCLE";

  if (record.kind === "OPEN_CURRENT_ACTION" && resolution) {
    switch (resolution.resolved_kind) {
      case "ACTION":
        return resolution.action_status === "IN_PROGRESS" ? "COMPLETE_ACTION" : "START_ACTION";
      case "SYNTHESIS":
        // Não há command_type para isso por design: a síntese fecha sozinha
        // (SYSTEM) junto do handleCommand da 3ª ação — ver deriveSynthesisCompletion.
        throw new QrSynthesisNotManualError();
      case "CLOSE_DAY":
        return "CLOSE_DAY";
      case "RECYCLE":
        return "DECIDE_RECYCLE";
      default:
        throw new QrNoActionableTargetError();
    }
  }

  throw new QrNoActionableTargetError();
}

export interface ExecuteQrCommandInput {
  eventStore: EventStore;
  record: QrTokenRecord;
  plan: PlanVersion;
  state: MaterializedState;
  confirmed: boolean;
  idempotencyKey: string;
  expectedVersion: number;
  actorId: string;
  recycleDecision?: "CONTINUE" | "REDUCE" | "SPLIT" | "RECONFIGURE";
}

/**
 * POST /q/{token}/execute — specs/QR_ROUTER.md fluxo mutável: exige
 * confirmação explícita, `idempotency_key`, `expected_version` e plano
 * ACTIVE (ADR-0015). Nunca escolhe automaticamente entre alvos ambíguos.
 */
export async function executeQrCommand(input: ExecuteQrCommandInput) {
  if (!input.confirmed) {
    throw new QrConfirmationRequiredError();
  }
  if (!canIssueMutableQr(input.plan.lifecycle_state as PlanLifecycleState)) {
    throw new Error("PLAN_NOT_ACTIVE: plano não está ativo para comandos QR mutáveis.");
  }

  const resolution =
    input.record.kind === "OPEN_CURRENT_ACTION" ? resolveCurrentAction(input.plan, input.state) : null;

  if (resolution && !resolution.confirmation_required) {
    throw new QrNoActionableTargetError();
  }

  const commandType = commandTypeFor(input.record, resolution);

  let nodeId: string | null;
  if (input.record.kind === "OPEN_CURRENT_ACTION" && resolution) {
    nodeId = resolution.target_id;
  } else {
    nodeId = input.record.target.node_id ?? null;
  }

  if (commandType === "DECIDE_RECYCLE" && !input.recycleDecision) {
    throw new QrRecycleDecisionRequiredError();
  }

  const data: Record<string, unknown> = { node_id: nodeId };
  if (commandType === "DECIDE_RECYCLE") {
    data.decision = input.recycleDecision;
  }

  return handleCommand(
    input.eventStore,
    {
      schema_version: "1.0.0",
      command_id: createId(),
      command_type: commandType,
      workspace_id: input.plan.workspace_id,
      stream_id: input.plan.id,
      expected_version: input.expectedVersion,
      idempotency_key: input.idempotencyKey,
      actor: { type: "QR", id: input.actorId },
      data,
    },
    {
      planLifecycleState: input.plan.lifecycle_state,
      autoCompletion: { nodes: input.plan.nodes, stateBefore: input.state },
    },
  );
}
