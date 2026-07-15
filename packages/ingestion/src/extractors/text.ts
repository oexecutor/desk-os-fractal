import { createId } from "@desk-os/domain";
import type { DocumentBlock } from "../extracted-document.js";

/** specs/INGESTION_PIPELINE.md: leitura UTF-8, normalização de encoding/espaços. */
export function extractText(buffer: Uint8Array): { blocks: DocumentBlock[]; warnings: string[] } {
  const raw = Buffer.from(buffer).toString("utf8");
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  const paragraphs = normalized.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  const blocks: DocumentBlock[] = paragraphs.map((text, index) => ({
    id: createId(),
    kind: "paragraph",
    locator: `paragraph:${index + 1}`,
    text: text.trim(),
  }));

  const warnings = blocks.length === 0 ? ["Arquivo de texto vazio após normalização."] : [];
  return { blocks, warnings };
}
