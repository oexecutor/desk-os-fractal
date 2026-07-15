import type { Config, Context } from "@netlify/functions";
import { createId } from "@desk-os/domain";
import { projectMaterializedState } from "@desk-os/events";
import { assertTokenUsable, findQrTokenRecord, resolveQrToken } from "@desk-os/qr";
import { getAppContext } from "../context.js";
import { errorResponse, json, mapErrorToResponse } from "../http.js";

/**
 * specs/QR_ROUTER.md: resolução pública (sem autenticação obrigatória) —
 * a segurança vem do token opaco em si, não de sessão prévia. GET/POST
 * aqui nunca muta (ADR-0015).
 */
export default async function handler(request: Request, context: Context): Promise<Response> {
  const correlationId = createId();
  try {
    const ctx = getAppContext();
    const token = context.params.token;
    if (!token) return errorResponse("VALIDATION_FAILED", "token ausente.", correlationId);

    const record = await findQrTokenRecord(ctx.storage.qrTokens, token);
    if (!record) return errorResponse("NOT_FOUND", "Token não encontrado.", correlationId);

    assertTokenUsable(record, new Date());

    const planVersionId = record.target.plan_version_id;
    const plan = planVersionId
      ? await ctx.storage.planVersions.get(planVersionId)
      : await (async () => {
          const activeId = await ctx.storage.getActivePlanVersion(record.workspace_id);
          return activeId ? ctx.storage.planVersions.get(activeId) : null;
        })();

    if (!plan) return errorResponse("NOT_FOUND", "Plano associado ao token não encontrado.", correlationId);

    const eventStore = ctx.storage.eventStoreFor(record.workspace_id);
    const state = projectMaterializedState(record.workspace_id, plan.id, await eventStore.readStream(plan.id));

    const resolution = resolveQrToken(record, plan, state);
    return json(resolution);
  } catch (err) {
    return mapErrorToResponse(err, correlationId);
  }
}

export const config: Config = { path: "/api/qr/:token/resolve" };
