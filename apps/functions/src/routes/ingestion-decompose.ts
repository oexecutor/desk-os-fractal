import type { Config, Context } from "@netlify/functions";
import { createId } from "@desk-os/domain";
import { advanceIngestionJob } from "@desk-os/ingestion";
import type { ExtractedDocument } from "@desk-os/ingestion";
import { runDecompositionPipeline, InsufficientInputError } from "@desk-os/decomposition";
import { getAppContext } from "../context.js";
import { assertPilotAuth } from "../auth.js";
import { errorResponse, json, mapErrorToResponse } from "../http.js";
import { extractedDocsKey } from "./ingestions.js";

export default async function handler(request: Request, context: Context): Promise<Response> {
  const correlationId = createId();
  try {
    const ctx = getAppContext();
    assertPilotAuth(request, ctx.pilotBearerToken);

    const ingestionId = context.params.ingestionId;
    if (!ingestionId) return errorResponse("VALIDATION_FAILED", "ingestionId ausente.", correlationId);

    const body = (await request.json().catch(() => ({}))) as {
      workspace_id?: string;
      user_context?: string;
    };
    if (!body.workspace_id) {
      return errorResponse("VALIDATION_FAILED", "workspace_id é obrigatório.", correlationId);
    }

    let job = await ctx.storage.ingestionJobs.get(ingestionId);
    if (!job) return errorResponse("NOT_FOUND", "Ingestão não encontrada.", correlationId);

    const rawDocs = await ctx.storage.blobs.get(extractedDocsKey(ingestionId));
    const documents: ExtractedDocument[] = rawDocs ? JSON.parse(rawDocs) : [];
    const sourceText = documents.flatMap((doc) => doc.blocks.map((b) => b.text)).join("\n\n");

    job = advanceIngestionJob(job, "DECOMPOSING", { name: "decompose", status: "RUNNING" });
    await ctx.storage.ingestionJobs.save(job.id, job);

    try {
      const plan = await runDecompositionPipeline({
        client: ctx.modelClient,
        workspaceId: body.workspace_id,
        sourceText,
        sourceArtifactIds: job.source_artifact_ids,
        ...(body.user_context ? { userContext: body.user_context } : {}),
      });

      await ctx.storage.planVersions.save(plan.id, plan);

      job = advanceIngestionJob(job, plan.lifecycle_state === "BLOCKED" ? "BLOCKED" : "COMPLETED", {
        name: "decompose",
        status: "DONE",
      });
      job = { ...job, result_plan_version_id: plan.id };
      await ctx.storage.ingestionJobs.save(job.id, job);

      return json(job, { status: 202 });
    } catch (err) {
      if (err instanceof InsufficientInputError) {
        job = advanceIngestionJob(job, "BLOCKED", {
          name: "decompose",
          status: "FAILED",
          message: err.gaps.join("; ") || err.message,
        });
        job = { ...job, error_code: "VALIDATION_FAILED" };
        await ctx.storage.ingestionJobs.save(job.id, job);
        return json(job, { status: 202 });
      }
      throw err;
    }
  } catch (err) {
    return mapErrorToResponse(err, correlationId);
  }
}

export const config: Config = { path: "/api/ingestions/:ingestionId/decompose" };
