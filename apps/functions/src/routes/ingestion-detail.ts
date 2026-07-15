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

    const ingestionId = context.params.ingestionId;
    if (!ingestionId) return errorResponse("VALIDATION_FAILED", "ingestionId ausente.", correlationId);

    const job = await ctx.storage.ingestionJobs.get(ingestionId);
    if (!job) return errorResponse("NOT_FOUND", "Ingestão não encontrada.", correlationId);

    return json(job);
  } catch (err) {
    return mapErrorToResponse(err, correlationId);
  }
}

export const config: Config = { path: "/api/ingestions/:ingestionId" };
