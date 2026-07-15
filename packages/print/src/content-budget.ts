import type { PrintFace1, PrintFace2 } from "./print-snapshot.js";

/** specs/PHYSICAL_DASHBOARD_FOLDED_WEEKLY.md §5 — orçamento de conteúdo. */
export const CONTENT_LIMITS = {
  dominantResult: 110,
  definitionOfDone: 150,
  blockTitle: 42,
  actionTitle: 38,
  synthesisTitle: 48,
  risk: 120,
} as const;

export const MAX_KNOWN_RISKS = 3;

export class PrintOverflowError extends Error {
  constructor(public readonly violations: readonly string[]) {
    super(`Overflow de conteúdo na impressão: ${violations.join("; ")}`);
    this.name = "PrintOverflowError";
  }
}

/**
 * "Renderer deve falhar com mensagem útil" — nunca usar `.slice()` para
 * cortar silenciosamente. Coleta TODAS as violações, não só a primeira.
 */
export function validateContentBudget(face1: PrintFace1, face2: PrintFace2): void {
  const violations: string[] = [];

  const check = (value: string, limit: number, label: string) => {
    if (value.length > limit) {
      violations.push(`${label} excede ${limit} caracteres (${value.length}): "${value}"`);
    }
  };

  check(face1.dominant_result, CONTENT_LIMITS.dominantResult, "resultado dominante");
  check(face1.definition_of_done, CONTENT_LIMITS.definitionOfDone, "definition of done");

  if (face1.blocks.length !== 5) {
    violations.push(`Face 1 precisa de exatamente 5 blocos semanais, recebeu ${face1.blocks.length}.`);
  }
  for (const block of face1.blocks) {
    check(block.title, CONTENT_LIMITS.blockTitle, `título do bloco ${block.day_label}`);
    check(block.synthesis_title, CONTENT_LIMITS.synthesisTitle, `título do LINK ${block.day_label}`);
  }

  if (face1.known_risks.length > MAX_KNOWN_RISKS) {
    violations.push(`Face 1 permite no máximo ${MAX_KNOWN_RISKS} riscos, recebeu ${face1.known_risks.length}.`);
  }
  for (const risk of face1.known_risks) {
    check(risk, CONTENT_LIMITS.risk, "risco/dependência");
  }

  if (face2.days.length !== 5) {
    violations.push(`Face 2 precisa de exatamente 5 dias (SEG–SEX), recebeu ${face2.days.length}.`);
  }
  for (const day of face2.days) {
    check(day.block_title, CONTENT_LIMITS.blockTitle, `título do bloco (Face 2) ${day.day_label}`);
    if (day.actions.length !== 3) {
      violations.push(`Dia ${day.day_label} precisa de exatamente 3 ações, recebeu ${day.actions.length}.`);
    }
    for (const action of day.actions) {
      check(action.title, CONTENT_LIMITS.actionTitle, `ação de ${day.day_label} ("${action.title}")`);
      if (!action.done_criteria || action.done_criteria.length < 1) {
        violations.push(`Ação "${action.title}" de ${day.day_label} não tem done_criteria.`);
      }
    }
    check(day.synthesis.title, CONTENT_LIMITS.synthesisTitle, `LINK de ${day.day_label}`);
  }

  if (violations.length > 0) {
    throw new PrintOverflowError(violations);
  }
}
