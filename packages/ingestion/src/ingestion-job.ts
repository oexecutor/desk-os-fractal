import { createId } from "@desk-os/domain";
import { validateOrThrow } from "@desk-os/schemas";

export type IngestionJobStatus =
  | "UPLOADED"
  | "EXTRACTING"
  | "EXTRACTED"
  | "CLASSIFYING"
  | "DECOMPOSING"
  | "VALIDATING"
  | "COMPLETED"
  | "BLOCKED"
  | "FAILED"
  | "CANCELLED";

export interface IngestionJobStep {
  name: string;
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED";
  message?: string;
}

export interface IngestionJob {
  schema_version: "1.0.0";
  id: string;
  workspace_id: string;
  status: IngestionJobStatus;
  source_artifact_ids: string[];
  steps: IngestionJobStep[];
  created_at: string;
  updated_at: string;
  result_plan_version_id: string | null;
  error_code: string | null;
}

export function createIngestionJob(workspaceId: string, sourceArtifactIds: string[]): IngestionJob {
  const now = new Date().toISOString();
  const job: IngestionJob = {
    schema_version: "1.0.0",
    id: createId(),
    workspace_id: workspaceId,
    status: "UPLOADED",
    source_artifact_ids: sourceArtifactIds,
    steps: [],
    created_at: now,
    updated_at: now,
    result_plan_version_id: null,
    error_code: null,
  };
  return validateOrThrow("ingestionJob", job);
}

export function advanceIngestionJob(
  job: IngestionJob,
  status: IngestionJobStatus,
  step?: IngestionJobStep,
): IngestionJob {
  const next: IngestionJob = {
    ...job,
    status,
    steps: step ? [...job.steps, step] : job.steps,
    updated_at: new Date().toISOString(),
  };
  return validateOrThrow("ingestionJob", next);
}
