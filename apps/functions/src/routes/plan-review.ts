import type { Config, Context } from "@netlify/functions";
import { createId } from "@desk-os/domain";
import { startReview } from "@desk-os/approval";
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

    await startReview(ctx.storage, planVersionId, "pilot-user");
    return new Response(null, { status: 200 });
  } catch (err) {
    return mapErrorToResponse(err, correlationId);
  }
}

export const config: Config = { path: "/api/plans/:planVersionId/review" };
