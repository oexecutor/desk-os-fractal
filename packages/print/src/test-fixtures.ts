import type { PlanVersion, WorkNode } from "@desk-os/domain";
import { DAY_LABELS, type DayLabel } from "./print-snapshot.js";

export const WORKSPACE_ID = "0123456789abcdef0001";
export const PLAN_ID = "plan0000000000000001";
export const PROJECT_ID = "project0000000000001";

function project(): WorkNode {
  return {
    schema_version: "1.0.0",
    id: PROJECT_ID,
    workspace_id: WORKSPACE_ID,
    project_id: PROJECT_ID,
    plan_version_id: PLAN_ID,
    parent_id: null,
    node_type: "project",
    title: "Projeto de teste",
    order: 0,
    depth: 0,
    status: "TODO",
    completion_rule: { kind: "NONE" },
    source_refs: [],
    metadata: {},
  } as unknown as WorkNode;
}

function block(id: string, order: number, day: DayLabel): WorkNode {
  return {
    schema_version: "1.0.0",
    id,
    workspace_id: WORKSPACE_ID,
    project_id: PROJECT_ID,
    plan_version_id: PLAN_ID,
    parent_id: PROJECT_ID,
    node_type: "block",
    title: `Bloco ${day}`,
    order,
    depth: 1,
    status: "TODO",
    completion_rule: { kind: "ALL_CHILDREN" },
    source_refs: [],
    metadata: {},
  } as unknown as WorkNode;
}

function action(id: string, blockId: string, order: number, title: string): WorkNode {
  return {
    schema_version: "1.0.0",
    id,
    workspace_id: WORKSPACE_ID,
    project_id: PROJECT_ID,
    plan_version_id: PLAN_ID,
    parent_id: blockId,
    node_type: "action",
    title,
    order,
    depth: 2,
    status: "TODO",
    completion_rule: { kind: "MANUAL" },
    done_criteria: [`${title} concluída`],
    source_refs: [],
    metadata: {},
  } as unknown as WorkNode;
}

function synthesis(id: string, blockId: string, title: string): WorkNode {
  return {
    schema_version: "1.0.0",
    id,
    workspace_id: WORKSPACE_ID,
    project_id: PROJECT_ID,
    plan_version_id: PLAN_ID,
    parent_id: blockId,
    node_type: "synthesis",
    title,
    order: 3,
    depth: 2,
    status: "TODO",
    completion_rule: { kind: "ALL_CHILDREN" },
    source_refs: [],
    metadata: {},
  } as unknown as WorkNode;
}

/** Plano ACTIVE com 5 blocos (SEG–SEX), cada um com 3 ações + 1 síntese. */
export function buildWeeklyActivePlan(overrides: Partial<PlanVersion> = {}): {
  plan: PlanVersion;
  blocksByDay: Record<DayLabel, string>;
} {
  const nodes: WorkNode[] = [project()];
  const blocksByDay = {} as Record<DayLabel, string>;

  DAY_LABELS.forEach((day, dayIndex) => {
    const blockId = `block${day.toLowerCase()}000000001`;
    blocksByDay[day] = blockId;
    nodes.push(block(blockId, dayIndex, day));
    for (let i = 0; i < 3; i += 1) {
      nodes.push(action(`${day.toLowerCase()}action${i}00000001`, blockId, i, `Ação ${day} ${i + 1}`));
    }
    nodes.push(synthesis(`${day.toLowerCase()}synth000000001`, blockId, `LINK ${day}`));
  });

  const plan: PlanVersion = {
    schema_version: "1.0.0",
    id: PLAN_ID,
    workspace_id: WORKSPACE_ID,
    version: 1,
    lifecycle_state: "ACTIVE",
    root_node_ids: [PROJECT_ID],
    nodes,
    validation_report: { valid: true, errors: [], warnings: [], gaps: [] },
    created_at: "2026-07-13T08:00:00Z",
    approved_at: "2026-07-13T09:00:00Z",
    approved_by: "u1",
    ...overrides,
  } as unknown as PlanVersion;

  return { plan, blocksByDay };
}
