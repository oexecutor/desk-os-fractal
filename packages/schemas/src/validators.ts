import type { ErrorObject } from "ajv";
import { getValidator } from "./registry.js";

const BASE = "https://desk-os.app/schemas";

export const SCHEMA_IDS = {
  workspace: `${BASE}/workspace.schema.json`,
  workNode: `${BASE}/work-node.schema.json`,
  planVersion: `${BASE}/plan-version.schema.json`,
  domainEvent: `${BASE}/domain-event.schema.json`,
  command: `${BASE}/command.schema.json`,
  materializedState: `${BASE}/materialized-state.schema.json`,
  evidence: `${BASE}/evidence.schema.json`,
  qrToken: `${BASE}/qr-token.schema.json`,
  printSnapshot: `${BASE}/print-snapshot.schema.json`,
  ingestionJob: `${BASE}/ingestion-job.schema.json`,
  sourceArtifact: `${BASE}/source-artifact.schema.json`,
  extractedDocument: `${BASE}/extracted-document.schema.json`,
  classificationResult: `${BASE}/classification-result.schema.json`,
  decompositionResult: `${BASE}/decomposition-result.schema.json`,
} as const;

export type SchemaName = keyof typeof SCHEMA_IDS;

/** ADR-0012: toda fronteira (arquivo, resposta de modelo, request, storage) é validada aqui. */
export class SchemaValidationError extends Error {
  constructor(
    public readonly schema: SchemaName,
    public readonly errors: ErrorObject[],
  ) {
    super(`Validação de schema falhou (${schema}): ${JSON.stringify(errors.map((e) => e.message))}`);
    this.name = "SchemaValidationError";
  }
}

export function validate<T = unknown>(schema: SchemaName, instance: unknown): instance is T {
  const validateFn = getValidator(SCHEMA_IDS[schema]);
  return validateFn(instance) as boolean;
}

export function validateOrThrow<T = unknown>(schema: SchemaName, instance: unknown): T {
  const validateFn = getValidator(SCHEMA_IDS[schema]);
  const ok = validateFn(instance);
  if (!ok) {
    throw new SchemaValidationError(schema, validateFn.errors ?? []);
  }
  return instance as T;
}
