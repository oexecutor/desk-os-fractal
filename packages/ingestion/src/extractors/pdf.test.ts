import { describe, expect, it } from "vitest";
import { extractPdf } from "./pdf.js";

/** PDF 1.4 mínimo, com uma página de texto simples — usado para exercitar o
 * extractor real (pdf-parse/pdfjs-dist) sem depender de um binário externo. */
function buildMinimalPdf(text: string): Buffer {
  const content = `BT /F1 24 Tf 20 700 Td (${text}) Tj ET`;
  const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/MediaBox[0 0 600 800]/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length ${content.length}>>
stream
${content}
endstream
endobj
xref
0 6
0000000000 65535 f
trailer<</Size 6/Root 1 0 R>>
startxref
0
%%EOF`;
  return Buffer.from(pdf, "latin1");
}

describe("extractPdf", () => {
  it("extrai texto por página com localizador page:N", async () => {
    const { blocks, warnings } = await extractPdf(buildMinimalPdf("Hello ingestion test"));
    expect(warnings).toEqual([]);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.locator).toBe("page:1");
    expect(blocks[0]?.text).toBe("Hello ingestion test");
  });

  it("LACUNA explícita quando o PDF é inválido, sem lançar exceção", async () => {
    const { blocks, warnings } = await extractPdf(Buffer.from("%PDF-1.4 corrompido"));
    expect(blocks).toEqual([]);
    expect(warnings[0]).toMatch(/^LACUNA/);
  });
});
