import type { Config, Context } from "@netlify/functions";
import { createId } from "@desk-os/domain";
import { renderPrintHtml } from "@desk-os/print";
import { getAppContext } from "../context.js";
import { assertPilotAuth } from "../auth.js";
import { errorResponse, mapErrorToResponse } from "../http.js";
import { qrTokenKey } from "./print-snapshots.js";

export default async function handler(request: Request, context: Context): Promise<Response> {
  const correlationId = createId();
  try {
    const ctx = getAppContext();
    assertPilotAuth(request, ctx.pilotBearerToken);

    const snapshotId = context.params.snapshotId;
    if (!snapshotId) return errorResponse("VALIDATION_FAILED", "snapshotId ausente.", correlationId);

    const snapshot = await ctx.storage.printSnapshots.get(snapshotId);
    if (!snapshot) return errorResponse("NOT_FOUND", "Print snapshot não encontrado.", correlationId);

    const qrToken = await ctx.storage.blobs.get(qrTokenKey(snapshotId));
    if (!qrToken) return errorResponse("NOT_FOUND", "Token QR do snapshot não encontrado.", correlationId);

    const html = await renderPrintHtml(snapshot, { qrToken, qrBaseUrl: ctx.qrBaseUrl });

    return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  } catch (err) {
    return mapErrorToResponse(err, correlationId);
  }
}

export const config: Config = { path: "/api/print-snapshots/:snapshotId/html" };
