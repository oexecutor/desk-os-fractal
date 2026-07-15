import { describe, expect, it } from "vitest";
import { projectMaterializedState } from "./projector.js";
import type { DomainEvent } from "@desk-os/domain";

function event(overrides: Partial<DomainEvent>): DomainEvent {
  return {
    schema_version: "1.0.0",
    event_id: "evt",
    event_type: "action.started",
    workspace_id: "ws-1",
    stream_id: "plan-1",
    stream_version: 1,
    occurred_at: "2026-07-14T08:00:00Z",
    actor: { type: "USER", id: "u1" },
    data: {},
    correlation_id: "c1",
    ...overrides,
  };
}

describe("projectMaterializedState — ADR-0006 reconstrução determinística", () => {
  it("reduz action.started -> action.completed para status DONE com evidence separada", () => {
    const events: DomainEvent[] = [
      event({ event_type: "action.started", stream_version: 1, data: { node_id: "n1" } }),
      event({
        event_type: "evidence.added",
        stream_version: 2,
        data: { node_id: "n1" },
      }),
      event({ event_type: "action.completed", stream_version: 3, data: { node_id: "n1" } }),
    ];
    const state = projectMaterializedState("ws-1", "plan-1", events);
    expect(state.node_states.n1?.status).toBe("DONE");
    // AT-024: evidência não é inferida a partir da conclusão nem vice-versa.
    expect(state.node_states.n1?.evidence_count).toBe(1);
    expect(state.stream_version).toBe(3);
  });

  it("node.focused atualiza focused_node_id sem tocar node_states", () => {
    const events: DomainEvent[] = [
      event({ event_type: "node.focused", stream_version: 1, data: { node_id: "n2" } }),
    ];
    const state = projectMaterializedState("ws-1", "plan-1", events);
    expect(state.focused_node_id).toBe("n2");
    expect(state.node_states).toEqual({});
  });

  it("action.blocked / action.unblocked alternam status e blocked_reason", () => {
    const events: DomainEvent[] = [
      event({
        event_type: "action.blocked",
        stream_version: 1,
        data: { node_id: "n3", reason: "aguardando cliente" },
      }),
    ];
    let state = projectMaterializedState("ws-1", "plan-1", events);
    expect(state.node_states.n3?.status).toBe("BLOCKED");
    expect(state.node_states.n3?.blocked_reason).toBe("aguardando cliente");

    state = projectMaterializedState("ws-1", "plan-1", [
      ...events,
      event({ event_type: "action.unblocked", stream_version: 2, data: { node_id: "n3" } }),
    ]);
    expect(state.node_states.n3?.status).toBe("TODO");
    expect(state.node_states.n3?.blocked_reason).toBeNull();
  });

  it("replay do mesmo stream é determinístico (mesma entrada -> mesma saída)", () => {
    const events: DomainEvent[] = [
      event({ event_type: "action.started", stream_version: 1, data: { node_id: "n1" } }),
      event({ event_type: "action.completed", stream_version: 2, data: { node_id: "n1" } }),
    ];
    const a = projectMaterializedState("ws-1", "plan-1", events);
    const b = projectMaterializedState("ws-1", "plan-1", events);
    expect(a).toEqual(b);
  });
});
