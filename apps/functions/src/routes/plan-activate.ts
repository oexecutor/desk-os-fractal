import type { Config, Context } from "@netlify/functions";
import { createId } from "@desk-os/domain";
import { activatePlan } from "@desk-os/approval";
import { getAppContext } from "../context.js";
import { assertPilotAuth } from "../auth.js";
import { errorResponse, mapErrorToResponse } from "../http.js";

export default async function handler(request: Request, context: Context): Promise<Response> {
  const correlationId = createId();
  try {
    const ctx = getAppContext();
    assertPilotAuth(request, ctx.pilotBearerToken);

    const planVersionId = context.params.planVersionId;
    if (!planVersionId) return errorResponse("VALIDATION_FAILED", "planVersionId ausente.", correlationId);

    const body = (await request.json()) as { expected_version: number; idempotency_key: string };
    if (typeof body.expected_version !== "number" || !body.idempotency_key) {
      return errorResponse("VALIDATION_FAILED", "expected_version e idempotency_key são obrigatórios.", correlationId);
    }

    await activatePlan(ctx.storage, {
      planVersionId,
      expectedVersion: body.expected_version,
      idempotencyKey: body.idempotency_key,
      actorId: "pilot-user",
    });
    return new Response(null, { status: 200 });
  } catch (err) {
    return mapErrorToResponse(err, correlationId);
  }
}

export const config: Config = { path: "/api/plans/:planVersionId/activate" };
