export type SourceClassification =
  | "FACT"
  | "EVIDENCE"
  | "INFERENCE"
  | "HYPOTHESIS"
  | "COUNTEREVIDENCE"
  | "GAP";

export interface AnalysisRecord {
  classification: SourceClassification;
  statement: string;
  source_refs: string[];
}

/**
 * ADR-0014: o Decomposer não pode gerar IDs estáveis — usa `alias`
 * (temporário, só existe dentro do draft) até o remapeamento determinístico
 * em packages/decomposition.
 */
export interface DecomposerDraftNode {
  alias: string;
  parent_alias: string | null;
  node_type:
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
  title: string;
  description?: string;
  order: number;
  done_criteria?: string[];
  completion_rule?: {
    kind: "NONE" | "MANUAL" | "ALL_CHILDREN" | "THRESHOLD";
    minimum_complete?: number | null;
  };
  dependency_aliases?: string[];
  source_locators?: string[];
}

export interface DecomposerDraftOutput {
  input_kind: "single_project" | "portfolio" | "indeterminate";
  objective: string;
  dominant_result: string;
  root_aliases: string[];
  nodes: DecomposerDraftNode[];
}
