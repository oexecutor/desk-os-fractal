import type { PlanVersion, WorkNode } from "@desk-os/domain";
import type { MaterializedState, NodeState } from "@desk-os/events";

export const WORKSPACE_ID = "0123456789abcdef0001";
export const PLAN_ID = "plan0000000000000001";
export const PROJECT_ID = "project0000000000001";

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
    dependencies: [],
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

function block(id: string, order: number, title: string): WorkNode {
  return {
    schema_version: "1.0.0",
    id,
    workspace_id: WORKSPACE_ID,
    project_id: PROJECT_ID,
    plan_version_id: PLAN_ID,
    parent_id: PROJECT_ID,
    node_type: "block",
    title,
    order,
    depth: 1,
    status: "TODO",
    completion_rule: { kind: "ALL_CHILDREN" },
    schedule: { date: null },
    source_refs: [],
    metadata: {},
  } as unknown as WorkNode;
}

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

/** Dois blocos (SEG, TER), cada um com 3 ações + 1 síntese. */
export function buildTwoBlockPlan(overrides: Partial<PlanVersion> = {}): PlanVersion {
  const blockSeg = block("blockseg000000000001", 0, "Bloco SEG");
  const blockTer = block("blockter000000000001", 1, "Bloco TER");

  const nodes: WorkNode[] = [
    project(),
    blockSeg,
    action("segaction0000000001", blockSeg.id, 0, "Ação SEG 1"),
    action("segaction0000000002", blockSeg.id, 1, "Ação SEG 2"),
    action("segaction0000000003", blockSeg.id, 2, "Ação SEG 3"),
    synthesis("segsynthesis00000001", blockSeg.id, "LINK SEG"),
    blockTer,
    action("teraction0000000001", blockTer.id, 0, "Ação TER 1"),
    action("teraction0000000002", blockTer.id, 1, "Ação TER 2"),
    action("teraction0000000003", blockTer.id, 2, "Ação TER 3"),
    synthesis("tersynthesis00000001", blockTer.id, "LINK TER"),
  ];

  return {
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
}

export function emptyState(streamVersion = 0): MaterializedState {
  return {
    schema_version: "1.0.0",
    workspace_id: WORKSPACE_ID,
    plan_version_id: PLAN_ID,
    stream_version: streamVersion,
    node_states: {},
    focused_node_id: null,
    updated_at: "2026-07-13T08:00:00Z",
  };
}

export function withNodeState(
  state: MaterializedState,
  nodeId: string,
  status: NodeState["status"],
): MaterializedState {
  return {
    ...state,
    node_states: {
      ...state.node_states,
      [nodeId]: {
        status,
        started_at: null,
        completed_at: null,
        blocked_reason: null,
        evidence_count: 0,
        updated_at: "2026-07-13T08:00:00Z",
      },
    },
  };
}
