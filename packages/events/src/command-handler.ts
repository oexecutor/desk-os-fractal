import {
  canAcceptExecutionEvents,
  type PlanLifecycleState,
  type DomainEvent,
  type WorkNode,
} from "@desk-os/domain";
import type { CommandType, DomainCommand } from "./commands.js";
import type { EventStore, NewEventInput, AppendResult } from "./event-store.js";
import { NodeNotFoundError, PlanNotActiveError } from "./errors.js";
import { deriveSynthesisCompletion } from "./synthesis-auto-completion.js";
import type { MaterializedState } from "./projector.js";

const COMMAND_TO_EVENT: Record<CommandType, DomainEvent["event_type"]> = {
  START_ACTION: "action.started",
  COMPLETE_ACTION: "action.completed",
  REOPEN_ACTION: "action.reopened",
  BLOCK_ACTION: "action.blocked",
  UNBLOCK_ACTION: "action.unblocked",
  ADD_EVIDENCE: "evidence.added",
  CLOSE_DAY: "day.closed",
  DECIDE_RECYCLE: "recycle.decided",
  APPROVE_PLAN: "plan.approved",
  ACTIVATE_PLAN: "plan.activated",
  FOCUS_NODE: "node.focused",
};

/** Comandos de lifecycle de plano são tratados por packages/approval, não aqui. */
const LIFECYCLE_COMMANDS: ReadonlySet<CommandType> = new Set(["APPROVE_PLAN", "ACTIVATE_PLAN"]);

export interface CommandContext {
  planLifecycleState: PlanLifecycleState;
  nodeExists?: (nodeId: string) => boolean;
  /** Necessário apenas para derivar synthesis.completed automático (ver synthesis-auto-completion.ts). */
  autoCompletion?: { nodes: readonly WorkNode[]; stateBefore: MaterializedState };
}

/**
 * ADR-0007 / PRD §9: plano não ACTIVE não aceita eventos de execução.
 * specs/API_ERROR_MODEL.md: violação retorna PLAN_NOT_ACTIVE (409).
 */
export function buildEventFromCommand(
  command: DomainCommand,
  context: CommandContext,
): NewEventInput {
  if (!LIFECYCLE_COMMANDS.has(command.command_type) && !canAcceptExecutionEvents(context.planLifecycleState)) {
    throw new PlanNotActiveError(command.stream_id);
  }

  const nodeId = command.data.node_id;
  if (typeof nodeId === "string" && context.nodeExists && !context.nodeExists(nodeId)) {
    throw new NodeNotFoundError(nodeId);
  }

  return {
    event_type: COMMAND_TO_EVENT[command.command_type],
    workspace_id: command.workspace_id,
    data: command.data,
    actor: command.actor,
    correlation_id: command.command_id,
  };
}

export async function handleCommand(
  store: EventStore,
  command: DomainCommand,
  context: CommandContext,
): Promise<AppendResult> {
  // specs/QR_ROUTER.md / STATE_AND_EVENT_MODEL.md: "comando duplicado retorna
  // resultado original" — replay é checado antes de qualquer regra de
  // negócio, para que um comando já aplicado continue idempotente mesmo se
  // o plano mudar de estado depois da execução original.
  const replay = await store.peekIdempotency(command.stream_id, command.idempotency_key);
  if (replay) {
    return replay;
  }

  const event = buildEventFromCommand(command, context);
  const events: NewEventInput[] = [event];

  if (context.autoCompletion) {
    const followUp = deriveSynthesisCompletion(
      context.autoCompletion.nodes,
      context.autoCompletion.stateBefore,
      event,
      command.workspace_id,
    );
    if (followUp) events.push(followUp);
  }

  return store.append({
    streamId: command.stream_id,
    expectedVersion: command.expected_version,
    idempotencyKey: command.idempotency_key,
    events,
  });
}
