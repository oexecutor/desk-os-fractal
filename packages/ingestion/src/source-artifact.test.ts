import { describe, expect, it } from "vitest";
import { createSourceArtifact, PayloadTooLargeError } from "./source-artifact.js";

const WORKSPACE_ID = "0123456789abcdef0123";

describe("createSourceArtifact", () => {
  it("cria um SourceArtifact válido contra o schema normativo", () => {
    const artifact = createSourceArtifact({
      workspaceId: WORKSPACE_ID,
      filename: "notas.txt",
      buffer: Buffer.from("conteúdo de teste"),
      maxUploadMb: 20,
    });
    expect(artifact.kind).toBe("text");
    expect(artifact.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(artifact.retention.keep_original).toBe(false);
  });

  it("PAYLOAD_TOO_LARGE quando excede o limite configurado", () => {
    const buffer = Buffer.alloc(2 * 1024 * 1024, "a");
    expect(() =>
      createSourceArtifact({
        workspaceId: WORKSPACE_ID,
        filename: "grande.txt",
        buffer,
        maxUploadMb: 1,
      }),
    ).toThrow(PayloadTooLargeError);
  });
});
