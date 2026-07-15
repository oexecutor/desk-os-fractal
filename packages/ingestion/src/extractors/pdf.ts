import { PDFParse } from "pdf-parse";
import { createId } from "@desk-os/domain";
import type { DocumentBlock } from "../extracted-document.js";

/** specs/INGESTION_PIPELINE.md: extração de texto e páginas; "arquivos
 * protegidos por senha retornam lacuna explícita" — nunca falha silenciosa. */
export async function extractPdf(
  buffer: Uint8Array,
): Promise<{ blocks: DocumentBlock[]; warnings: string[] }> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const blocks: DocumentBlock[] = result.pages
      .filter((page) => page.text.trim().length > 0)
      .map((page) => ({
        id: createId(),
        kind: "paragraph",
        locator: `page:${page.num}`,
        text: page.text.trim(),
      }));
    const warnings =
      blocks.length === 0 ? ["PDF sem texto extraível (possivelmente digitalizado/imagem)."] : [];
    return { blocks, warnings };
  } catch (err) {
    const message = (err as Error).message ?? String(err);
    const isPasswordIssue = /password/i.test(message);
    return {
      blocks: [],
      warnings: [
        isPasswordIssue
          ? "LACUNA: PDF protegido por senha; não foi possível extrair o conteúdo."
          : `LACUNA: falha ao interpretar PDF (${message}).`,
      ],
    };
  } finally {
    await parser.destroy();
  }
}
