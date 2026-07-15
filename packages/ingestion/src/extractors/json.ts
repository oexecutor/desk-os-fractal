import { createId } from "@desk-os/domain";
import type { DocumentBlock } from "../extracted-document.js";

/** specs/INGESTION_PIPELINE.md: parse + schema opcional. JSON malformado é LACUNA explícita, nunca ignorado. */
export function extractJson(buffer: Uint8Array): { blocks: DocumentBlock[]; warnings: string[] } {
  const raw = Buffer.from(buffer).toString("utf8");
  try {
    const parsed: unknown = JSON.parse(raw);
    const block: DocumentBlock = {
      id: createId(),
      kind: "metadata",
      locator: "root",
      text: JSON.stringify(parsed, null, 2),
      data: parsed,
    };
    return { blocks: [block], warnings: [] };
  } catch (err) {
    return {
      blocks: [],
      warnings: [`LACUNA: JSON malformado, não foi possível interpretar (${(err as Error).message}).`],
    };
  }
}
