import type { Config, Context } from "@netlify/functions";
import { createId, isValidId } from "@desk-os/domain";
import {
  assertConsent,
  createIngestionJob,
  createSourceArtifact,
  extractDocument,
  advanceIngestionJob,
  type SourceArtifact,
} from "@desk-os/ingestion";
import type { ExtractedDocument } from "@desk-os/ingestion";
import { getAppContext } from "../context.js";
import { assertPilotAuth } from "../auth.js";
import { errorResponse, json, mapErrorToResponse } from "../http.js";

/** Chave privada (não faz parte dos 5 repositórios tipados) — ver ingestions.ts/ingestion-decompose.ts. */
function extractedDocsKey(ingestionId: string): string {
  return `ingestions/${ingestionId}/extracted-documents`;
}

export default async function handler(request: Request, _context: Context): Promise<Response> {
  const correlationId = createId();
  try {
    const ctx = getAppContext();
    assertPilotAuth(request, ctx.pilotBearerToken);

    if (request.method !== "POST") {
      return errorResponse("VALIDATION_FAILED", "Método não suportado.", correlationId);
    }

    const form = await request.formData();
    const workspaceId = String(form.get("workspace_id") ?? "");
    const consent = form.get("consent_to_model_processing");
    const pastedText = form.get("pasted_text");
    // Evita nomear o tipo `File` explicitamente: o global do Node (buffer) e
    // o tipo usado pelas definições de FormData do runtime de Functions não
    // são o mesmo símbolo. `typeof f !== "string"` estreita para o File
    // correto via inferência de union, sem precisar nomeá-lo.
    const files = form.getAll("files").filter((f) => typeof f !== "string");

    if (!isValidId(workspaceId)) {
      return errorResponse("VALIDATION_FAILED", "workspace_id inválido.", correlationId);
    }
    assertConsent(consent === "true" || consent === "on");

    if (files.length === 0 && !pastedText) {
      return errorResponse("VALIDATION_FAILED", "Envie ao menos um arquivo ou texto colado.", correlationId);
    }

    const artifacts: SourceArtifact[] = [];
    const documents: ExtractedDocument[] = [];

    if (typeof pastedText === "string" && pastedText.trim().length > 0) {
      const buffer = new TextEncoder().encode(pastedText);
      const artifact = createSourceArtifact({
        workspaceId,
        filename: "texto-colado.txt",
        buffer,
        maxUploadMb: ctx.maxUploadMb,
      });
      artifacts.push(artifact);
      documents.push(await extractDocument(artifact, buffer));
    }

    for (const file of files) {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const artifact = createSourceArtifact({
        workspaceId,
        filename: file.name,
        buffer,
        maxUploadMb: ctx.maxUploadMb,
      });
      artifacts.push(artifact);
      documents.push(await extractDocument(artifact, buffer));
    }

    let job = createIngestionJob(
      workspaceId,
      artifacts.map((a) => a.id),
    );
    job = advanceIngestionJob(job, "EXTRACTED", { name: "extract", status: "DONE" });

    await ctx.storage.ingestionJobs.save(job.id, job);
    await ctx.storage.blobs.set(extractedDocsKey(job.id), JSON.stringify(documents));

    return json(job, { status: 202 });
  } catch (err) {
    return mapErrorToResponse(err, correlationId);
  }
}

export const config: Config = { path: "/api/ingestions" };
export { extractedDocsKey };
