import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SCHEMA_IDS, getValidator, validate } from "../../packages/schemas/src/index.js";

const ROOT = path.resolve(import.meta.dirname, "../..");
const FIXTURES_DIR = path.join(ROOT, "fixtures");

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, "utf8"));
}

describe("contract: every schema compiles", () => {
  for (const [name, id] of Object.entries(SCHEMA_IDS)) {
    it(`${name} (${id}) compiles`, () => {
      expect(() => getValidator(id)).not.toThrow();
    });
  }
});

describe("contract: fixtures válidas passam", () => {
  it("canonical-single-project.json valida contra plan-version", () => {
    const instance = readJson(path.join(FIXTURES_DIR, "canonical-single-project.json"));
    expect(validate("planVersion", instance)).toBe(true);
  });

  it("canonical-portfolio.json valida contra plan-version", () => {
    const instance = readJson(path.join(FIXTURES_DIR, "canonical-portfolio.json"));
    expect(validate("planVersion", instance)).toBe(true);
  });

  it("materialized-state.json valida contra materialized-state", () => {
    const instance = readJson(path.join(FIXTURES_DIR, "materialized-state.json"));
    expect(validate("materializedState", instance)).toBe(true);
  });

  it("print-snapshot.json (v1.1.0, A4_PORTRAIT_FOLDED_WEEKLY_V2) valida contra print-snapshot", () => {
    const instance = readJson(path.join(FIXTURES_DIR, "print-snapshot.json"));
    expect(validate("printSnapshot", instance)).toBe(true);
    expect((instance as { format: string }).format).toBe("A4_PORTRAIT_FOLDED_WEEKLY_V2");
  });
});

describe("contract: fixtures inválidas falham pelo motivo esperado", () => {
  it("action-without-done-criteria.json falha em work-node (allOf condicional de action)", () => {
    const instance = readJson(
      path.join(FIXTURES_DIR, "invalid", "action-without-done-criteria.json"),
    );
    const valid = validate("workNode", instance);
    expect(valid).toBe(false);
  });

  it("cycle.json e duplicate-id.json são invariantes de grafo, não de schema — ver packages/domain", () => {
    const files = readdirSync(path.join(FIXTURES_DIR, "invalid"));
    expect(files).toContain("cycle.json");
    expect(files).toContain("duplicate-id.json");
  });
});

describe("contract: events.ndjson", () => {
  it("cada linha valida contra domain-event", () => {
    const raw = readFileSync(path.join(FIXTURES_DIR, "events.ndjson"), "utf8");
    const lines = raw.split("\n").filter((l) => l.trim().length > 0);
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      expect(validate("domainEvent", JSON.parse(line))).toBe(true);
    }
  });
});
