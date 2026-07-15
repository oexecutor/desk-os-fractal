export type DocumentBlockKind = "paragraph" | "heading" | "table" | "list" | "metadata";

export interface DocumentBlock {
  id: string;
  kind: DocumentBlockKind;
  locator: string;
  text: string;
  data?: unknown;
}

export interface ExtractedDocument {
  schema_version: "1.0.0";
  id: string;
  workspace_id: string;
  source_artifact_id: string;
  language: string | null;
  blocks: DocumentBlock[];
  warnings: string[];
  created_at: string;
}
