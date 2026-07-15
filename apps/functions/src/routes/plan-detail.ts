import type { Config, Context } from "@netlify/functions";
import { createId } from "@desk-os/domain";
import { getAppContext } from "../context.js";
import { assertPilotAuth } from "../auth.js";
import { errorResponse, json, mapErrorToResponse } from "../http.js";

export default async function handler(request: Request, context: Context): Promise<Response> {
  const correlationId = createId();
  try {
    const ctx = getAppContext();
    assertPilotAuth(request, ctx.pilotBearerToken);

    const planVersionId = context.params.planVersionId;
    if (!planVersionId) return errorResponse("VALIDATION_FAILED", "planVersionId ausente.", correlationId);

    const plan = await ctx.storage.planVersions.get(planVersionId);
    if (!plan) return errorResponse("NOT_FOUND", "Plano não encontrado.", correlationId);

    return json(plan);
  } catch (err) {
    return mapErrorToResponse(err, correlationId);
  }
}

export const config: Config = { path: "/api/plans/:planVersionId" };
