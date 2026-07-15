import { describe, expect, it } from "vitest";
import { critiquePlan } from "./critic.js";
import type { WorkNode } from "@desk-os/domain";

function node(overrides: Partial<Record<keyof WorkNode, unknown>>): WorkNode {
  return {
    schema_version: "1.0.0",
    id: "id0000000000000001",
    workspace_id: "ws00000000000000001",
    project_id: null,
    plan_version_id: "pv00000000000000001",
    parent_id: null,
    node_type: "action",
    title: "Verbo objeto claro",
    order: 0,
    depth: 0,
    status: "TODO",
    completion_rule: { kind: "NONE" },
    source_refs: [],
    metadata: {},
    ...overrides,
  } as unknown as WorkNode;
}

describe("critiquePlan — determinístico, sem segunda chamada de LLM", () => {
  it("sinaliza ação com título vago (menos de duas palavras)", () => {
    const action = node({ id: "a1", title: "Fazer" });
    const report = critiquePlan([action]);
    expect(report.warnings.some((w) => w.includes("vaga"))).toBe(true);
  });

  it("sinaliza dependência quebrada", () => {
    const action = node({ id: "a1", dependencies: ["fantasma"] });
    const report = critiquePlan([action]);
    expect(report.warnings.some((w) => w.includes("fantasma"))).toBe(true);
  });

  it("sinaliza sobrecarga de bloco (>6 filhos)", () => {
    const parent = node({ id: "p1", node_type: "block" });
    const children = Array.from({ length: 7 }, (_, i) =>
      node({ id: `c${i}`, parent_id: "p1", title: `Ação número ${i}`, order: i }),
    );
    const report = critiquePlan([parent, ...children]);
    expect(report.warnings.some((w) => w.includes("sobrecarga"))).toBe(true);
  });

  it("sinaliza título duplicado entre irmãos", () => {
    const parent = node({ id: "p1", node_type: "block" });
    const c1 = node({ id: "c1", parent_id: "p1", title: "Título repetido aqui" });
    const c2 = node({ id: "c2", parent_id: "p1", title: "Título repetido aqui" });
    const report = critiquePlan([parent, c1, c2]);
    expect(report.warnings.some((w) => w.includes("duplicado"))).toBe(true);
  });

  it("não sinaliza nada para um plano limpo", () => {
    const parent = node({ id: "p1", node_type: "block" });
    const c1 = node({ id: "c1", parent_id: "p1", title: "Mapear processo atual" });
    const report = critiquePlan([parent, c1]);
    expect(report.warnings).toEqual([]);
  });
});
