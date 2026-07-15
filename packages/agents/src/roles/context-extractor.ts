import type { StructuredModelClient } from "../model-client.js";
import { withSchemaRetry } from "../schema-retry.js";
import { buildPrompt, CONTEXT_EXTRACTOR_PROMPT, SYSTEM_POLICY } from "../prompts.js";
import type { AnalysisRecord } from "../draft-types.js";

const ANALYSIS_RECORDS_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["classification", "statement", "source_refs"],
    properties: {
      classification: {
        enum: ["FACT", "EVIDENCE", "INFERENCE", "HYPOTHESIS", "COUNTEREVIDENCE", "GAP"],
      },
      statement: { type: "string", minLength: 1 },
      source_refs: { type: "array", items: { type: "string" } },
    },
  },
} as const;

function validateAnalysisRecords(value: unknown): string[] {
  if (!Array.isArray(value)) return ["saída deveria ser um array de analysis records"];
  const errors: string[] = [];
  value.forEach((record, index) => {
    if (typeof record !== "object" || record === null) {
      errors.push(`registro ${index}: não é um objeto`);
      return;
    }
    const r = record as Partial<AnalysisRecord>;
    if (!["FACT", "EVIDENCE", "INFERENCE", "HYPOTHESIS", "COUNTEREVIDENCE", "GAP"].includes(
      r.classification ?? "",
    )) {
      errors.push(`registro ${index}: classification inválida`);
    }
    if (typeof r.statement !== "string" || r.statement.length < 1) {
      errors.push(`registro ${index}: statement ausente`);
    }
    if (!Array.isArray(r.source_refs)) {
      errors.push(`registro ${index}: source_refs ausente`);
    }
  });
  return errors;
}

/** specs/AGENT_CONTRACTS.md — Context Extractor: FATO/EVIDÊNCIA/INFERÊNCIA/HIPÓTESE/CONTRAEVIDÊNCIA/LACUNA. */
export async function extractContext(
  client: StructuredModelClient,
  sourceText: string,
  userContext?: string,
): Promise<AnalysisRecord[]> {
  const retrying = withSchemaRetry(client, validateAnalysisRecords);
  return retrying.generate<AnalysisRecord[]>({
    system: SYSTEM_POLICY,
    prompt: buildPrompt(CONTEXT_EXTRACTOR_PROMPT, sourceText, userContext),
    schema: ANALYSIS_RECORDS_SCHEMA,
  });
}
