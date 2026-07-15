import { describe, expect, it } from "vitest";
import { FakeModelClient } from "../fake-model-client.js";
import { extractContext } from "./context-extractor.js";
import { ModelOutputInvalidError } from "../model-client.js";

describe("extractContext — FACT/EVIDENCE/INFERENCE/HYPOTHESIS/COUNTEREVIDENCE/GAP", () => {
  it("aceita registros de análise válidos", async () => {
    const client = new FakeModelClient(() => [
      { classification: "FACT", statement: "Prazo é 17 de julho.", source_refs: ["paragraph:1"] },
      { classification: "GAP", statement: "Orçamento não informado.", source_refs: [] },
    ]);
    const records = await extractContext(client, "texto fonte");
    expect(records).toHaveLength(2);
    expect(records[1]?.classification).toBe("GAP");
  });

  it("rejeita classification fora do vocabulário normativo", async () => {
    const client = new FakeModelClient(() => [
      { classification: "OPINION", statement: "x", source_refs: [] },
    ]);
    await expect(extractContext(client, "texto")).rejects.toThrow(ModelOutputInvalidError);
  });
});
