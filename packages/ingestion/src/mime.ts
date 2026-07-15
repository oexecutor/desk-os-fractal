export type SourceArtifactKind = "text" | "markdown" | "json" | "pdf" | "docx";

export class UnsupportedFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedFileError";
  }
}

const EXTENSION_KIND: Record<string, SourceArtifactKind> = {
  ".txt": "text",
  ".md": "markdown",
  ".markdown": "markdown",
  ".json": "json",
  ".pdf": "pdf",
  ".docx": "docx",
};

function extensionOf(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx).toLowerCase();
}

/**
 * specs/INGESTION_PIPELINE.md passo 1: "validar tamanho e MIME real", não
 * apenas a extensão declarada. Faz sniffing por magic bytes para os formatos
 * binários (PDF, DOCX/ZIP) e recusa quando o conteúdo não bate com a
 * extensão anunciada — mitiga upload malicioso (specs/SECURITY_ARCHITECTURE.md).
 */
export function detectKind(filename: string, buffer: Uint8Array): SourceArtifactKind {
  const declared = EXTENSION_KIND[extensionOf(filename)];
  if (!declared) {
    throw new UnsupportedFileError(`Extensão não suportada: ${filename}`);
  }

  const isPdfMagic = buffer.length >= 5 && Buffer.from(buffer.subarray(0, 5)).toString("latin1") === "%PDF-";
  const isZipMagic =
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07);

  if (declared === "pdf" && !isPdfMagic) {
    throw new UnsupportedFileError(`Conteúdo não corresponde a PDF: ${filename}`);
  }
  if (declared === "docx" && !isZipMagic) {
    throw new UnsupportedFileError(`Conteúdo não corresponde a DOCX (zip): ${filename}`);
  }
  if (declared === "json") {
    // validação estrutural real acontece no extractor; aqui só barra binários óbvios.
    if (isPdfMagic || isZipMagic) {
      throw new UnsupportedFileError(`Conteúdo binário declarado como JSON: ${filename}`);
    }
  }

  return declared;
}

export function mediaTypeFor(kind: SourceArtifactKind): string {
  switch (kind) {
    case "text":
      return "text/plain";
    case "markdown":
      return "text/markdown";
    case "json":
      return "application/json";
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
}
