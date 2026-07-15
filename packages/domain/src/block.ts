import type { NodeStatus, WorkNode } from "./types.js";

/**
 * specs/STATE_AND_EVENT_MODEL.md: o LINK/síntese é um entregável *calculado*,
 * nunca concluído manualmente quando a regra é ALL_CHILDREN/THRESHOLD.
 */
export function computeSynthesisStatus(
  synthesis: Pick<WorkNode, "completion_rule">,
  children: readonly Pick<WorkNode, "status">[],
): NodeStatus {
  const total = children.length;
  const done = children.filter((c) => c.status === "DONE").length;
  const blocked = children.some((c) => c.status === "BLOCKED");
  const inProgress = children.some((c) => c.status === "IN_PROGRESS");

  const threshold =
    synthesis.completion_rule.kind === "THRESHOLD"
      ? (synthesis.completion_rule.minimum_complete ?? total)
      : total;

  if (total > 0 && done >= threshold) {
    return "DONE";
  }
  if (blocked) {
    return "BLOCKED";
  }
  if (inProgress || done > 0) {
    return "IN_PROGRESS";
  }
  return "TODO";
}

/**
 * specs/SPRINT_AND_FOCUS_PROJECTIONS.md — ordem determinística de seleção
 * dentro de um conjunto de ações candidatas (um bloco):
 *   1. ação explicitamente focada;
 *   2. ação IN_PROGRESS não bloqueada;
 *   3. primeira TODO com dependências satisfeitas, ordenada por `order`.
 * Retorna null quando nenhuma ação é elegível (bloqueio ou reconfiguração
 * necessária).
 */
export function selectNextAction(
  actions: readonly WorkNode[],
  opts: { focusedNodeId?: string | null; doneNodeIds?: ReadonlySet<string> } = {},
): WorkNode | null {
  const focused = opts.focusedNodeId
    ? actions.find((a) => a.id === opts.focusedNodeId && a.status !== "DONE")
    : undefined;
  if (focused) return focused;

  const inProgress = actions.find((a) => a.status === "IN_PROGRESS");
  if (inProgress) return inProgress;

  const doneIds = opts.doneNodeIds ?? new Set(actions.filter((a) => a.status === "DONE").map((a) => a.id));
  const eligible = actions
    .filter((a) => a.status === "TODO")
    .filter((a) => (a.dependencies ?? []).every((depId) => doneIds.has(depId)))
    .sort((a, b) => a.order - b.order);

  return eligible[0] ?? null;
}
