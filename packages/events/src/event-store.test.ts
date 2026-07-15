import { describe, expect, it } from "vitest";
import { InMemoryEventStore } from "./event-store.js";
import { VersionConflictError } from "./errors.js";

function makeStore() {
  return new InMemoryEventStore();
}

describe("InMemoryEventStore.append — AT-021 / AT-022", () => {
  it("anexa evento e avança a versão do stream", async () => {
    const store = makeStore();
    const result = await store.append({
      streamId: "plan-1",
      expectedVersion: 0,
      idempotencyKey: "key-1",
      events: [
        {
          event_type: "action.started",
          workspace_id: "ws-1",
          data: { node_id: "node-1" },
          actor: { type: "USER", id: "user-1" },
          correlation_id: "corr-1",
        },
      ],
    });
    expect(result.replayed).toBe(false);
    expect(result.streamVersion).toBe(1);
    expect(result.events[0]?.stream_version).toBe(1);
    expect(await store.getVersion("plan-1")).toBe(1);
  });

  it("AT-022: expected_version divergente lança VersionConflictError sem anexar", async () => {
    const store = makeStore();
    await store.append({
      streamId: "plan-1",
      expectedVersion: 0,
      events: [
        {
          event_type: "action.started",
          workspace_id: "ws-1",
          data: {},
          actor: { type: "USER", id: "u1" },
          correlation_id: "c1",
        },
      ],
    });

    await expect(
      store.append({
        streamId: "plan-1",
        expectedVersion: 0, // deveria ser 1
        events: [
          {
            event_type: "action.completed",
            workspace_id: "ws-1",
            data: {},
            actor: { type: "USER", id: "u1" },
            correlation_id: "c2",
          },
        ],
      }),
    ).rejects.toThrow(VersionConflictError);

    expect(await store.getVersion("plan-1")).toBe(1);
  });

  it("AT-041: comando repetido com a mesma idempotency_key retorna o resultado original", async () => {
    const store = makeStore();
    const input = {
      streamId: "plan-1",
      expectedVersion: 0,
      idempotencyKey: "same-key",
      events: [
        {
          event_type: "action.completed" as const,
          workspace_id: "ws-1",
          data: { node_id: "n1" },
          actor: { type: "USER" as const, id: "u1" },
          correlation_id: "c1",
        },
      ],
    };
    const first = await store.append(input);
    const second = await store.append(input);

    expect(second.replayed).toBe(true);
    expect(second.events).toEqual(first.events);
    expect(await store.getVersion("plan-1")).toBe(1); // não duplicou
  });

  it("peekIdempotency retorna null quando a chave nunca foi usada", async () => {
    const store = makeStore();
    expect(await store.peekIdempotency("plan-1", "nunca-visto")).toBeNull();
  });
});
