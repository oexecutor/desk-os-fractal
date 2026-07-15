import { describe, expect, it } from "vitest";
import { PrintOverflowError, validateContentBudget } from "./content-budget.js";
import { CLOSEOUT_FIELDS, RECYCLE_OPTIONS, type PrintFace1, type PrintFace2 } from "./print-snapshot.js";

function validFace1(): PrintFace1 {
  return {
    user_label: "João",
    context_trail: ["Projeto"],
    week_label: "W29",
    date_range: "13-17 JUL",
    dominant_result: "Resultado dominante curto e claro.",
    definition_of_done: "Definição de concluído curta.",
    weekly_contract: { blocks: 5, actions: 15, syntheses: 5 },
    blocks: Array.from({ length: 5 }, (_, i) => ({
      day_label: (["SEG", "TER", "QUA", "QUI", "SEX"] as const)[i]!,
      title: `Bloco ${i}`,
      synthesis_title: `LINK ${i}`,
    })),
    known_risks: [],
    qr_token_id: "token0000000000000001",
  };
}

function validFace2(): PrintFace2 {
  return {
    project_label: "Projeto",
    week_label: "W29",
    days: (["SEG", "TER", "QUA", "QUI", "SEX"] as const).map((day) => ({
      day_label: day,
      block_title: `Bloco ${day}`,
      method_tag: null,
      actions: [0, 1, 2].map((i) => ({
        id: `action${day}${i}0000000001`,
        title: `Ação ${i}`,
        done_criteria: "Feito",
      })),
      synthesis: { id: `synth${day}0000000001`, title: `LINK ${day}`, completion_rule: "ALL_THREE_ACTIONS_DONE" },
    })),
    recycle_options: RECYCLE_OPTIONS,
    closeout_fields: CLOSEOUT_FIELDS,
    qr_token_id: "token0000000000000001",
  };
}

describe("validateContentBudget — specs/PHYSICAL_DASHBOARD_FOLDED_WEEKLY.md §5", () => {
  it("aceita conteúdo dentro dos limites", () => {
    expect(() => validateContentBudget(validFace1(), validFace2())).not.toThrow();
  });

  it("rejeita resultado dominante acima de 110 caracteres", () => {
    const face1 = { ...validFace1(), dominant_result: "x".repeat(111) };
    expect(() => validateContentBudget(face1, validFace2())).toThrow(PrintOverflowError);
  });

  it("rejeita mais de 3 riscos conhecidos", () => {
    const face1 = { ...validFace1(), known_risks: ["a", "b", "c", "d"] };
    expect(() => validateContentBudget(face1, validFace2())).toThrow(PrintOverflowError);
  });

  it("rejeita dia com menos ou mais de 3 ações", () => {
    const face2 = validFace2();
    face2.days[0]!.actions = face2.days[0]!.actions.slice(0, 2);
    expect(() => validateContentBudget(validFace1(), face2)).toThrow(PrintOverflowError);
  });

  it("relata TODAS as violações, não só a primeira", () => {
    const face1 = { ...validFace1(), dominant_result: "x".repeat(200), known_risks: ["a", "b", "c", "d"] };
    try {
      validateContentBudget(face1, validFace2());
      expect.fail("deveria ter lançado");
    } catch (err) {
      const violations = (err as PrintOverflowError).violations;
      expect(violations.length).toBeGreaterThanOrEqual(2);
    }
  });
});
