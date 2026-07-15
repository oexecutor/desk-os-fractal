import { describe, expect, it } from "vitest";
import { VersionConflictError } from "@desk-os/events";
import { MemoryBlobStore } from "./blob-store.js";
import { BlobEventStore } from "./blob-event-store.js";

describe("BlobEventStore — mesma semântica do InMemoryEventStore", () => {
  it("respeita expected_version e idempotency_key sobre um BlobStore genérico", async () => {
    const store = new BlobEventStore(new MemoryBlobStore(), "ws-1");

    const first = await store.append({
      streamId: "plan-1",
      expectedVersion: 0,
      idempotencyKey: "k1",
      events: [
        {
          event_type: "action.started",
          workspace_id: "ws-1",
          data: { node_id: "n1" },
          actor: { type: "USER", id: "u1" },
          correlation_id: "c1",
        },
      ],
    });
    expect(first.streamVersion).toBe(1);

    await expect(
      store.append({
        streamId: "plan-1",
        expectedVersion: 0,
        events: [
          {
            event_type: "action.completed",
            workspace_id: "ws-1",
            data: { node_id: "n1" },
            actor: { type: "USER", id: "u1" },
            correlation_id: "c2",
          },
        ],
      }),
    ).rejects.toThrow(VersionConflictError);

    const replay = await store.append({
      streamId: "plan-1",
      expectedVersion: 0,
      idempotencyKey: "k1",
      events: [
        {
          event_type: "action.started",
          workspace_id: "ws-1",
          data: { node_id: "n1" },
          actor: { type: "USER", id: "u1" },
          correlation_id: "c1",
        },
      ],
    });
    expect(replay.replayed).toBe(true);
    expect(replay.events).toEqual(first.events);

    const stream = await store.readStream("plan-1");
    expect(stream).toHaveLength(1);
  });
});
