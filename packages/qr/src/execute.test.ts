import { describe, expect, it } from "vitest";
import { InMemoryEventStore } from "@desk-os/events";
import { resolveQrToken, executeQrCommand, QrConfirmationRequiredError, QrRecycleDecisionRequiredError } from "./execute.js";
import { resolveCurrentAction } from "./resolve-current-action.js";
import { projectMaterializedState } from "@desk-os/events";
import { buildTwoBlockPlan, emptyState, WORKSPACE_ID } from "./test-fixtures.js";
import type { QrTokenRecord } from "./qr-token.js";

function currentActionToken(): QrTokenRecord {
  return {
    schema_version: "1.1.0",
    id: "qrtoken00000000000001",
    token_hash: "a".repeat(64),
    workspace_id: WORKSPACE_ID,
    kind: "OPEN_CURRENT_ACTION",
    target: { strategy: "CURRENT_ACTION", sprint_id: "sprint000000000001", plan_version_id: "plan0000000000000001" },
    minimum_plan_state: "ACTIVE",
    created_at: "2026-07-13T08:00:00Z",
    expires_at: null,
    revoked: false,
    max_uses: null,
    use_count: 0,
    authentication_policy: "REQUIRED",
  };
}

describe("resolveQrToken — GET nunca muta (AT-037/AT-038)", () => {
  it("VIEW_CONTEXT nunca exige confirmação nem afirma mutação", () => {
    const plan = buildTwoBlockPlan();
    const token: QrTokenRecord = { ...currentActionToken(), kind: "VIEW_CONTEXT", target: { strategy: "CURRENT_CONTEXT" } };
    const response = resolveQrToken(token, plan, emptyState());
    expect(response.mutates_state).toBe(false);
    expect(response.confirmation_required).toBe(false);
  });

  it("OPEN_CURRENT_ACTION resolve sem tocar o event store", async () => {
    const plan = buildTwoBlockPlan();
    const eventStore = new InMemoryEventStore();
    const response = resolveQrToken(currentActionToken(), plan, emptyState());
    expect(response.kind).toBe("ACTION");
    expect(await eventStore.getVersion(plan.id)).toBe(0);
  });
});

describe("executeQrCommand — POST mutável (AT-039/AT-041)", () => {
  it("exige confirmed=true", async () => {
    const plan = buildTwoBlockPlan();
    const eventStore = new InMemoryEventStore();
    await expect(
      executeQrCommand({
        eventStore,
        record: currentActionToken(),
        plan,
        state: emptyState(),
        confirmed: false,
        idempotencyKey: "idem-0000000000000001",
        expectedVersion: 0,
        actorId: "scanner-1",
      }),
    ).rejects.toThrow(QrConfirmationRequiredError);
  });

  it("START_ACTION para a primeira ação TODO elegível", async () => {
    const plan = buildTwoBlockPlan();
    const eventStore = new InMemoryEventStore();
    const result = await executeQrCommand({
      eventStore,
      record: currentActionToken(),
      plan,
      state: emptyState(),
      confirmed: true,
      idempotencyKey: "idem-0000000000000002",
      expectedVersion: 0,
      actorId: "scanner-1",
    });
    expect(result.events[0]?.event_type).toBe("action.started");
    expect(result.events[0]?.data.node_id).toBe("segaction0000000001");
  });

  it("AT-041: idempotency_key repetida retorna o resultado original sem duplicar evento", async () => {
    const plan = buildTwoBlockPlan();
    const eventStore = new InMemoryEventStore();
    const input = {
      eventStore,
      record: currentActionToken(),
      plan,
      state: emptyState(),
      confirmed: true,
      idempotencyKey: "idem-0000000000000003",
      expectedVersion: 0,
      actorId: "scanner-1",
    };
    const first = await executeQrCommand(input);
    const second = await executeQrCommand(input);
    expect(second.replayed).toBe(true);
    expect(second.events).toEqual(first.events);
    expect(await eventStore.getVersion(plan.id)).toBe(1);
  });

  it("completar a 3ª ação de um bloco fecha o LINK automaticamente (nunca manual)", async () => {
    const plan = buildTwoBlockPlan();
    const eventStore = new InMemoryEventStore();

    // ação 1 e 2 já concluídas fora do fluxo QR.
    await eventStore.append({
      streamId: plan.id,
      expectedVersion: 0,
      events: [
        { event_type: "action.completed", workspace_id: WORKSPACE_ID, data: { node_id: "segaction0000000001" }, actor: { type: "USER", id: "u1" }, correlation_id: "c1" },
        { event_type: "action.completed", workspace_id: WORKSPACE_ID, data: { node_id: "segaction0000000002" }, actor: { type: "USER", id: "u1" }, correlation_id: "c2" },
      ],
    });

    let state = projectMaterializedState(WORKSPACE_ID, plan.id, await eventStore.readStream(plan.id));
    // 3ª ação está IN_PROGRESS (simula que o usuário já a iniciou).
    await eventStore.append({
      streamId: plan.id,
      expectedVersion: state.stream_version,
      events: [
        { event_type: "action.started", workspace_id: WORKSPACE_ID, data: { node_id: "segaction0000000003" }, actor: { type: "USER", id: "u1" }, correlation_id: "c3" },
      ],
    });
    state = projectMaterializedState(WORKSPACE_ID, plan.id, await eventStore.readStream(plan.id));

    const resolution = resolveCurrentAction(plan, state);
    expect(resolution.resolved_kind).toBe("ACTION");
    expect(resolution.action_status).toBe("IN_PROGRESS");

    const result = await executeQrCommand({
      eventStore,
      record: currentActionToken(),
      plan,
      state,
      confirmed: true,
      idempotencyKey: "idem-0000000000000004",
      expectedVersion: state.stream_version,
      actorId: "scanner-1",
    });

    expect(result.events).toHaveLength(2);
    expect(result.events[0]?.event_type).toBe("action.completed");
    expect(result.events[1]?.event_type).toBe("synthesis.completed");
    expect(result.events[1]?.actor.type).toBe("SYSTEM");
    expect(result.events[1]?.data.node_id).toBe("segsynthesis00000001");

    const finalState = projectMaterializedState(WORKSPACE_ID, plan.id, await eventStore.readStream(plan.id));
    expect(finalState.node_states["segsynthesis00000001"]?.status).toBe("DONE");
  });

  it("RECYCLE exige recycleDecision explícita", async () => {
    const plan = buildTwoBlockPlan();
    const eventStore = new InMemoryEventStore();
    let state = emptyState();
    for (const id of ["blockseg000000000001", "blockter000000000001"]) {
      state = { ...state, node_states: { ...state.node_states, [id]: { status: "DONE", started_at: null, completed_at: null, blocked_reason: null, evidence_count: 0, updated_at: "2026-07-13T08:00:00Z" } } };
    }

    await expect(
      executeQrCommand({
        eventStore,
        record: currentActionToken(),
        plan,
        state,
        confirmed: true,
        idempotencyKey: "idem-0000000000000005",
        expectedVersion: 0,
        actorId: "scanner-1",
      }),
    ).rejects.toThrow(QrRecycleDecisionRequiredError);
  });

  it("plano não ACTIVE nunca executa via QR", async () => {
    const plan = buildTwoBlockPlan({ lifecycle_state: "SUPERSEDED" });
    const eventStore = new InMemoryEventStore();
    await expect(
      executeQrCommand({
        eventStore,
        record: currentActionToken(),
        plan,
        state: emptyState(),
        confirmed: true,
        idempotencyKey: "idem-0000000000000006",
        expectedVersion: 0,
        actorId: "scanner-1",
      }),
    ).rejects.toThrow(/PLAN_NOT_ACTIVE/);
  });
});
