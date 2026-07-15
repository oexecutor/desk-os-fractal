import {
  canEmitOperationalPrint,
  createId,
  getChildren,
  validateOperationalBlock,
  type PlanVersion,
} from "@desk-os/domain";
import { validateOrThrow } from "@desk-os/schemas";
import { computePrintChecksum } from "./checksum.js";
import { validateContentBudget } from "./content-budget.js";
import {
  CLOSEOUT_FIELDS,
  DAY_LABELS,
  PRINT_LAYOUT,
  RECYCLE_OPTIONS,
  type DayLabel,
  type PrintFace1,
  type PrintFace2,
  type PrintSnapshot,
} from "./print-snapshot.js";

export class PlanNotActiveForPrintError extends Error {
  constructor() {
    super("PLAN_NOT_ACTIVE: só um plano ACTIVE pode ser emitido (ADR-0017/CR-001).");
    this.name = "PlanNotActiveForPrintError";
  }
}

export interface ComposePrintSnapshotInput {
  plan: PlanVersion;
  workspaceId: string;
  sprintId: string;
  userLabel: string;
  contextTrail: string[];
  weekLabel: string;
  dateRange: string;
  dominantResult: string;
  definitionOfDone: string;
  projectLabel: string;
  qrTokenId: string;
  knownRisks?: string[];
  stateVersionAtEmission?: number | null;
  /** Mapeamento explícito dia -> id do bloco operacional daquele dia. A
   * seleção de "quais 5 blocos são esta semana" é uma projeção de sprint,
   * resolvida pelo chamador (specs/SPRINT_AND_FOCUS_PROJECTIONS.md) — o
   * composer só monta e valida o que já foi selecionado. */
  blocksByDay: Record<DayLabel, string>;
}

/**
 * ADR-0017/CR-001: monta o PrintSnapshot semanal (A4 retrato dobrável).
 * Rejeita plano não ativo, bloco fora do contrato 3+1, e qualquer overflow
 * de orçamento de conteúdo — nunca corta texto silenciosamente.
 */
export function composePrintSnapshot(input: ComposePrintSnapshotInput): PrintSnapshot {
  if (!canEmitOperationalPrint(input.plan.lifecycle_state)) {
    throw new PlanNotActiveForPrintError();
  }

  const face1Blocks: PrintFace1["blocks"] = [];
  const face2Days: PrintFace2["days"] = [];

  for (const day of DAY_LABELS) {
    const blockId = input.blocksByDay[day];
    const block = input.plan.nodes.find((n) => n.id === blockId);
    if (!block) {
      throw new Error(`Bloco do dia ${day} (${blockId}) não encontrado no plano ativo.`);
    }

    const operational = validateOperationalBlock(block, input.plan.nodes);
    if (!operational.valid) {
      throw new Error(`Bloco de ${day} ("${block.title}") não segue o contrato 3+1: ${operational.errors.join("; ")}`);
    }

    const children = getChildren(input.plan.nodes, block.id);
    const actions = children.filter((c) => c.node_type === "action").sort((a, b) => a.order - b.order);
    const synthesis = children.find((c) => c.node_type === "synthesis")!;

    face1Blocks.push({ day_label: day, title: block.title, synthesis_title: synthesis.title });

    const methodTag = Array.isArray(block.metadata.methodology_tags)
      ? ((block.metadata.methodology_tags as Array<{ label?: string }>)[0]?.label ?? null)
      : null;

    face2Days.push({
      day_label: day,
      block_title: block.title,
      method_tag: methodTag,
      actions: actions.map((action) => ({
        id: action.id,
        title: action.title,
        done_criteria: action.done_criteria?.[0] ?? "Critério de conclusão não informado.",
      })),
      synthesis: { id: synthesis.id, title: synthesis.title, completion_rule: "ALL_THREE_ACTIONS_DONE" },
    });
  }

  const face1: PrintFace1 = {
    user_label: input.userLabel,
    context_trail: input.contextTrail,
    week_label: input.weekLabel,
    date_range: input.dateRange,
    dominant_result: input.dominantResult,
    definition_of_done: input.definitionOfDone,
    weekly_contract: { blocks: 5, actions: 15, syntheses: 5 },
    blocks: face1Blocks,
    known_risks: input.knownRisks ?? [],
    qr_token_id: input.qrTokenId,
  };

  const face2: PrintFace2 = {
    project_label: input.projectLabel,
    week_label: input.weekLabel,
    days: face2Days,
    recycle_options: RECYCLE_OPTIONS,
    closeout_fields: CLOSEOUT_FIELDS,
    qr_token_id: input.qrTokenId,
  };

  validateContentBudget(face1, face2);

  const snapshot: PrintSnapshot = {
    schema_version: "1.1.0",
    id: createId(),
    workspace_id: input.workspaceId,
    plan_version_id: input.plan.id,
    sprint_id: input.sprintId,
    state_version_at_emission: input.stateVersionAtEmission ?? null,
    created_at: new Date().toISOString(),
    checksum: computePrintChecksum(face1, face2),
    format: "A4_PORTRAIT_FOLDED_WEEKLY_V2",
    layout: PRINT_LAYOUT,
    face1,
    face2,
  };

  return validateOrThrow<PrintSnapshot>("printSnapshot", snapshot);
}
