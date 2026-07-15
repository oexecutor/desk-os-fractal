import { SCHEMA_IDS, getValidator, validateOrThrow } from "@desk-os/schemas";
import type { StructuredModelClient } from "../model-client.js";
import { withSchemaRetry } from "../schema-retry.js";
import { buildPrompt, CLASSIFIER_PROMPT, SYSTEM_POLICY } from "../prompts.js";

export interface ClassificationResult {
  schema_version: "1.0.0";
  kind: "single_project" | "portfolio" | "indeterminate";
  confidence: number;
  evidence_refs: Array<{ source_artifact_id: string; locator: string }>;
  gaps: string[];
}

/** specs/AGENT_CONTRACTS.md — Classifier. */
export async function classify(
  client: StructuredModelClient,
  sourceText: string,
): Promise<ClassificationResult> {
  const schema = getValidator(SCHEMA_IDS.classificationResult).schema as Record<string, unknown>;
  const retrying = withSchemaRetry(client, (value) => {
    try {
      validateOrThrow("classificationResult", value);
      return [];
    } catch (err) {
      return [(err as Error).message];
    }
  });

  const result = await retrying.generate<ClassificationResult>({
    system: SYSTEM_POLICY,
    prompt: buildPrompt(CLASSIFIER_PROMPT, sourceText),
    schema,
  });

  return result;
}
