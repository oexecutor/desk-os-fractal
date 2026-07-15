import type { Config, Context } from "@netlify/functions";
import { createId } from "@desk-os/domain";
import { projectMaterializedState } from "@desk-os/events";
import { getAppContext } from "../context.js";
import { assertPilotAuth } from "../auth.js";
import { errorResponse, json, mapErrorToResponse } from "../http.js";

export default async function handler(request: Request, context: Context): Promise<Response> {
  const correlationId = createId();
  try {
    const ctx = getAppContext();
    assertPilotAuth(request, ctx.pilotBearerToken);

    const workspaceId = context.params.workspaceId;
    if (!workspaceId) return errorResponse("VALIDATION_FAILED", "workspaceId ausente.", correlationId);

    const activePlanId = await ctx.storage.getActivePlanVersion(workspaceId);
    if (!activePlanId) return errorResponse("NOT_FOUND", "Nenhum plano ativo para este workspace.", correlationId);

    const plan = await ctx.storage.planVersions.get(activePlanId);
    if (!plan) return errorResponse("NOT_FOUND", "Plano ativo referenciado não existe.", correlationId);

    const eventStore = ctx.storage.eventStoreFor(workspaceId);
    const events = await eventStore.readStream(activePlanId);
    const state = projectMaterializedState(workspaceId, activePlanId, events);

    return json({ plan, state });
  } catch (err) {
    return mapErrorToResponse(err, correlationId);
  }
}

export const config: Config = { path: "/api/workspaces/:workspaceId/tree" };
