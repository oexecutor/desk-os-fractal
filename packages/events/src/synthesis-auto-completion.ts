import { computeSynthesisStatus, getChildren, type WorkNode } from "@desk-os/domain";
import type { NewEventInput } from "./event-store.js";
import type { MaterializedState } from "./projector.js";

/**
 * specs/STATE_AND_EVENT_MODEL.md: "Síntese não é concluída manualmente
 * quando sua regra é calculada." Não existe `command_type` para completar
 * uma síntese (command.schema.json não define um) — o único jeito correto
 * de gerar `synthesis.completed` é o próprio sistema derivá-lo quando a
 * última ação irmã é concluída. actor.type = "SYSTEM" (nunca USER/QR).
 */
export function deriveSynthesisCompletion(
  nodes: readonly WorkNode[],
  stateBefore: MaterializedState,
  completedActionEvent: NewEventInput,
  workspaceId: string,
): NewEventInput | null {
  if (completedActionEvent.event_type !== "action.completed") return null;
  const actionId = completedActionEvent.data.node_id;
  if (typeof actionId !== "string") return null;

  const action = nodes.find((n) => n.id === actionId);
  if (!action?.parent_id) return null;

  const siblings = getChildren(nodes, action.parent_id);
  const synthesis = siblings.find((n) => n.node_type === "synthesis");
  if (!synthesis) return null;
  if (stateBefore.node_states[synthesis.id]?.status === "DONE") return null;

  const actionSiblings = siblings.filter((n) => n.node_type === "action");
  const simulatedStatuses = actionSiblings.map((sibling) => ({
    status: sibling.id === actionId ? "DONE" : (stateBefore.node_states[sibling.id]?.status ?? "TODO"),
  }));

  const projectedStatus = computeSynthesisStatus(synthesis, simulatedStatuses);
  if (projectedStatus !== "DONE") return null;

  return {
    event_type: "synthesis.completed",
    workspace_id: workspaceId,
    data: { node_id: synthesis.id, derived_from_action_id: actionId },
    actor: { type: "SYSTEM", id: "system" },
    correlation_id: `${actionId}-synthesis-auto-completion`,
  };
}
