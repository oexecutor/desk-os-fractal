import { describe, expect, it } from "vitest";
import {
  resolveActiveBlock,
  resolveCurrentContext,
  resolveNearestGate,
  resolveTodayAction,
} from "./legacy-resolvers.js";
import { buildTwoBlockPlan, emptyState, withNodeState } from "./test-fixtures.js";

describe("resolvers específicos — specs/QR_ROUTER.md 'nunca um resolvedor genérico ambíguo'", () => {
  it("resolveActiveBlock retorna o primeiro bloco não concluído", () => {
    const result = resolveActiveBlock(buildTwoBlockPlan(), emptyState());
    expect(result.target_id).toBe("blockseg000000000001");
  });

  it("resolveCurrentContext retorna o contexto do plano, sem mutar nada", () => {
    const result = resolveCurrentContext(buildTwoBlockPlan());
    expect(result.found).toBe(true);
  });

  it("AT-043: resolveTodayAction e resolveNearestGate divergem para o mesmo estado", () => {
    const plan = buildTwoBlockPlan();
    plan.nodes = plan.nodes.map((n) =>
      n.id === "blockseg000000000001"
        ? { ...n, schedule: { date: "2026-07-13" } }
        : n.id === "blockter000000000001"
          ? { ...n, schedule: { date: "2020-01-01", end_at: "2020-01-01T23:59:59Z" } }
          : n,
    );
    const state = emptyState();
    const now = new Date("2026-07-13T12:00:00Z");

    const today = resolveTodayAction(plan, state, now);
    const gate = resolveNearestGate(plan, state, now);

    expect(today.target_id).not.toBeNull();
    expect(gate.target_id).not.toBeNull();
    expect(today.target_id).not.toBe(gate.target_id);
    expect(gate.target_id).toBe("blockter000000000001"); // atrasado
  });

  it("resolveTodayAction não encontra nada quando nenhum bloco é de hoje", () => {
    const result = resolveTodayAction(buildTwoBlockPlan(), emptyState(), new Date("2026-07-13T12:00:00Z"));
    expect(result.found).toBe(false);
  });

  it("resolveNearestGate ignora nós já concluídos mesmo que atrasados", () => {
    const plan = buildTwoBlockPlan();
    plan.nodes = plan.nodes.map((n) =>
      n.id === "blockseg000000000001" ? { ...n, schedule: { date: "2020-01-01" } } : n,
    );
    const state = withNodeState(emptyState(), "blockseg000000000001", "DONE");
    const result = resolveNearestGate(plan, state, new Date("2026-07-13T12:00:00Z"));
    expect(result.found).toBe(false);
  });
});
