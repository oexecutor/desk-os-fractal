export type QrTokenKind =
  | "VIEW_CONTEXT"
  | "OPEN_FOCUS"
  | "COMPLETE_ACTION"
  | "CLOSE_DAY"
  | "RECYCLE"
  | "OPEN_CURRENT_ACTION";

export type QrTargetStrategy =
  | "FIXED_NODE"
  | "CURRENT_CONTEXT"
  | "ACTIVE_BLOCK"
  | "TODAY_ACTION"
  | "NEAREST_GATE"
  | "CURRENT_ACTION";

export interface QrTokenTarget {
  strategy: QrTargetStrategy;
  project_id?: string | null;
  sprint_id?: string | null;
  node_id?: string | null;
  plan_version_id?: string | null;
}

export interface QrTokenRecord {
  schema_version: "1.1.0";
  id: string;
  token_hash: string;
  workspace_id: string;
  kind: QrTokenKind;
  target: QrTokenTarget;
  minimum_plan_state?: "IN_REVIEW" | "APPROVED" | "ACTIVE";
  created_at: string;
  expires_at: string | null;
  revoked: boolean;
  max_uses: number | null;
  use_count: number;
  authentication_policy: "REQUIRED" | "OPTIONAL_VIEW_ONLY" | "PUBLIC_VIEW";
}
