import { describe, expect, it } from "vitest";
import { FakeModelClient } from "../fake-model-client.js";
import { classify } from "./classifier.js";
import { ModelOutputInvalidError } from "../model-client.js";

describe("classify — specs/AGENT_CONTRACTS.md Classifier", () => {
  it("aceita saída válida do FakeModelClient", async () => {
    const client = new FakeModelClient(() => ({
      schema_version: "1.0.0",
      kind: "single_project",
      confidence: 0.92,
      evidence_refs: [{ source_artifact_id: "0123456789abcdef", locator: "paragraph:1" }],
      gaps: [],
    }));
    const result = await classify(client, "texto de projeto único");
    expect(result.kind).toBe("single_project");
  });

  it("propaga MODEL_OUTPUT_INVALID quando o modelo nunca produz saída válida", async () => {
    const client = new FakeModelClient(() => ({ kind: "not-a-valid-kind" }));
    await expect(classify(client, "texto")).rejects.toThrow(ModelOutputInvalidError);
  });
});
