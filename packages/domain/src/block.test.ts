import { describe, expect, it } from "vitest";
import { computeSynthesisStatus, selectNextAction } from "./block.js";
import type { WorkNode } from "./types.js";

type TestNodeInput = Partial<Record<keyof WorkNode, unknown>>;

function action(id: string, status: WorkNode["status"], overrides: TestNodeInput = {}) {
  return { id, status, order: 0, dependencies: [], ...overrides } as unknown as WorkNode;
}

describe("computeSynthesisStatus", () => {
  it("DONE somente quando as 3 ações estão DONE (ALL_CHILDREN)", () => {
    const synthesis = { completion_rule: { kind: "ALL_CHILDREN" as const } };
    expect(
      computeSynthesisStatus(synthesis, [
        { status: "DONE" },
        { status: "DONE" },
        { status: "DONE" },
      ]),
    ).toBe("DONE");
    expect(
      computeSynthesisStatus(synthesis, [
        { status: "DONE" },
        { status: "DONE" },
        { status: "TODO" },
      ]),
    ).toBe("IN_PROGRESS");
  });

  it("respeita THRESHOLD com minimum_complete", () => {
    const synthesis = { completion_rule: { kind: "THRESHOLD" as const, minimum_complete: 2 } };
    expect(
      computeSynthesisStatus(synthesis, [
        { status: "DONE" },
        { status: "DONE" },
        { status: "TODO" },
      ]),
    ).toBe("DONE");
  });

  it("propaga BLOCKED quando nenhuma ação está concluída e alguma está bloqueada", () => {
    const synthesis = { completion_rule: { kind: "ALL_CHILDREN" as const } };
    expect(
      computeSynthesisStatus(synthesis, [
        { status: "BLOCKED" },
        { status: "TODO" },
        { status: "TODO" },
      ]),
    ).toBe("BLOCKED");
  });
});

describe("selectNextAction — specs/SPRINT_AND_FOCUS_PROJECTIONS.md", () => {
  it("prioriza a ação IN_PROGRESS não bloqueada", () => {
    const actions = [action("a1", "DONE"), action("a2", "IN_PROGRESS"), action("a3", "TODO")];
    expect(selectNextAction(actions)?.id).toBe("a2");
  });

  it("escolhe a primeira TODO elegível quando não há IN_PROGRESS", () => {
    const actions = [
      action("a1", "DONE"),
      action("a2", "TODO", { order: 2 }),
      action("a3", "TODO", { order: 1 }),
    ];
    expect(selectNextAction(actions)?.id).toBe("a3");
  });

  it("respeita dependências não satisfeitas", () => {
    const actions = [
      action("a1", "TODO", { order: 0, dependencies: ["a2"] }),
      action("a2", "TODO", { order: 1 }),
    ];
    expect(selectNextAction(actions)?.id).toBe("a2");
  });

  it("retorna null quando nada é elegível (bloqueio)", () => {
    const actions = [action("a1", "BLOCKED"), action("a2", "DONE")];
    expect(selectNextAction(actions)).toBeNull();
  });

  it("respeita foco explícito do usuário", () => {
    const actions = [action("a1", "TODO", { order: 0 }), action("a2", "TODO", { order: 1 })];
    expect(selectNextAction(actions, { focusedNodeId: "a2" })?.id).toBe("a2");
  });
});
