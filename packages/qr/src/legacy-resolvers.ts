import { getChildren, type PlanVersion, type WorkNode } from "@desk-os/domain";
import type { MaterializedState } from "@desk-os/events";

export interface ResolvedTarget {
  target_id: string | null;
  target_title: string | null;
  found: boolean;
}

function statusOf(state: MaterializedState, nodeId: string): WorkNode["status"] {
  return (state.node_states[nodeId]?.status as WorkNode["status"] | undefined) ?? "TODO";
}

function allBlocks(plan: PlanVersion): WorkNode[] {
  return plan.nodes.filter((n) => n.node_type === "block");
}

/**
 * specs/QR_ROUTER.md — resolvedores específicos, nunca um resolvedor
 * genérico ambíguo. `OPEN_FOCUS` (compatibilidade) usa `resolveActiveBlock`;
 * o QR semanal impresso (ADR-0017/CR-001) usa exclusivamente
 * `resolveCurrentAction` (resolve-current-action.ts).
 */
export function resolveActiveBlock(plan: PlanVersion, state: MaterializedState): ResolvedTarget {
  const block = allBlocks(plan).find((b) => statusOf(state, b.id) !== "DONE");
  return block
    ? { target_id: block.id, target_title: block.title, found: true }
    : { target_id: null, target_title: null, found: false };
}

export function resolveCurrentContext(plan: PlanVersion): ResolvedTarget {
  return { target_id: plan.id, target_title: plan.dominant_result ?? plan.objective ?? null, found: true };
}

/** Bloco cujo `schedule.date` é hoje e ainda não está fechado. */
export function resolveTodayAction(
  plan: PlanVersion,
  state: MaterializedState,
  now: Date,
): ResolvedTarget {
  const today = now.toISOString().slice(0, 10);
  const block = allBlocks(plan).find(
    (b) => b.schedule?.date === today && statusOf(state, b.id) !== "DONE",
  );
  if (!block) return { target_id: null, target_title: null, found: false };

  const nextOpenChild = getChildren(plan.nodes, block.id).find(
    (c) => c.node_type === "action" && statusOf(state, c.id) !== "DONE",
  );
  const target = nextOpenChild ?? block;
  return { target_id: target.id, target_title: target.title, found: true };
}

/** Nó com `schedule.end_at`/`date` no passado e ainda não concluído — o gate mais próximo. */
export function resolveNearestGate(
  plan: PlanVersion,
  state: MaterializedState,
  now: Date,
): ResolvedTarget {
  const overdue = plan.nodes
    .filter((n) => statusOf(state, n.id) !== "DONE")
    .map((n) => ({ node: n, due: n.schedule?.end_at ?? n.schedule?.date ?? null }))
    .filter((entry): entry is { node: WorkNode; due: string } => entry.due !== null)
    .filter((entry) => new Date(entry.due).getTime() < now.getTime())
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

  const nearest = overdue[0];
  return nearest
    ? { target_id: nearest.node.id, target_title: nearest.node.title, found: true }
    : { target_id: null, target_title: null, found: false };
}
