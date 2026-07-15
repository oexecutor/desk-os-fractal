import { describe, expect, it, vi } from "vitest";

vi.mock("mammoth", () => ({
  default: {
    extractRawText: vi.fn(async () => ({
      value: "Primeiro parágrafo.\n\nSegundo parágrafo.\n",
      messages: [{ type: "warning", message: "estilo não mapeado" }],
    })),
  },
}));

const { extractDocx } = await import("./docx.js");

describe("extractDocx — wrapper sobre mammoth (macros nunca executadas)", () => {
  it("divide o texto extraído em parágrafos e propaga warnings do mammoth", async () => {
    const { blocks, warnings } = await extractDocx(Buffer.from("zip-fake"));
    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.text).toBe("Primeiro parágrafo.");
    expect(blocks[1]?.text).toBe("Segundo parágrafo.");
    expect(warnings).toEqual(["Mammoth: estilo não mapeado"]);
  });
});
