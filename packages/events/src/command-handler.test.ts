import { describe, expect, it } from "vitest";
import { InMemoryEventStore } from "./event-store.js";
import { handleCommand } from "./command-handler.js";
import { PlanNotActiveError, NodeNotFoundError } from "./errors.js";
import type { DomainCommand } from "./commands.js";

function command(overrides: Partial<DomainCommand> = {}): DomainCommand {
  return {
    schema_version: "1.0.0",
    command_id: "cmd-1",
    command_type: "COMPLETE_ACTION",
    workspace_id: "ws-1",
    stream_id: "plan-1",
    expected_version: 0,
    idempotency_key: "idem-1",
    actor: { type: "USER", id: "u1" },
    data: { node_id: "n1" },
    ...overrides,
  };
}

describe("handleCommand — AT-011 (PLAN_NOT_ACTIVE)", () => {
  it("rejeita evento de execução quando o plano não está ACTIVE", async () => {
    const store = new InMemoryEventStore();
    await expect(
      handleCommand(store, command(), { planLifecycleState: "GENERATED" }),
    ).rejects.toThrow(PlanNotActiveError);
  });

  it("aceita quando o plano está ACTIVE e produz o evento correspondente", async () => {
    const store = new InMemoryEventStore();
    const result = await handleCommand(store, command(), { planLifecycleState: "ACTIVE" });
    expect(result.replayed).toBe(false);
    expect(result.events[0]?.event_type).toBe("action.completed");
  });

  it("APPROVE_PLAN/ACTIVATE_PLAN não exigem ACTIVE (são as próprias transições de lifecycle)", async () => {
    const store = new InMemoryEventStore();
    const result = await handleCommand(
      store,
      command({ command_type: "ACTIVATE_PLAN", data: {} }),
      { planLifecycleState: "APPROVED" },
    );
    expect(result.events[0]?.event_type).toBe("plan.activated");
  });

  it("rejeita node_id inexistente no plano ativo", async () => {
    const store = new InMemoryEventStore();
    await expect(
      handleCommand(store, command(), {
        planLifecycleState: "ACTIVE",
        nodeExists: () => false,
      }),
    ).rejects.toThrow(NodeNotFoundError);
  });

  it("replay por idempotency_key ignora regras de negócio (plano pode já ter mudado de estado)", async () => {
    const store = new InMemoryEventStore();
    const first = await handleCommand(store, command(), { planLifecycleState: "ACTIVE" });
    const second = await handleCommand(store, command(), { planLifecycleState: "SUPERSEDED" });
    expect(second.replayed).toBe(true);
    expect(second.events).toEqual(first.events);
  });
});
