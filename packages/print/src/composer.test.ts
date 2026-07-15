import { describe, expect, it } from "vitest";
import { composePrintSnapshot, PlanNotActiveForPrintError } from "./composer.js";
import { PrintOverflowError } from "./content-budget.js";
import { buildWeeklyActivePlan, WORKSPACE_ID } from "./test-fixtures.js";

function baseInput(overrides: Partial<Parameters<typeof composePrintSnapshot>[0]> = {}) {
  const { plan, blocksByDay } = buildWeeklyActivePlan();
  return {
    plan,
    workspaceId: WORKSPACE_ID,
    sprintId: "sprint000000000001",
    userLabel: "João",
    contextTrail: ["Portfólio", "P2 Clean Sea", "Semana 29"],
    weekLabel: "SPRINT 2026-W29",
    dateRange: "13–17 JUL 2026",
    dominantResult: "Desenhar e validar o fluxo digital da operação.",
    definitionOfDone: "Piloto configurado e testado em operação real.",
    projectLabel: "P2 · Clean Sea",
    qrTokenId: "qrtoken00000000000001",
    blocksByDay,
    ...overrides,
  };
}

describe("composePrintSnapshot — ADR-0017/CR-001", () => {
  it("gera um PrintSnapshot válido contra o schema v1.1.0 com 5 blocos e 15 ações", () => {
    const snapshot = composePrintSnapshot(baseInput());
    expect(snapshot.format).toBe("A4_PORTRAIT_FOLDED_WEEKLY_V2");
    expect(snapshot.face1.blocks).toHaveLength(5);
    expect(snapshot.face2.days).toHaveLength(5);
    const totalActions = snapshot.face2.days.reduce((sum, d) => sum + d.actions.length, 0);
    expect(totalActions).toBe(15);
    expect(snapshot.layout.face2_rotation_deg).toBe(180);
  });

  it("face1.qr_token_id === face2.qr_token_id (ADR-0017 invariante)", () => {
    const snapshot = composePrintSnapshot(baseInput());
    expect(snapshot.face1.qr_token_id).toBe(snapshot.face2.qr_token_id);
  });

  it("rejeita plano não ACTIVE", () => {
    const input = baseInput({ plan: buildWeeklyActivePlan({ lifecycle_state: "APPROVED" }).plan });
    expect(() => composePrintSnapshot(input)).toThrow(PlanNotActiveForPrintError);
  });

  it("AT-039: falha em overflow em vez de truncar silenciosamente", () => {
    const input = baseInput({ dominantResult: "x".repeat(200) });
    expect(() => composePrintSnapshot(input)).toThrow(PrintOverflowError);
    try {
      composePrintSnapshot(input);
    } catch (err) {
      expect((err as PrintOverflowError).violations.some((v) => v.includes("resultado dominante"))).toBe(
        true,
      );
    }
  });

  it("rejeita bloco que não segue o contrato 3 ações + 1 síntese", () => {
    const { plan, blocksByDay } = buildWeeklyActivePlan();
    // remove uma ação do bloco de SEG
    plan.nodes = plan.nodes.filter((n) => n.id !== "segaction000000001");
    expect(() => composePrintSnapshot(baseInput({ plan, blocksByDay }))).toThrow(/3\+1|ações|contrato/i);
  });

  it("checksum é determinístico para o mesmo conteúdo", () => {
    const input = baseInput();
    const a = composePrintSnapshot(input);
    const b = composePrintSnapshot(baseInput());
    expect(a.checksum).toBe(b.checksum);
    expect(a.checksum).toMatch(/^[A-F0-9-]{8,64}$/);
  });

  it("checksum muda quando o conteúdo muda", () => {
    const a = composePrintSnapshot(baseInput());
    const b = composePrintSnapshot(baseInput({ dominantResult: "Outro resultado dominante qualquer." }));
    expect(a.checksum).not.toBe(b.checksum);
  });
});
