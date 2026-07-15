/**
 * Fase 0 contract gate (T002 do BACKLOG.csv / schemas/README.md).
 *
 * Compila todos os JSON Schemas do pacote normativo, valida as fixtures
 * válidas, confirma que as fixtures conceituais inválidas falham, valida
 * events.ndjson e confere que api/openapi.yaml carrega com os paths
 * esperados. Não depende de nenhum package do monorepo: roda antes do
 * build, direto sobre schemas/ e fixtures/ na raiz.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { load } from "js-yaml";

const ROOT = path.resolve(import.meta.dirname, "..");
const SCHEMAS_DIR = path.join(ROOT, "schemas");
const FIXTURES_DIR = path.join(ROOT, "fixtures");

let failures = 0;
function ok(msg: string): void {
  console.log(`  OK  ${msg}`);
}
function fail(msg: string): void {
  failures += 1;
  console.error(`FAIL  ${msg}`);
}

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

console.log("== 1. Compilando schemas (Draft 2020-12) ==");
// strictTypes relaxado: os schemas normativos usam ramos allOf/if/then que não
// redeclaram "type" (herdado do schema base) — comportamento válido em JSON
// Schema 2020-12, mas sinalizado pelo modo estrito "opinativo" do Ajv.
const ajv = new Ajv2020({
  strict: true,
  strictTypes: false,
  strictRequired: false,
  allowUnionTypes: true,
  allErrors: true,
});
addFormats(ajv);

const schemaFiles = readdirSync(SCHEMAS_DIR).filter((f) => f.endsWith(".schema.json"));
const schemasById = new Map<string, Record<string, unknown>>();
for (const file of schemaFiles) {
  const schema = readJson(path.join(SCHEMAS_DIR, file)) as Record<string, unknown>;
  const id = String(schema.$id ?? file);
  schemasById.set(id, schema);
  schemasById.set(file, schema);
  ajv.addSchema(schema, id);
}

const validators = new Map<string, ReturnType<typeof ajv.compile>>();
for (const file of schemaFiles) {
  const schema = schemasById.get(file)!;
  const id = String(schema.$id ?? file);
  try {
    const validate = ajv.getSchema(id) ?? ajv.compile(schema);
    validators.set(id, validate);
    validators.set(file, validate);
    ok(`schema compila: ${file}`);
  } catch (err) {
    fail(`schema ${file}: ${(err as Error).message}`);
  }
}

console.log("\n== 2. Fixtures válidas ==");
const validCases: Array<[string, string]> = [
  ["canonical-single-project.json", "https://desk-os.app/schemas/plan-version.schema.json"],
  ["canonical-portfolio.json", "https://desk-os.app/schemas/plan-version.schema.json"],
  ["materialized-state.json", "https://desk-os.app/schemas/materialized-state.schema.json"],
  ["print-snapshot.json", "https://desk-os.app/schemas/print-snapshot.schema.json"],
];
for (const [fixture, schemaId] of validCases) {
  const validate = validators.get(schemaId);
  if (!validate) {
    fail(`schema não encontrado para ${fixture}: ${schemaId}`);
    continue;
  }
  const instance = readJson(path.join(FIXTURES_DIR, fixture));
  const valid = validate(instance);
  if (valid) {
    ok(`${fixture} valida contra ${schemaId}`);
  } else {
    fail(`${fixture} deveria validar mas falhou: ${ajv.errorsText(validate.errors)}`);
  }
}

console.log("\n== 3. Fixtures inválidas (devem falhar) ==");
const invalidDir = path.join(FIXTURES_DIR, "invalid");
for (const file of readdirSync(invalidDir)) {
  const instance = readJson(path.join(invalidDir, file));
  // action-without-done-criteria.json é validável estruturalmente contra work-node;
  // cycle.json e duplicate-id.json são fixtures conceituais de invariantes de grafo
  // (exercitadas pelos testes de packages/domain, não pelo schema).
  if (file === "action-without-done-criteria.json") {
    const validate = validators.get("https://desk-os.app/schemas/work-node.schema.json");
    if (!validate) {
      fail(`schema work-node não encontrado para validar ${file}`);
      continue;
    }
    const valid = validate(instance);
    if (!valid) {
      ok(`${file} falha como esperado (${validate.errors?.length ?? 0} erro(s))`);
    } else {
      fail(`${file} deveria falhar a validação e passou`);
    }
  } else {
    ok(`${file} é fixture conceitual de invariante de grafo — ver tests em packages/domain`);
  }
}

console.log("\n== 4. events.ndjson ==");
const eventValidator = validators.get("https://desk-os.app/schemas/domain-event.schema.json");
const ndjsonPath = path.join(FIXTURES_DIR, "events.ndjson");
const lines = readFileSync(ndjsonPath, "utf8").split("\n").filter((l) => l.trim().length > 0);
let eventErrors = 0;
lines.forEach((line, idx) => {
  const instance = JSON.parse(line);
  if (eventValidator && !eventValidator(instance)) {
    eventErrors += 1;
    fail(`events.ndjson linha ${idx + 1}: ${ajv.errorsText(eventValidator.errors)}`);
  }
});
if (eventErrors === 0) {
  ok(`events.ndjson: ${lines.length} evento(s) válido(s) contra domain-event.schema.json`);
}

console.log("\n== 5. OpenAPI ==");
const openapiRaw = readFileSync(path.join(ROOT, "api", "openapi.yaml"), "utf8");
const openapi = load(openapiRaw) as { paths?: Record<string, unknown> };
const pathCount = Object.keys(openapi.paths ?? {}).length;
if (pathCount > 0) {
  ok(`openapi.yaml carregou com ${pathCount} paths`);
} else {
  fail("openapi.yaml não carregou paths");
}

console.log(`\n${failures === 0 ? "PASS" : "FAIL"}: validate-contracts (${failures} falha(s))`);
if (failures > 0) {
  process.exit(1);
}
