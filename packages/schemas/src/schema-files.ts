import classificationResult from "../../../schemas/classification-result.schema.json" with { type: "json" };
import command from "../../../schemas/command.schema.json" with { type: "json" };
import decompositionResult from "../../../schemas/decomposition-result.schema.json" with { type: "json" };
import domainEvent from "../../../schemas/domain-event.schema.json" with { type: "json" };
import evidence from "../../../schemas/evidence.schema.json" with { type: "json" };
import extractedDocument from "../../../schemas/extracted-document.schema.json" with { type: "json" };
import ingestionJob from "../../../schemas/ingestion-job.schema.json" with { type: "json" };
import materializedState from "../../../schemas/materialized-state.schema.json" with { type: "json" };
import planVersion from "../../../schemas/plan-version.schema.json" with { type: "json" };
import printSnapshot from "../../../schemas/print-snapshot.schema.json" with { type: "json" };
import qrToken from "../../../schemas/qr-token.schema.json" with { type: "json" };
import sourceArtifact from "../../../schemas/source-artifact.schema.json" with { type: "json" };
import workNode from "../../../schemas/work-node.schema.json" with { type: "json" };
import workspace from "../../../schemas/workspace.schema.json" with { type: "json" };

/**
 * Importados estaticamente (não `readdirSync`/`readFileSync`) de propósito:
 * um bundler de Function serverless (esbuild, via Netlify) consegue inlinar
 * `import ... with { type: "json" }` diretamente no bundle. Um `readFileSync`
 * com caminho relativo calculado em runtime quebraria assim que o bundler
 * achatasse o arquivo de saída para outro diretório — ver ADR-0004 e
 * netlify.toml.
 */
export const SCHEMA_DOCUMENTS: readonly Record<string, unknown>[] = [
  classificationResult,
  command,
  decompositionResult,
  domainEvent,
  evidence,
  extractedDocument,
  ingestionJob,
  materializedState,
  planVersion,
  printSnapshot,
  qrToken,
  sourceArtifact,
  workNode,
  workspace,
];
