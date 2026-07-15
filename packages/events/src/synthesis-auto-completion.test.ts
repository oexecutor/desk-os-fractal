import { describe, expect, it } from "vitest";
import type { WorkNode } from "@desk-os/domain";
import { deriveSynthesisCompletion } from "./synthesis-auto-completion.js";
import type { MaterializedState } from "./projector.js";

const WORKSPACE_ID = "ws0000000000000001";

function node(overrides: Partial<Record<keyof WorkNode, unknown>>): WorkNode {
  return {
    schema_version: "1.0.0",
    id: "n0000000000000001",
    workspace_id: WORKSPACE_ID,
    project_id: null,
    plan_version_id: "pv0000000000000001",
    parent_id: "block0000000000001",
    node_type: "action",
    title: "Ação",
    order: 0,
    depth: 1,
    status: "TODO",
    completion_rule: { kind: "MANUAL" },
    source_refs: [],
    metadata: {},
    ...overrides,
  } as unknown as WorkNode;
}

function baseState(): MaterializedState {
  return {
    schema_version: "1.0.0",
    workspace_id: WORKSPACE_ID,
    plan_version_id: "pv0000000000000001",
    stream_version: 0,
    node_states: {},
    focused_node_id: null,
    updated_at: "2026-07-13T08:00:00Z",
  };
}

describe("deriveSynthesisCompletion — 'síntese nunca é concluída manualmente'", () => {
  const block = node({ id: "block0000000000001", node_type: "block", parent_id: null });
  const a1 = node({ id: "a1", order: 0 });
  const a2 = node({ id: "a2", order: 1 });
  const a3 = node({ id: "a3", order: 2 });
  const synth = node({ id: "synth1", node_type: "synthesis", completion_rule: { kind: "ALL_CHILDREN" }, order: 3 });
  const nodes = [block, a1, a2, a3, synth];

  it("retorna null quando o evento não é action.completed", () => {
    const result = deriveSynthesisCompletion(
      nodes,
      baseState(),
      { event_type: "action.started", workspace_id: WORKSPACE_ID, data: { node_id: "a1" }, actor: { type: "USER", id: "u1" }, correlation_id: "c1" },
      WORKSPACE_ID,
    );
    expect(result).toBeNull();
  });

  it("retorna null quando ainda faltam ações irmãs", () => {
    const state = baseState();
    state.node_states.a2 = { status: "DONE", started_at: null, completed_at: null, blocked_reason: null, evidence_count: 0, updated_at: "x" };
    const result = deriveSynthesisCompletion(
      nodes,
      state,
      { event_type: "action.completed", workspace_id: WORKSPACE_ID, data: { node_id: "a1" }, actor: { type: "USER", id: "u1" }, correlation_id: "c1" },
      WORKSPACE_ID,
    );
    expect(result).toBeNull(); // a3 continua TODO
  });

  it("emite synthesis.completed com actor SYSTEM quando a última ação fecha o bloco", () => {
    const state = baseState();
    state.node_states.a1 = { status: "DONE", started_at: null, completed_at: null, blocked_reason: null, evidence_count: 0, updated_at: "x" };
    state.node_states.a2 = { status: "DONE", started_at: null, completed_at: null, blocked_reason: null, evidence_count: 0, updated_at: "x" };
    const result = deriveSynthesisCompletion(
      nodes,
      state,
      { event_type: "action.completed", workspace_id: WORKSPACE_ID, data: { node_id: "a3" }, actor: { type: "USER", id: "u1" }, correlation_id: "c3" },
      WORKSPACE_ID,
    );
    expect(result?.event_type).toBe("synthesis.completed");
    expect(result?.actor).toEqual({ type: "SYSTEM", id: "system" });
    expect(result?.data.node_id).toBe("synth1");
  });

  it("retorna null quando a síntese já está DONE (evita duplicar o evento)", () => {
    const state = baseState();
    state.node_states.a1 = { status: "DONE", started_at: null, completed_at: null, blocked_reason: null, evidence_count: 0, updated_at: "x" };
    state.node_states.a2 = { status: "DONE", started_at: null, completed_at: null, blocked_reason: null, evidence_count: 0, updated_at: "x" };
    state.node_states.synth1 = { status: "DONE", started_at: null, completed_at: null, blocked_reason: null, evidence_count: 0, updated_at: "x" };
    const result = deriveSynthesisCompletion(
      nodes,
      state,
      { event_type: "action.completed", workspace_id: WORKSPACE_ID, data: { node_id: "a3" }, actor: { type: "USER", id: "u1" }, correlation_id: "c3" },
      WORKSPACE_ID,
    );
    expect(result).toBeNull();
  });
});
