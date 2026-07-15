export type CommandType =
  | "START_ACTION"
  | "COMPLETE_ACTION"
  | "REOPEN_ACTION"
  | "BLOCK_ACTION"
  | "UNBLOCK_ACTION"
  | "ADD_EVIDENCE"
  | "CLOSE_DAY"
  | "DECIDE_RECYCLE"
  | "APPROVE_PLAN"
  | "ACTIVATE_PLAN"
  | "FOCUS_NODE";

export interface DomainCommand<TData extends Record<string, unknown> = Record<string, unknown>> {
  schema_version: "1.0.0";
  command_id: string;
  command_type: CommandType;
  workspace_id: string;
  stream_id: string;
  expected_version: number;
  idempotency_key: string;
  actor: { type: "USER" | "QR"; id: string };
  data: TData;
}
