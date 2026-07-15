import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getChildren, validateGraphInvariants, validateOperationalBlock } from "./graph.js";
import type { WorkNodeId } from "./ids.js";
import type { PlanVersion, WorkNode } from "./types.js";

const FIXTURES_DIR = path.resolve(import.meta.dirname, "../../../fixtures");

function loadPlan(file: string): PlanVersion {
  return JSON.parse(readFileSync(path.join(FIXTURES_DIR, file), "utf8")) as PlanVersion;
}

// Testes de invariantes estruturais operam sobre literais de string simples
// para ids; o brand nominal (WorkNodeId etc.) existe para o código de
// produção, não para fixtures de teste — por isso o cast amplo aqui.
type TestNodeInput = Partial<Record<keyof WorkNode, unknown>>;

function baseNode(overrides: TestNodeInput): WorkNode {
  return {
    schema_version: "1.0.0",
    id: "0000000000000001",
    workspace_id: "0000000000000ws1",
    project_id: null,
    plan_version_id: "0000000000000pv1",
    parent_id: null,
    node_type: "block",
    title: "bloco",
    order: 0,
    depth: 0,
    status: "TODO",
    completion_rule: { kind: "NONE" },
    source_refs: [],
    metadata: {},
    ...overrides,
  } as WorkNode;
}

describe("validateGraphInvariants — fixtures normativas", () => {
  it("aceita canonical-single-project.json", () => {
    const plan = loadPlan("canonical-single-project.json");
    const result = validateGraphInvariants(plan.nodes, plan.root_node_ids);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it("aceita canonical-portfolio.json", () => {
    const plan = loadPlan("canonical-portfolio.json");
    const result = validateGraphInvariants(plan.nodes, plan.root_node_ids);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });
});

describe("validateGraphInvariants — invariantes estruturais", () => {
  it("rejeita ciclo (fixtures/invalid/cycle.json é conceitual; reproduzido aqui como WorkNode)", () => {
    const a = baseNode({ id: "aaaaaaaaaaaaaaaa", parent_id: "bbbbbbbbbbbbbbbb", depth: 1 });
    const b = baseNode({ id: "bbbbbbbbbbbbbbbb", parent_id: "aaaaaaaaaaaaaaaa", depth: 1 });
    const result = validateGraphInvariants([a, b], []);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("ciclo"))).toBe(true);
  });

  it("rejeita ID duplicado (fixtures/invalid/duplicate-id.json)", () => {
    const a = baseNode({ id: "dddddddddddddddd", parent_id: null, depth: 0 });
    const b = baseNode({ id: "dddddddddddddddd", parent_id: null, depth: 0 });
    const result = validateGraphInvariants([a, b], [
      "dddddddddddddddd" as unknown as WorkNodeId,
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("duplicado"))).toBe(true);
  });

  it("rejeita parent_id órfão", () => {
    const a = baseNode({ id: "orphan0000000001", parent_id: "nao-existe-0000000", depth: 1 });
    const result = validateGraphInvariants([a], []);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("inexistente"))).toBe(true);
  });

  it("rejeita order duplicado entre irmãos", () => {
    const root = baseNode({ id: "root0000000000001", depth: 0 });
    const c1 = baseNode({ id: "child000000000001", parent_id: root.id, depth: 1, order: 0 });
    const c2 = baseNode({ id: "child000000000002", parent_id: root.id, depth: 1, order: 0 });
    const result = validateGraphInvariants([root, c1, c2], [root.id]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("order duplicado"))).toBe(true);
  });

  it("rejeita depth inconsistente", () => {
    const root = baseNode({ id: "root0000000000002", depth: 0 });
    const child = baseNode({ id: "child000000000003", parent_id: root.id, depth: 5 });
    const result = validateGraphInvariants([root, child], [root.id]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("depth inconsistente"))).toBe(true);
  });

  it("rejeita action sem done_criteria (fixtures/invalid/action-without-done-criteria.json)", () => {
    const action = baseNode({
      id: "action00000000001",
      node_type: "action",
      done_criteria: [],
    });
    const result = validateGraphInvariants([action], [action.id]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("done_criteria"))).toBe(true);
  });

  it("rejeita synthesis com completion_rule manual", () => {
    const synthesis = baseNode({
      id: "synth0000000000001",
      node_type: "synthesis",
      completion_rule: { kind: "MANUAL" },
    });
    const result = validateGraphInvariants([synthesis], [synthesis.id]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("ALL_CHILDREN"))).toBe(true);
  });
});

describe("validateOperationalBlock", () => {
  it("exige exatamente três ações e uma síntese", () => {
    const block = baseNode({ id: "block0000000000001", node_type: "block" });
    const action1 = baseNode({
      id: "act1000000000001",
      parent_id: block.id,
      node_type: "action",
      order: 0,
      done_criteria: ["feito"],
    });
    const action2 = baseNode({
      id: "act2000000000002",
      parent_id: block.id,
      node_type: "action",
      order: 1,
      done_criteria: ["feito"],
    });
    const synthesis = baseNode({
      id: "synth000000000003",
      parent_id: block.id,
      node_type: "synthesis",
      order: 2,
      completion_rule: { kind: "ALL_CHILDREN" },
    });
    const nodes = [block, action1, action2, synthesis];

    const incomplete = validateOperationalBlock(block, nodes);
    expect(incomplete.valid).toBe(false);
    expect(incomplete.errors.some((e) => e.includes("2 ações"))).toBe(true);

    const action3 = baseNode({
      id: "act3000000000004",
      parent_id: block.id,
      node_type: "action",
      order: 3,
      done_criteria: ["feito"],
    });
    const complete = validateOperationalBlock(block, [...nodes, action3]);
    expect(complete.valid).toBe(true);
    expect(complete.errors).toEqual([]);
  });

  it("getChildren ordena por order", () => {
    const block = baseNode({ id: "block0000000000002" });
    const c2 = baseNode({ id: "c2000000000000001", parent_id: block.id, order: 2 });
    const c1 = baseNode({ id: "c1000000000000001", parent_id: block.id, order: 1 });
    const children = getChildren([block, c2, c1], block.id);
    expect(children.map((c) => c.id)).toEqual([c1.id, c2.id]);
  });
});
