import type { Config, Context } from "@netlify/functions";
import { createId } from "@desk-os/domain";
import { handleCommand, projectMaterializedState, type DomainCommand } from "@desk-os/events";
import { getAppContext } from "../context.js";
import { assertPilotAuth } from "../auth.js";
import { errorResponse, json, mapErrorToResponse } from "../http.js";

export default async function handler(request: Request, _context: Context): Promise<Response> {
  const correlationId = createId();
  try {
    const ctx = getAppContext();
    assertPilotAuth(request, ctx.pilotBearerToken);

    const command = (await request.json()) as DomainCommand;
    if (!command?.stream_id || !command.workspace_id) {
      return errorResponse("VALIDATION_FAILED", "Comando inválido.", correlationId);
    }

    const plan = await ctx.storage.planVersions.get(command.stream_id);
    if (!plan) return errorResponse("NOT_FOUND", "Plano referenciado pelo comando não existe.", correlationId);

    const eventStore = ctx.storage.eventStoreFor(command.workspace_id);
    const stateBefore = projectMaterializedState(
      command.workspace_id,
      command.stream_id,
      await eventStore.readStream(command.stream_id),
    );

    const result = await handleCommand(eventStore, command, {
      planLifecycleState: plan.lifecycle_state,
      nodeExists: (nodeId) => plan.nodes.some((n) => n.id === nodeId),
      autoCompletion: { nodes: plan.nodes, stateBefore },
    });

    const state = projectMaterializedState(
      command.workspace_id,
      command.stream_id,
      await eventStore.readStream(command.stream_id),
    );

    return json({ events: result.events, state });
  } catch (err) {
    return mapErrorToResponse(err, correlationId);
  }
}

export const config: Config = { path: "/api/commands" };
