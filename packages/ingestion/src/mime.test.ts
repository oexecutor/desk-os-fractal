import { describe, expect, it } from "vitest";
import { detectKind, mediaTypeFor, UnsupportedFileError } from "./mime.js";

describe("detectKind — specs/INGESTION_PIPELINE.md passo 1 (MIME real, não só extensão)", () => {
  it("aceita texto simples com extensão .txt", () => {
    expect(detectKind("notas.txt", Buffer.from("olá mundo"))).toBe("text");
  });

  it("rejeita extensão não suportada", () => {
    expect(() => detectKind("virus.exe", Buffer.from("MZ"))).toThrow(UnsupportedFileError);
  });

  it("rejeita PDF cujo conteúdo não começa com %PDF- (upload malicioso)", () => {
    expect(() => detectKind("falso.pdf", Buffer.from("não é pdf"))).toThrow(UnsupportedFileError);
  });

  it("aceita PDF real (magic bytes %PDF-)", () => {
    expect(detectKind("real.pdf", Buffer.from("%PDF-1.4\n..."))).toBe("pdf");
  });

  it("rejeita DOCX cujo conteúdo não é um ZIP", () => {
    expect(() => detectKind("falso.docx", Buffer.from("não é zip"))).toThrow(UnsupportedFileError);
  });

  it("aceita DOCX real (magic bytes PK)", () => {
    const zipMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
    expect(detectKind("real.docx", zipMagic)).toBe("docx");
  });

  it("mediaTypeFor mapeia cada kind ao media type correto", () => {
    expect(mediaTypeFor("json")).toBe("application/json");
    expect(mediaTypeFor("pdf")).toBe("application/pdf");
  });
});
