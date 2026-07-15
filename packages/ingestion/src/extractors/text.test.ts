import { describe, expect, it } from "vitest";
import { extractText } from "./text.js";

describe("extractText", () => {
  it("separa parágrafos por linha em branco e preserva localizador", () => {
    const buffer = Buffer.from("Primeiro parágrafo.\n\nSegundo parágrafo.\n");
    const { blocks, warnings } = extractText(buffer);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.locator).toBe("paragraph:1");
    expect(blocks[0]?.text).toBe("Primeiro parágrafo.");
    expect(warnings).toEqual([]);
  });

  it("gera warning para arquivo vazio", () => {
    const { blocks, warnings } = extractText(Buffer.from("   \n\n  "));
    expect(blocks).toEqual([]);
    expect(warnings[0]).toMatch(/vazio/);
  });
});
