import mammoth from "mammoth";
import { createId } from "@desk-os/domain";
import type { DocumentBlock } from "../extracted-document.js";

/** specs/INGESTION_PIPELINE.md: extração de parágrafos/tabelas; "macros
 * nunca executadas" — mammoth só lê o XML do pacote .docx, nunca avalia VBA. */
export async function extractDocx(
  buffer: Uint8Array,
): Promise<{ blocks: DocumentBlock[]; warnings: string[] }> {
  const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });

  const paragraphs = result.value
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const blocks: DocumentBlock[] = paragraphs.map((text, index) => ({
    id: createId(),
    kind: "paragraph",
    locator: `paragraph:${index + 1}`,
    text,
  }));

  const warnings = result.messages
    .filter((m) => m.type === "warning" || m.type === "error")
    .map((m) => `Mammoth: ${m.message}`);

  if (blocks.length === 0) {
    warnings.push("DOCX sem texto extraível.");
  }

  return { blocks, warnings };
}
