import type { PlanVersion, WorkNode } from "@desk-os/domain";

/**
 * Tipos de fronteira do client-sdk. Deliberadamente não importam
 * @desk-os/schemas (que usa `node:fs` para carregar os JSON Schemas) — o
 * bundle do navegador nunca deve tentar empacotar acesso a filesystem.
 * A validação por schema acontece no servidor (apps/functions); o cliente
 * confia estruturalmente na resposta HTTP.
 */

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    correlation_id: string;
    retryable: boolean;
    details?: unknown[];
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly correlationId: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface IngestionJob {
  schema_version: "1.0.0";
  id: string;
  workspace_id: string;
  status:
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
  source_artifact_ids: string[];
  steps?: Array<{ name: string; status: string; message?: string }>;
  created_at: string;
  updated_at: string;
  result_plan_version_id: string | null;
  error_code: string | null;
}

export interface WorkspaceTree {
  plan: PlanVersion;
  state: MaterializedStateDTO;
}

export interface NodeStateDTO {
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE" | "CANCELLED";
  started_at: string | null;
  completed_at: string | null;
  blocked_reason: string | null;
  evidence_count: number;
  updated_at: string;
}

export interface MaterializedStateDTO {
  schema_version: "1.0.0";
  workspace_id: string;
  plan_version_id: string;
  stream_version: number;
  node_states: Record<string, NodeStateDTO>;
  focused_node_id: string | null;
  updated_at: string;
}

export interface CommandInput {
  command_type: string;
  workspace_id: string;
  stream_id: string;
  expected_version: number;
  idempotency_key: string;
  actor: { type: "USER" | "QR"; id: string };
  data: Record<string, unknown>;
}

export interface CommandResult {
  events: unknown[];
  state: MaterializedStateDTO;
}

export interface QrResolveResponseDTO {
  kind: string;
  description: string;
  mutates_state: boolean;
  confirmation_required: boolean;
  target: { id: string | null; title: string | null; block_id?: string | null };
  expected_version: number;
}

export type { WorkNode, PlanVersion };
