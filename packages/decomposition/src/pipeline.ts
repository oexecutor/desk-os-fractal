import {
  createId,
  validateGraphInvariants,
  validateOperationalBlock,
  type PlanVersion,
  type SourceArtifactId,
  type WorkNodeId,
} from "@desk-os/domain";
import { validateOrThrow } from "@desk-os/schemas";
import {
  classify,
  decomposeDraft,
  extractContext,
  type StructuredModelClient,
} from "@desk-os/agents";
import { critiquePlan } from "./critic.js";
import { remapAliasesToStableIds } from "./remap-ids.js";

/**
 * specs/DECOMPOSITION_ENGINE.md — Falhas: "entrada insuficiente: gerar
 * relatório de lacunas, não plano artificial." `plan-version.schema.json`
 * exige >=1 nó, então uma classificação indeterminada/baixa-confiança nunca
 * produz um PlanVersion (nem um placeholder vazio) — apenas este relatório,
 * que o chamador (apps/functions) usa para marcar o IngestionJob como
 * BLOCKED sem `result_plan_version_id`.
 */
export class InsufficientInputError extends Error {
  constructor(
    public readonly classificationKind: "single_project" | "portfolio" | "indeterminate",
    public readonly gaps: string[],
  ) {
    super(
      "Entrada insuficiente para decomposição: classificação indeterminada ou de baixa confiança.",
    );
    this.name = "InsufficientInputError";
  }
}

export interface DecompositionInput {
  client: StructuredModelClient;
  workspaceId: string;
  sourceText: string;
  userContext?: string;
  sourceArtifactIds?: string[];
  /** specs/DECOMPOSITION_ENGINE.md: "baixa confiança de classificação: pedir revisão em vez de adivinhar". */
  minClassificationConfidence?: number;
}

/**
 * specs/DECOMPOSITION_ENGINE.md pipeline completo: Classify → Extract facts
 * → Propose structure → Generate actions/synthesis → Deterministic
 * Validation → Critique → Final draft. Nunca ativa o plano (ADR-0007) —
 * sempre retorna GENERATED ou BLOCKED.
 */
export async function runDecompositionPipeline(input: DecompositionInput): Promise<PlanVersion> {
  const minConfidence = input.minClassificationConfidence ?? 0.5;
  const planVersionId = createId();
  const now = new Date().toISOString();
  const sourceArtifactIds = input.sourceArtifactIds ?? [];
  const defaultSourceArtifactId = sourceArtifactIds[0] ?? null;

  const classification = await classify(input.client, input.sourceText);

  if (classification.kind === "indeterminate" || classification.confidence < minConfidence) {
    throw new InsufficientInputError(classification.kind, classification.gaps);
  }

  const analysisRecords = await extractContext(input.client, input.sourceText, input.userContext);
  const draft = await decomposeDraft(input.client, input.sourceText, analysisRecords, input.userContext);

  const remap = remapAliasesToStableIds(draft, {
    workspaceId: input.workspaceId,
    planVersionId,
    defaultSourceArtifactId,
  });

  const graphResult = validateGraphInvariants(remap.nodes, remap.rootNodeIds as WorkNodeId[]);

  const blockErrors = remap.nodes
    .filter((n) => n.node_type === "block")
    .flatMap((block) => validateOperationalBlock(block, remap.nodes).errors);

  const critic = critiquePlan(remap.nodes);

  const errors = [...remap.errors, ...graphResult.errors, ...blockErrors];
  const gaps = [
    ...classification.gaps,
    ...analysisRecords.filter((r) => r.classification === "GAP").map((r) => r.statement),
  ];

  const planVersion: PlanVersion = {
    schema_version: "1.0.0",
    id: planVersionId as PlanVersion["id"],
    workspace_id: input.workspaceId as PlanVersion["workspace_id"],
    version: 1,
    lifecycle_state: errors.length > 0 ? "BLOCKED" : "GENERATED",
    input_kind: draft.input_kind,
    objective: draft.objective,
    dominant_result: draft.dominant_result,
    root_node_ids: remap.rootNodeIds as PlanVersion["root_node_ids"],
    nodes: remap.nodes,
    validation_report: {
      valid: errors.length === 0,
      errors,
      warnings: critic.warnings,
      gaps,
    },
    source_artifact_ids: sourceArtifactIds as SourceArtifactId[],
    created_at: now,
    approved_at: null,
    approved_by: null,
  };

  return validateOrThrow<PlanVersion>("planVersion", planVersion);
}
