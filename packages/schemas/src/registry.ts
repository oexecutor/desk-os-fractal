import Ajv2020 from "ajv/dist/2020.js";
import type { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { SCHEMA_DOCUMENTS } from "./schema-files.js";

/**
 * schemas/README.md: JSON Schema 2020-12 é a fonte de verdade única em
 * `schemas/` na raiz do monorepo — este package só compila esses documentos
 * (importados estaticamente, ver schema-files.ts) em validadores reutilizáveis.
 */
function createRegistry(): Ajv2020 {
  const ajv = new Ajv2020({
    strict: true,
    strictTypes: false,
    strictRequired: false,
    allowUnionTypes: true,
    allErrors: true,
  });
  addFormats(ajv);

  for (const schema of SCHEMA_DOCUMENTS) {
    ajv.addSchema(schema, String((schema as { $id?: string }).$id));
  }
  return ajv;
}

let registry: Ajv2020 | undefined;

export function getRegistry(): Ajv2020 {
  registry ??= createRegistry();
  return registry;
}

export function getValidator(schemaId: string): ValidateFunction {
  const validate = getRegistry().getSchema(schemaId);
  if (!validate) {
    throw new Error(`Schema não registrado: ${schemaId}`);
  }
  return validate;
}
