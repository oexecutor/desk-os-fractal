import { assertTransition, createId, type PlanVersion } from "@desk-os/domain";
import { handleCommand, type EventStore } from "@desk-os/events";
import type { JsonRepository } from "@desk-os/storage";

export interface ApprovalStorage {
  planVersions: JsonRepository<PlanVersion>;
  eventStoreFor(workspaceId: string): EventStore;
  setActivePlanVersion(workspaceId: string, planVersionId: string): Promise<void>;
  getActivePlanVersion(workspaceId: string): Promise<string | null>;
}

export class PlanNotFoundError extends Error {
  constructor(public readonly planVersionId: string) {
    super(`Plano inexistente: ${planVersionId}`);
    this.name = "PlanNotFoundError";
  }
}

async function loadPlanOrThrow(
  storage: ApprovalStorage,
  planVersionId: string,
): Promise<PlanVersion> {
  const plan = await storage.planVersions.get(planVersionId);
  if (!plan) throw new PlanNotFoundError(planVersionId);
  return plan;
}

/** specs/PLAN_LIFECYCLE.md: GENERATED -> IN_REVIEW. Abre a revisão humana. */
export async function startReview(
  storage: ApprovalStorage,
  planVersionId: string,
  actorId: string,
): Promise<PlanVersion> {
  const plan = await loadPlanOrThrow(storage, planVersionId);
  assertTransition(plan.lifecycle_state, "IN_REVIEW");

  const eventStore = storage.eventStoreFor(plan.workspace_id);
  const streamVersion = await eventStore.getVersion(planVersionId);
  await eventStore.append({
    streamId: planVersionId,
    expectedVersion: streamVersion,
    events: [
      {
        event_type: "plan.review_started",
        workspace_id: plan.workspace_id,
        data: { plan_version_id: planVersionId },
        actor: { type: "USER", id: actorId },
        correlation_id: planVersionId,
      },
    ],
  });

  const updated: PlanVersion = { ...plan, lifecycle_state: "IN_REVIEW" };
  await storage.planVersions.save(planVersionId, updated);
  return updated;
}

export interface ApprovePlanInput {
  planVersionId: string;
  expectedVersion: number;
  idempotencyKey: string;
  actorId: string;
  note?: string;
}

/** specs/PLAN_LIFECYCLE.md: IN_REVIEW -> APPROVED. */
export async function approvePlan(
  storage: ApprovalStorage,
  input: ApprovePlanInput,
): Promise<PlanVersion> {
  const plan = await loadPlanOrThrow(storage, input.planVersionId);

  if (plan.lifecycle_state === "APPROVED" || plan.lifecycle_state === "ACTIVE") {
    // possível replay: a transição já ocorreu, o command-handler abaixo
    // confirma via idempotency_key e devolve o estado atual sem reaplicar.
  } else {
    assertTransition(plan.lifecycle_state, "APPROVED");
  }

  const eventStore = storage.eventStoreFor(plan.workspace_id);
  const result = await handleCommand(
    eventStore,
    {
      schema_version: "1.0.0",
      command_id: createId(),
      command_type: "APPROVE_PLAN",
      workspace_id: plan.workspace_id,
      stream_id: input.planVersionId,
      expected_version: input.expectedVersion,
      idempotency_key: input.idempotencyKey,
      actor: { type: "USER", id: input.actorId },
      data: { plan_version_id: input.planVersionId, note: input.note ?? null },
    },
    { planLifecycleState: plan.lifecycle_state },
  );

  if (result.replayed) {
    return plan;
  }

  const updated: PlanVersion = {
    ...plan,
    lifecycle_state: "APPROVED",
    approved_at: new Date().toISOString(),
    approved_by: input.actorId,
  };
  await storage.planVersions.save(input.planVersionId, updated);
  return updated;
}

export interface ActivatePlanInput {
  planVersionId: string;
  expectedVersion: number;
  idempotencyKey: string;
  actorId: string;
}

export interface ActivatePlanResult {
  plan: PlanVersion;
  supersededPlanVersionId: string | null;
}

/**
 * specs/PLAN_LIFECYCLE.md "Ativação": valida versão esperada, valida
 * ausência de bloqueios críticos, marca a versão anterior como SUPERSEDED,
 * ativa a nova versão e emite `plan.activated`. Atômico o suficiente para o
 * piloto de usuário único (ver limitação documentada em BlobEventStore).
 */
export async function activatePlan(
  storage: ApprovalStorage,
  input: ActivatePlanInput,
): Promise<ActivatePlanResult> {
  const plan = await loadPlanOrThrow(storage, input.planVersionId);

  if (plan.lifecycle_state !== "ACTIVE") {
    assertTransition(plan.lifecycle_state, "ACTIVE");
  }
  if (!plan.validation_report.valid) {
    throw new Error("PLAN_NOT_ACTIVE: plano possui bloqueios críticos e não pode ser ativado.");
  }

  const eventStore = storage.eventStoreFor(plan.workspace_id);
  const result = await handleCommand(
    eventStore,
    {
      schema_version: "1.0.0",
      command_id: createId(),
      command_type: "ACTIVATE_PLAN",
      workspace_id: plan.workspace_id,
      stream_id: input.planVersionId,
      expected_version: input.expectedVersion,
      idempotency_key: input.idempotencyKey,
      actor: { type: "USER", id: input.actorId },
      data: { plan_version_id: input.planVersionId },
    },
    { planLifecycleState: plan.lifecycle_state },
  );

  if (result.replayed) {
    return { plan, supersededPlanVersionId: await storage.getActivePlanVersion(plan.workspace_id) };
  }

  const previousActiveId = await storage.getActivePlanVersion(plan.workspace_id);
  let supersededPlanVersionId: string | null = null;
  if (previousActiveId && previousActiveId !== input.planVersionId) {
    const previousActive = await storage.planVersions.get(previousActiveId);
    if (previousActive && previousActive.lifecycle_state === "ACTIVE") {
      await storage.planVersions.save(previousActiveId, {
        ...previousActive,
        lifecycle_state: "SUPERSEDED",
      });
      supersededPlanVersionId = previousActiveId;
    }
  }

  const updated: PlanVersion = { ...plan, lifecycle_state: "ACTIVE" };
  await storage.planVersions.save(input.planVersionId, updated);
  await storage.setActivePlanVersion(plan.workspace_id, input.planVersionId);

  return { plan: updated, supersededPlanVersionId };
}
