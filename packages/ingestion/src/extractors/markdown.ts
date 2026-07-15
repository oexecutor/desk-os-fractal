import { createId } from "@desk-os/domain";
import type { DocumentBlock } from "../extracted-document.js";

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const LIST_ITEM_RE = /^\s*([-*+]|\d+[.)])\s+/;

/** specs/INGESTION_PIPELINE.md: texto + estrutura de headings preservada. */
export function extractMarkdown(buffer: Uint8Array): {
  blocks: DocumentBlock[];
  warnings: string[];
} {
  const raw = Buffer.from(buffer).toString("utf8").replace(/\r\n/g, "\n");
  const lines = raw.split("\n");

  const blocks: DocumentBlock[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let paragraphStartLine = 0;
  let listStartLine = 0;

  const flushParagraph = () => {
    const text = paragraphBuffer.join("\n").trim();
    if (text.length > 0) {
      blocks.push({
        id: createId(),
        kind: "paragraph",
        locator: `line:${paragraphStartLine}`,
        text,
      });
    }
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push({
        id: createId(),
        kind: "list",
        locator: `line:${listStartLine}`,
        text: listBuffer.join("\n"),
        data: listBuffer.map((item) => item.replace(LIST_ITEM_RE, "").trim()),
      });
    }
    listBuffer = [];
  };

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const headingMatch = HEADING_RE.exec(line);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        id: createId(),
        kind: "heading",
        locator: `line:${lineNumber}`,
        text: (headingMatch[2] ?? "").trim(),
        data: { level: (headingMatch[1] ?? "#").length },
      });
      return;
    }

    if (LIST_ITEM_RE.test(line)) {
      flushParagraph();
      if (listBuffer.length === 0) listStartLine = lineNumber;
      listBuffer.push(line);
      return;
    }
    flushList();

    if (line.trim().length === 0) {
      flushParagraph();
      return;
    }
    if (paragraphBuffer.length === 0) paragraphStartLine = lineNumber;
    paragraphBuffer.push(line);
  });
  flushParagraph();
  flushList();

  const warnings = blocks.length === 0 ? ["Markdown vazio após normalização."] : [];
  return { blocks, warnings };
}
