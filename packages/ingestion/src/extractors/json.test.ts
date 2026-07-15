import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractJson } from "./json.js";

const FIXTURES = path.resolve(import.meta.dirname, "../__fixtures__");

describe("extractJson", () => {
  it("produz um único bloco metadata com o objeto parseado", () => {
    const buffer = readFileSync(path.join(FIXTURES, "sample.json"));
    const { blocks, warnings } = extractJson(buffer);
    expect(warnings).toEqual([]);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.kind).toBe("metadata");
    expect(blocks[0]?.data).toEqual({
      project: "Clean Sea",
      objective: "Digitalizar operação",
      risks: ["prazo", "dados"],
    });
  });

  it("LACUNA explícita para JSON malformado, sem lançar exceção", () => {
    const buffer = readFileSync(path.join(FIXTURES, "sample-invalid.json"));
    const { blocks, warnings } = extractJson(buffer);
    expect(blocks).toEqual([]);
    expect(warnings[0]).toMatch(/^LACUNA/);
  });
});
