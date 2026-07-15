import type { StructuredModelClient } from "../model-client.js";
import { withSchemaRetry } from "../schema-retry.js";
import { buildPrompt, DECOMPOSER_PROMPT, SYSTEM_POLICY } from "../prompts.js";
import type { AnalysisRecord, DecomposerDraftNode, DecomposerDraftOutput } from "../draft-types.js";

const DRAFT_NODE_SCHEMA = {
  type: "object",
  required: ["alias", "parent_alias", "node_type", "title", "order"],
  properties: {
    alias: { type: "string", minLength: 1 },
    parent_alias: { type: ["string", "null"] },
    node_type: {
      enum: [
        "portfolio", "project", "phase", "workflow", "week", "day",
        "block", "deliverable", "action", "synthesis",
      ],
    },
    title: { type: "string", minLength: 1 },
    order: { type: "integer", minimum: 0 },
  },
} as const;

const DRAFT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["input_kind", "objective", "dominant_result", "root_aliases", "nodes"],
  properties: {
    input_kind: { enum: ["single_project", "portfolio", "indeterminate"] },
    objective: { type: "string" },
    dominant_result: { type: "string" },
    root_aliases: { type: "array", items: { type: "string" } },
    nodes: { type: "array", items: DRAFT_NODE_SCHEMA },
  },
} as const;

function validateDraft(value: unknown): string[] {
  const errors: string[] = [];
  if (typeof value !== "object" || value === null) {
    return ["saída não é um objeto"];
  }
  const draft = value as Partial<DecomposerDraftOutput>;
  if (!Array.isArray(draft.root_aliases) || draft.root_aliases.length === 0) {
    errors.push("root_aliases ausente ou vazio");
  }
  if (!Array.isArray(draft.nodes) || draft.nodes.length === 0) {
    errors.push("nodes ausente ou vazio");
    return errors;
  }
  const aliases = new Set<string>();
  for (const node of draft.nodes as DecomposerDraftNode[]) {
    if (!node.alias) {
      errors.push("nó sem alias");
      continue;
    }
    if (aliases.has(node.alias)) {
      errors.push(`alias duplicado: ${node.alias}`);
    }
    aliases.add(node.alias);
    if (node.node_type === "action" && (!node.done_criteria || node.done_criteria.length < 1)) {
      errors.push(`ação ${node.alias} sem done_criteria`);
    }
  }
  return errors;
}

/** specs/AGENT_CONTRACTS.md / DECOMPOSITION_ENGINE.md — Decomposer: nunca ativa o plano. */
export async function decomposeDraft(
  client: StructuredModelClient,
  sourceText: string,
  analysisRecords: AnalysisRecord[],
  userContext?: string,
): Promise<DecomposerDraftOutput> {
  const retrying = withSchemaRetry(client, validateDraft);
  const context = [
    userContext,
    `Registros de análise já extraídos:\n${JSON.stringify(analysisRecords, null, 2)}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return retrying.generate<DecomposerDraftOutput>({
    system: SYSTEM_POLICY,
    prompt: buildPrompt(DECOMPOSER_PROMPT, sourceText, context),
    schema: DRAFT_SCHEMA,
  });
}
