import type { PlanVersionId, ProjectId, SourceArtifactId, WorkNodeId, WorkspaceId } from "./ids.js";

/** specs/CANONICAL_DOMAIN_MODEL.md */
export type NodeType =
  | "portfolio"
  | "project"
  | "phase"
  | "workflow"
  | "week"
  | "day"
  | "block"
  | "deliverable"
  | "action"
  | "synthesis";

export type NodeStatus =
  | "DRAFT"
  | "READY"
  | "TODO"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "DONE"
  | "CANCELLED"
  | "ARCHIVED";

export type CompletionRuleKind = "NONE" | "MANUAL" | "ALL_CHILDREN" | "THRESHOLD";

export interface CompletionRule {
  kind: CompletionRuleKind;
  minimum_complete?: number | null;
  requires_evidence?: boolean;
}

export type SourceClassification =
  | "FACT"
  | "EVIDENCE"
  | "INFERENCE"
  | "HYPOTHESIS"
  | "COUNTEREVIDENCE"
  | "GAP";

export interface SourceRef {
  source_artifact_id: SourceArtifactId;
  locator: string;
  classification: SourceClassification;
  excerpt?: string;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface WorkNode {
  schema_version: "1.0.0";
  id: WorkNodeId;
  workspace_id: WorkspaceId;
  project_id: ProjectId | null;
  plan_version_id: PlanVersionId;
  parent_id: WorkNodeId | null;
  node_type: NodeType;
  title: string;
  description?: string;
  order: number;
  depth: number;
  status: NodeStatus;
  completion_rule: CompletionRule;
  done_criteria?: string[];
  owner?: { id: string | null; label?: string } | null;
  schedule?: {
    start_at?: string | null;
    end_at?: string | null;
    date?: string | null;
    week_id?: string | null;
  } | null;
  dependencies?: WorkNodeId[];
  risk?: { level: RiskLevel; reason?: string } | null;
  source_refs: SourceRef[];
  metadata: Record<string, unknown>;
}

/** specs/PLAN_LIFECYCLE.md */
export type PlanLifecycleState =
  | "GENERATED"
  | "IN_REVIEW"
  | "APPROVED"
  | "ACTIVE"
  | "BLOCKED"
  | "REJECTED"
  | "SUPERSEDED"
  | "COMPLETED"
  | "ARCHIVED";

export type InputKind = "single_project" | "portfolio" | "indeterminate";

export interface ValidationReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
  gaps: string[];
}

export interface PlanVersion {
  schema_version: "1.0.0";
  id: PlanVersionId;
  workspace_id: WorkspaceId;
  version: number;
  lifecycle_state: PlanLifecycleState;
  input_kind?: InputKind;
  objective?: string;
  dominant_result?: string;
  root_node_ids: WorkNodeId[];
  nodes: WorkNode[];
  validation_report: ValidationReport;
  source_artifact_ids?: SourceArtifactId[];
  created_at: string;
  created_by?: string;
  approved_at?: string | null;
  approved_by?: string | null;
}

export interface Workspace {
  id: WorkspaceId;
  name: string;
  version: number;
  settings: Record<string, unknown>;
  root_node_ids: WorkNodeId[];
}

export type DomainEventType =
  | "plan.generated"
  | "plan.review_started"
  | "plan.approved"
  | "plan.activated"
  | "node.focused"
  | "action.started"
  | "action.completed"
  | "action.reopened"
  | "action.blocked"
  | "action.unblocked"
  | "evidence.added"
  | "synthesis.completed"
  | "day.closed"
  | "recycle.decided"
  | "plan.reconfiguration_requested"
  | "qr.command_resolved"
  | "qr.command_executed"
  | "print.snapshot_created";

/**
 * Envelope de wire/storage (ADR-0006): cruza fronteiras já validadas por
 * schema, por isso usa `string` plano em vez de IDs com brand nominal —
 * diferente de WorkNode/PlanVersion, que são o modelo de domínio rico.
 */
export interface DomainEvent<TData extends Record<string, unknown> = Record<string, unknown>> {
  schema_version: "1.0.0";
  event_id: string;
  event_type: DomainEventType;
  workspace_id: string;
  stream_id: string;
  stream_version: number;
  occurred_at: string;
  actor: { type: "USER" | "SYSTEM" | "QR"; id: string };
  data: TData;
  correlation_id: string;
  causation_id?: string | null;
  idempotency_key?: string | null;
}
