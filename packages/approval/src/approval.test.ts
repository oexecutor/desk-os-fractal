import { beforeEach, describe, expect, it } from "vitest";
import { createStorage, type Storage } from "@desk-os/storage";
import type { PlanVersion } from "@desk-os/domain";
import { InvalidLifecycleTransitionError } from "@desk-os/domain";
import { activatePlan, approvePlan, PlanNotFoundError, startReview } from "./approval.js";

const WORKSPACE_ID = "0123456789abcdef0001";

type TestPlanInput = Partial<Record<keyof PlanVersion, unknown>>;

function makePlan(overrides: TestPlanInput = {}): PlanVersion {
  return {
    schema_version: "1.0.0",
    id: "plan0000000000000001",
    workspace_id: WORKSPACE_ID,
    version: 1,
    lifecycle_state: "GENERATED",
    root_node_ids: ["node00000000000001"],
    nodes: [
      {
        schema_version: "1.0.0",
        id: "node00000000000001",
        workspace_id: WORKSPACE_ID,
        project_id: null,
        plan_version_id: "plan0000000000000001",
        parent_id: null,
        node_type: "project",
        title: "Projeto",
        order: 0,
        depth: 0,
        status: "TODO",
        completion_rule: { kind: "NONE" },
        source_refs: [],
        metadata: {},
      },
    ] as unknown as PlanVersion["nodes"],
    validation_report: { valid: true, errors: [], warnings: [], gaps: [] },
    created_at: "2026-07-14T08:00:00Z",
    approved_at: null,
    approved_by: null,
    ...overrides,
  } as PlanVersion;
}

let storage: Storage<unknown, PlanVersion, unknown, unknown, unknown>;

beforeEach(async () => {
  storage = createStorage<unknown, PlanVersion, unknown, unknown, unknown>({ adapter: "memory" });
});

describe("startReview / approvePlan / activatePlan — specs/PLAN_LIFECYCLE.md", () => {
  it("PlanNotFoundError quando o plano não existe", async () => {
    await expect(startReview(storage, "nao-existe", "u1")).rejects.toThrow(
      PlanNotFoundError,
    );
  });

  it("segue a sequência normativa GENERATED -> IN_REVIEW -> APPROVED -> ACTIVE", async () => {
    const plan = makePlan();
    await storage.planVersions.save(plan.id, plan);

    const inReview = await startReview(storage, plan.id, "u1");
    expect(inReview.lifecycle_state).toBe("IN_REVIEW");

    const approved = await approvePlan(storage, {
      planVersionId: plan.id,
      expectedVersion: 1,
      idempotencyKey: "idem-approve-0000001",
      actorId: "u1",
    });
    expect(approved.lifecycle_state).toBe("APPROVED");
    expect(approved.approved_by).toBe("u1");

    const { plan: active, supersededPlanVersionId } = await activatePlan(storage, {
      planVersionId: plan.id,
      expectedVersion: 2,
      idempotencyKey: "idem-activate-000001",
      actorId: "u1",
    });
    expect(active.lifecycle_state).toBe("ACTIVE");
    expect(supersededPlanVersionId).toBeNull();
    expect(await storage.getActivePlanVersion(WORKSPACE_ID)).toBe(plan.id);
  });

  it("rejeita pular etapa (GENERATED -> APPROVED direto)", async () => {
    const plan = makePlan();
    await storage.planVersions.save(plan.id, plan);
    await expect(
      approvePlan(storage, {
        planVersionId: plan.id,
        expectedVersion: 0,
        idempotencyKey: "idem-skip-0000000001",
        actorId: "u1",
      }),
    ).rejects.toThrow(InvalidLifecycleTransitionError);
  });

  it("ativar uma nova versão marca a anterior como SUPERSEDED", async () => {
    const planA = makePlan({ id: "planA000000000000001" });
    await storage.planVersions.save(planA.id, planA);
    await startReview(storage, planA.id, "u1");
    await approvePlan(storage, {
      planVersionId: planA.id,
      expectedVersion: 1,
      idempotencyKey: "idem-a-approve-00001",
      actorId: "u1",
    });
    await activatePlan(storage, {
      planVersionId: planA.id,
      expectedVersion: 2,
      idempotencyKey: "idem-a-activate-0001",
      actorId: "u1",
    });

    const planB = makePlan({
      id: "planB000000000000001",
      root_node_ids: ["node00000000000002"] as unknown as PlanVersion["root_node_ids"],
      nodes: [{ ...planA.nodes[0]!, id: "node00000000000002", plan_version_id: "planB000000000000001" }] as unknown as PlanVersion["nodes"],
    });
    await storage.planVersions.save(planB.id, planB);
    await startReview(storage, planB.id, "u1");
    await approvePlan(storage, {
      planVersionId: planB.id,
      expectedVersion: 1,
      idempotencyKey: "idem-b-approve-00001",
      actorId: "u1",
    });
    const { supersededPlanVersionId } = await activatePlan(storage, {
      planVersionId: planB.id,
      expectedVersion: 2,
      idempotencyKey: "idem-b-activate-0001",
      actorId: "u1",
    });

    expect(supersededPlanVersionId).toBe(planA.id);
    const reloadedA = await storage.planVersions.get(planA.id);
    expect(reloadedA?.lifecycle_state).toBe("SUPERSEDED");
    expect(await storage.getActivePlanVersion(WORKSPACE_ID)).toBe(planB.id);
  });

  it("replay de approvePlan com mesma idempotency_key não duplica a transição", async () => {
    const plan = makePlan();
    await storage.planVersions.save(plan.id, plan);
    await startReview(storage, plan.id, "u1");

    const input = {
      planVersionId: plan.id,
      expectedVersion: 1,
      idempotencyKey: "idem-replay-000000001",
      actorId: "u1",
    };
    const first = await approvePlan(storage, input);
    const second = await approvePlan(storage, input);
    expect(second.lifecycle_state).toBe("APPROVED");
    expect(second.approved_at).toBe(first.approved_at);
  });

  it("bloqueia ativação de plano com validation_report inválido", async () => {
    const plan = makePlan({
      lifecycle_state: "APPROVED",
      approved_at: "2026-07-14T09:00:00Z",
      approved_by: "u1",
      validation_report: { valid: false, errors: ["bloco incompleto"], warnings: [], gaps: [] },
    });
    await storage.planVersions.save(plan.id, plan);
    await expect(
      activatePlan(storage, {
        planVersionId: plan.id,
        expectedVersion: 0,
        idempotencyKey: "idem-blocked-0000001",
        actorId: "u1",
      }),
    ).rejects.toThrow(/PLAN_NOT_ACTIVE/);
  });
});
