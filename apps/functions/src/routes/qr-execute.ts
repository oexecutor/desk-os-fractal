import type { Config, Context } from "@netlify/functions";
import { createId } from "@desk-os/domain";
import { projectMaterializedState } from "@desk-os/events";
import { assertTokenUsable, executeQrCommand, findQrTokenRecord, recordTokenUse } from "@desk-os/qr";
import { getAppContext } from "../context.js";
import { errorResponse, json, mapErrorToResponse } from "../http.js";

export default async function handler(request: Request, context: Context): Promise<Response> {
  const correlationId = createId();
  try {
    const ctx = getAppContext();
    const token = context.params.token;
    if (!token) return errorResponse("VALIDATION_FAILED", "token ausente.", correlationId);

    const body = (await request.json()) as {
      confirmed: boolean;
      idempotency_key: string;
      expected_version: number;
      recycle_decision?: "CONTINUE" | "REDUCE" | "SPLIT" | "RECONFIGURE";
    };
    if (!body.confirmed || !body.idempotency_key || typeof body.expected_version !== "number") {
      return errorResponse("VALIDATION_FAILED", "confirmed, idempotency_key e expected_version são obrigatórios.", correlationId);
    }

    const record = await findQrTokenRecord(ctx.storage.qrTokens, token);
    if (!record) return errorResponse("NOT_FOUND", "Token não encontrado.", correlationId);
    assertTokenUsable(record, new Date());

    const planVersionId = record.target.plan_version_id;
    const plan = planVersionId ? await ctx.storage.planVersions.get(planVersionId) : null;
    if (!plan) return errorResponse("NOT_FOUND", "Plano associado ao token não encontrado.", correlationId);

    const eventStore = ctx.storage.eventStoreFor(record.workspace_id);
    const state = projectMaterializedState(record.workspace_id, plan.id, await eventStore.readStream(plan.id));

    const result = await executeQrCommand({
      eventStore,
      record,
      plan,
      state,
      confirmed: body.confirmed,
      idempotencyKey: body.idempotency_key,
      expectedVersion: body.expected_version,
      actorId: `qr:${record.id}`,
      ...(body.recycle_decision ? { recycleDecision: body.recycle_decision } : {}),
    });

    await recordTokenUse(ctx.storage.qrTokens, record);

    return json({ events: result.events, replayed: result.replayed });
  } catch (err) {
    return mapErrorToResponse(err, correlationId);
  }
}

export const config: Config = { path: "/api/qr/:token/execute" };
