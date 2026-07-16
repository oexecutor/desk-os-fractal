import { createId } from "@desk-os/domain";
import type { ExtractedDocument, DocumentBlock } from "../extracted-document.js";

interface LegacyDay {
  date: string;
  weekday: string;
  title: string;
  steps: string[];
}

interface LegacyProject {
  id: string;
  label: string;
  range: string;
  days: LegacyDay[];
}

export function isLegacyJson(content: any): content is LegacyProject[] {
  return Array.isArray(content) && content.length > 0 && "days" in content[0] && "label" in content[0];
}

export function convertLegacyJsonToExtractedDocument(projects: LegacyProject[]): Partial<ExtractedDocument> & { metadata: any } {
  const blocks: DocumentBlock[] = [];

  for (const project of projects) {
    // Bloco do Projeto
    blocks.push({
      id: createId(),
      text: `PROJETO: ${project.label} (${project.range})`,
      kind: "heading",
      locator: `legacy:${project.id}`,
      data: { level: 1 }
    });

    for (const day of project.days) {
      // Bloco do Dia
      blocks.push({
        id: createId(),
        text: `DIA: ${day.date} (${day.weekday}) - ${day.title}`,
        kind: "heading",
        locator: `legacy:${day.date}`,
        data: { level: 2 }
      });

      for (const step of day.steps) {
        // Bloco da Ação
        blocks.push({
          id: createId(),
          text: step,
          kind: "paragraph",
          locator: createId(),
          data: { is_action: true }
        });
      }
    }
  }

  return {
    id: createId(),
    blocks,
    metadata: { is_legacy_json: true }
  };
}
