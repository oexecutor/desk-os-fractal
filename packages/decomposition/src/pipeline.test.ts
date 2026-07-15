import { describe, expect, it } from "vitest";
import { FakeModelClient } from "@desk-os/agents";
import { InsufficientInputError, runDecompositionPipeline } from "./pipeline.js";

const WORKSPACE_ID = "0123456789abcdef0001";

function fakeClientFor(sequence: unknown[]) {
  let i = 0;
  return new FakeModelClient(() => {
    const value = sequence[Math.min(i, sequence.length - 1)];
    i += 1;
    return value;
  });
}

const VALID_CLASSIFICATION = {
  schema_version: "1.0.0",
  kind: "single_project",
  confidence: 0.9,
  evidence_refs: [],
  gaps: [],
};

const VALID_ANALYSIS = [
  { classification: "FACT", statement: "Prazo é sexta.", source_refs: [] },
];

function validDraft() {
  return {
    input_kind: "single_project",
    objective: "Digitalizar operação",
    dominant_result: "Piloto validado",
    root_aliases: ["project-1"],
    nodes: [
      { alias: "project-1", parent_alias: null, node_type: "project", title: "Projeto", order: 0 },
      { alias: "block-1", parent_alias: "project-1", node_type: "block", title: "Bloco 1", order: 0 },
      {
        alias: "a1",
        parent_alias: "block-1",
        node_type: "action",
        title: "Mapear processo atual",
        order: 0,
        done_criteria: ["Mapa produzido"],
      },
      {
        alias: "a2",
        parent_alias: "block-1",
        node_type: "action",
        title: "Diagnosticar dores atuais",
        order: 1,
        done_criteria: ["Diagnóstico produzido"],
      },
      {
        alias: "a3",
        parent_alias: "block-1",
        node_type: "action",
        title: "Desenhar fluxo futuro",
        order: 2,
        done_criteria: ["Fluxo desenhado"],
      },
      {
        alias: "s1",
        parent_alias: "block-1",
        node_type: "synthesis",
        title: "Entregável síntese",
        order: 3,
      },
    ],
  };
}

describe("runDecompositionPipeline — DECOMPOSITION_ENGINE.md end-to-end", () => {
  it("produz GENERATED para um bloco 3 ações + 1 síntese válido", async () => {
    const client = fakeClientFor([VALID_CLASSIFICATION, VALID_ANALYSIS, validDraft()]);
    const plan = await runDecompositionPipeline({
      client,
      workspaceId: WORKSPACE_ID,
      sourceText: "texto fonte do projeto",
    });
    expect(plan.lifecycle_state).toBe("GENERATED");
    expect(plan.validation_report.valid).toBe(true);
    expect(plan.nodes).toHaveLength(6);
  });

  it("entrada insuficiente gera relatório de lacunas, nunca um plano artificial", async () => {
    const client = fakeClientFor([
      { ...VALID_CLASSIFICATION, kind: "indeterminate", confidence: 0.3, gaps: ["sem objetivo claro"] },
    ]);
    await expect(
      runDecompositionPipeline({
        client,
        workspaceId: WORKSPACE_ID,
        sourceText: "texto ambíguo",
      }),
    ).rejects.toThrow(InsufficientInputError);

    try {
      await runDecompositionPipeline({ client, workspaceId: WORKSPACE_ID, sourceText: "texto" });
    } catch (err) {
      expect(err).toBeInstanceOf(InsufficientInputError);
      expect((err as InsufficientInputError).gaps).toContain("sem objetivo claro");
    }
  });

  it("AT-008 análogo: produz BLOCKED quando o draft tem ciclo de parent_alias", async () => {
    const draft = validDraft();
    // cria ciclo: project-1 passa a ter block-1 como pai
    draft.nodes[0]!.parent_alias = "block-1";
    const client = fakeClientFor([VALID_CLASSIFICATION, VALID_ANALYSIS, draft]);
    const plan = await runDecompositionPipeline({
      client,
      workspaceId: WORKSPACE_ID,
      sourceText: "texto",
    });
    expect(plan.lifecycle_state).toBe("BLOCKED");
    expect(plan.validation_report.errors.some((e) => e.includes("ciclo"))).toBe(true);
  });

  it("AT-033 análogo: bloco sem exatamente 3 ações é BLOCKED", async () => {
    const draft = validDraft();
    draft.nodes = draft.nodes.filter((n) => n.alias !== "a3"); // só 2 ações
    const client = fakeClientFor([VALID_CLASSIFICATION, VALID_ANALYSIS, draft]);
    const plan = await runDecompositionPipeline({
      client,
      workspaceId: WORKSPACE_ID,
      sourceText: "texto",
    });
    expect(plan.lifecycle_state).toBe("BLOCKED");
    expect(plan.validation_report.errors.some((e) => e.includes("ações"))).toBe(true);
  });

  it("nunca ativa o plano — lifecycle_state nunca é ACTIVE", async () => {
    const client = fakeClientFor([VALID_CLASSIFICATION, VALID_ANALYSIS, validDraft()]);
    const plan = await runDecompositionPipeline({
      client,
      workspaceId: WORKSPACE_ID,
      sourceText: "texto",
    });
    expect(plan.lifecycle_state).not.toBe("ACTIVE");
  });
});
