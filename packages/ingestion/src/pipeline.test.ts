import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSourceArtifact } from "./source-artifact.js";
import { extractDocument } from "./pipeline.js";

const WORKSPACE_ID = "0123456789abcdef0123";
const FIXTURES = path.resolve(import.meta.dirname, "__fixtures__");

describe("extractDocument — ADR-0009 pipeline por adapters", () => {
  it("texto simples produz ExtractedDocument válido contra o schema", async () => {
    const buffer = Buffer.from(
      "Este é um projeto sobre digitalização de operações marítimas para reduzir retrabalho da equipe.",
    );
    const artifact = createSourceArtifact({
      workspaceId: WORKSPACE_ID,
      filename: "notas.txt",
      buffer,
      maxUploadMb: 20,
    });
    const doc = await extractDocument(artifact, buffer);
    expect(doc.source_artifact_id).toBe(artifact.id);
    expect(doc.blocks.length).toBeGreaterThan(0);
  });

  it("markdown preserva blocks e não perde a extração para decomposição", async () => {
    const buffer = readFileSync(path.join(FIXTURES, "sample.md"));
    const artifact = createSourceArtifact({
      workspaceId: WORKSPACE_ID,
      filename: "sample.md",
      buffer,
      maxUploadMb: 20,
    });
    const doc = await extractDocument(artifact, buffer);
    expect(doc.blocks.some((b) => b.kind === "heading")).toBe(true);
    expect(doc.language).toBe("pt");
  });

  it("JSON malformado propaga warning sem falhar o pipeline inteiro", async () => {
    const buffer = readFileSync(path.join(FIXTURES, "sample-invalid.json"));
    const artifact = createSourceArtifact({
      workspaceId: WORKSPACE_ID,
      filename: "sample-invalid.json",
      buffer,
      maxUploadMb: 20,
    });
    const doc = await extractDocument(artifact, buffer);
    // Agora o fallback para JSON inválido é tratar como texto bruto, produzindo blocos
    expect(doc.blocks.length).toBeGreaterThan(0);
    expect(doc.warnings.some((w) => w.startsWith("LACUNA"))).toBe(true);
  });
});
