import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractMarkdown } from "./markdown.js";

const FIXTURE = path.resolve(import.meta.dirname, "../__fixtures__/sample.md");

describe("extractMarkdown", () => {
  it("preserva estrutura de headings e listas separadamente de parágrafos", () => {
    const buffer = readFileSync(FIXTURE);
    const { blocks, warnings } = extractMarkdown(buffer);
    expect(warnings).toEqual([]);

    const headings = blocks.filter((b) => b.kind === "heading");
    expect(headings.map((h) => h.text)).toEqual(["Título principal", "Subtítulo"]);
    expect(headings[0]?.data).toEqual({ level: 1 });
    expect(headings[1]?.data).toEqual({ level: 2 });

    const lists = blocks.filter((b) => b.kind === "list");
    expect(lists).toHaveLength(1);
    expect(lists[0]?.data).toEqual(["item um", "item dois", "item três"]);

    const paragraphs = blocks.filter((b) => b.kind === "paragraph");
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
  });
});
