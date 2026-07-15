import { createId } from "@desk-os/domain";
import { validateOrThrow } from "@desk-os/schemas";
import type { DocumentBlock, ExtractedDocument } from "./extracted-document.js";
import { extractDocx } from "./extractors/docx.js";
import { extractJson } from "./extractors/json.js";
import { extractMarkdown } from "./extractors/markdown.js";
import { extractPdf } from "./extractors/pdf.js";
import { extractText } from "./extractors/text.js";
import { detectLanguageHeuristic } from "./language.js";
import type { SourceArtifact } from "./source-artifact.js";

/**
 * specs/INGESTION_PIPELINE.md passos 4-9: cada formato tem um extractor
 * dedicado (ADR-0009); todos produzem o mesmo contrato `ExtractedDocument`.
 * O motor de decomposição nunca recebe bytes brutos.
 */
export async function extractDocument(
  artifact: SourceArtifact,
  buffer: Uint8Array,
): Promise<ExtractedDocument> {
  let blocks: DocumentBlock[];
  let warnings: string[];

  switch (artifact.kind) {
    case "text": {
      ({ blocks, warnings } = extractText(buffer));
      break;
    }
    case "markdown": {
      ({ blocks, warnings } = extractMarkdown(buffer));
      break;
    }
    case "json": {
      ({ blocks, warnings } = extractJson(buffer));
      break;
    }
    case "pdf": {
      ({ blocks, warnings } = await extractPdf(buffer));
      break;
    }
    case "docx": {
      ({ blocks, warnings } = await extractDocx(buffer));
      break;
    }
  }

  const fullText = blocks.map((b) => b.text).join("\n");
  const language = detectLanguageHeuristic(fullText);
  if (!language) {
    warnings.push("LACUNA: idioma não identificado com confiança (heurística insuficiente).");
  }

  const document: ExtractedDocument = {
    schema_version: "1.0.0",
    id: createId(),
    workspace_id: artifact.workspace_id,
    source_artifact_id: artifact.id,
    language,
    blocks,
    warnings,
    created_at: new Date().toISOString(),
  };

  return validateOrThrow("extractedDocument", document);
}
