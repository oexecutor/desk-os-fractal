import type { Config, Context } from "@netlify/functions";
import { createId } from "@desk-os/domain";
import { createQrToken, type QrTokenRecord } from "@desk-os/qr";
import { getAppContext } from "../context.js";
import { assertPilotAuth } from "../auth.js";
import { errorResponse, json, mapErrorToResponse } from "../http.js";

export default async function handler(request: Request, _context: Context): Promise<Response> {
  const correlationId = createId();
  try {
    const ctx = getAppContext();
    assertPilotAuth(request, ctx.pilotBearerToken);

    const body = (await request.json()) as Partial<QrTokenRecord>;
    if (!body.workspace_id || !body.kind || !body.target || !body.authentication_policy) {
      return errorResponse("VALIDATION_FAILED", "workspace_id, kind, target e authentication_policy são obrigatórios.", correlationId);
    }

    const { record, token } = await createQrToken(ctx.storage.qrTokens, {
      workspaceId: body.workspace_id,
      kind: body.kind,
      target: body.target,
      authenticationPolicy: body.authentication_policy,
      ...(body.minimum_plan_state ? { minimumPlanState: body.minimum_plan_state } : {}),
      ...(body.expires_at ? { expiresAt: body.expires_at } : {}),
      ...(body.max_uses ? { maxUses: body.max_uses } : {}),
    });

    const url = `${ctx.qrBaseUrl.replace(/\/$/, "")}/q/${token}`;
    return json({ record, url }, { status: 201 });
  } catch (err) {
    return mapErrorToResponse(err, correlationId);
  }
}

export const config: Config = { path: "/api/qr/tokens" };
