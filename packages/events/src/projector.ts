import type { DomainEvent } from "@desk-os/domain";

export interface NodeState {
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE" | "CANCELLED";
  started_at: string | null;
  completed_at: string | null;
  blocked_reason: string | null;
  evidence_count: number;
  updated_at: string;
}

export interface MaterializedState {
  schema_version: "1.0.0";
  workspace_id: string;
  plan_version_id: string;
  stream_version: number;
  node_states: Record<string, NodeState>;
  focused_node_id: string | null;
  updated_at: string;
}

function ensureNode(state: MaterializedState, nodeId: string, occurredAt: string): NodeState {
  const existing = state.node_states[nodeId];
  if (existing) return existing;
  const created: NodeState = {
    status: "TODO",
    started_at: null,
    completed_at: null,
    blocked_reason: null,
    evidence_count: 0,
    updated_at: occurredAt,
  };
  state.node_states[nodeId] = created;
  return created;
}

/**
 * ADR-0006: reconstrói o snapshot materializado a partir do log de eventos.
 * Determinístico e replayável — o mesmo stream sempre produz o mesmo estado.
 * Convenção: `stream_id` do event store é o `plan_version_id` (um stream de
 * execução por versão ativada); eventos históricos de versões substituídas
 * não são apagados (invariante 10 do modelo canônico), apenas não fazem
 * parte do stream corrente.
 */
export function projectMaterializedState(
  workspaceId: string,
  planVersionId: string,
  events: readonly DomainEvent[],
): MaterializedState {
  const state: MaterializedState = {
    schema_version: "1.0.0",
    workspace_id: workspaceId,
    plan_version_id: planVersionId,
    stream_version: 0,
    node_states: {},
    focused_node_id: null,
    updated_at: new Date(0).toISOString(),
  };

  for (const event of events) {
    state.stream_version = event.stream_version;
    state.updated_at = event.occurred_at;
    const nodeId = typeof event.data.node_id === "string" ? event.data.node_id : undefined;

    switch (event.event_type) {
      case "node.focused": {
        state.focused_node_id = nodeId ?? null;
        break;
      }
      case "action.started": {
        if (!nodeId) break;
        const node = ensureNode(state, nodeId, event.occurred_at);
        node.status = "IN_PROGRESS";
        node.started_at = event.occurred_at;
        node.updated_at = event.occurred_at;
        break;
      }
      case "action.completed":
      case "synthesis.completed":
      case "day.closed": {
        // day.closed fecha o nó "day" do bloco corrente — mesma semântica de
        // conclusão que action/synthesis, usada pelo resolvedor CURRENT_ACTION
        // (specs/QR_SEMANTIC_CURRENT_ACTION.md passo 8) para avançar de dia.
        if (!nodeId) break;
        const node = ensureNode(state, nodeId, event.occurred_at);
        node.status = "DONE";
        node.completed_at = event.occurred_at;
        node.updated_at = event.occurred_at;
        break;
      }
      case "action.reopened": {
        if (!nodeId) break;
        const node = ensureNode(state, nodeId, event.occurred_at);
        node.status = "TODO";
        node.completed_at = null;
        node.updated_at = event.occurred_at;
        break;
      }
      case "action.blocked": {
        if (!nodeId) break;
        const node = ensureNode(state, nodeId, event.occurred_at);
        node.status = "BLOCKED";
        node.blocked_reason =
          typeof event.data.reason === "string" ? event.data.reason : "Bloqueado";
        node.updated_at = event.occurred_at;
        break;
      }
      case "action.unblocked": {
        if (!nodeId) break;
        const node = ensureNode(state, nodeId, event.occurred_at);
        node.status = "TODO";
        node.blocked_reason = null;
        node.updated_at = event.occurred_at;
        break;
      }
      case "evidence.added": {
        // AT-024: evidência é contada separadamente do status de conclusão;
        // nunca "infere" DONE a partir de evidência anexada.
        if (!nodeId) break;
        const node = ensureNode(state, nodeId, event.occurred_at);
        node.evidence_count += 1;
        node.updated_at = event.occurred_at;
        break;
      }
      default:
        break;
    }
  }

  return state;
}
