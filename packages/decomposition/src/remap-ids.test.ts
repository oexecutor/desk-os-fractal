import { describe, expect, it } from "vitest";
import { validateGraphInvariants } from "@desk-os/domain";
import { remapAliasesToStableIds } from "./remap-ids.js";
import type { DecomposerDraftOutput } from "@desk-os/agents";

function baseDraft(): DecomposerDraftOutput {
  return {
    input_kind: "single_project",
    objective: "Digitalizar operação",
    dominant_result: "Piloto validado",
    root_aliases: ["project-1"],
    nodes: [
      { alias: "project-1", parent_alias: null, node_type: "project", title: "Projeto", order: 0 },
      { alias: "block-1", parent_alias: "project-1", node_type: "block", title: "Bloco 1", order: 0 },
      {
        alias: "action-1",
        parent_alias: "block-1",
        node_type: "action",
        title: "Mapear processo atual",
        order: 0,
        done_criteria: ["Mapa produzido"],
      },
      {
        alias: "synthesis-1",
        parent_alias: "block-1",
        node_type: "synthesis",
        title: "Entregável do bloco",
        order: 1,
      },
    ],
  };
}

describe("remapAliasesToStableIds — ADR-0014", () => {
  it("gera IDs estáveis (nunca o alias em si) e propaga project_id", () => {
    const result = remapAliasesToStableIds(baseDraft(), {
      workspaceId: "0123456789abcdef0001",
      planVersionId: "0123456789abcdef0002",
      defaultSourceArtifactId: "0123456789abcdef0003",
    });
    expect(result.errors).toEqual([]);
    expect(result.nodes).toHaveLength(4);

    const project = result.nodes.find((n) => n.node_type === "project")!;
    expect(project.id).not.toBe("project-1");
    expect(project.project_id).toBe(project.id);

    const action = result.nodes.find((n) => n.node_type === "action")!;
    expect(action.project_id).toBe(project.id);
    expect(action.depth).toBe(2);

    const synthesis = result.nodes.find((n) => n.node_type === "synthesis")!;
    expect(synthesis.completion_rule.kind).toBe("ALL_CHILDREN");
  });

  it("produz um grafo que passa nas invariantes estruturais do domínio", () => {
    const result = remapAliasesToStableIds(baseDraft(), {
      workspaceId: "0123456789abcdef0001",
      planVersionId: "0123456789abcdef0002",
      defaultSourceArtifactId: null,
    });
    const graph = validateGraphInvariants(result.nodes, result.rootNodeIds as never);
    expect(graph.valid).toBe(true);
  });

  it("reporta parent_alias inexistente sem lançar exceção", () => {
    const draft = baseDraft();
    draft.nodes[1]!.parent_alias = "nao-existe";
    const result = remapAliasesToStableIds(draft, {
      workspaceId: "0123456789abcdef0001",
      planVersionId: "0123456789abcdef0002",
      defaultSourceArtifactId: null,
    });
    expect(result.errors.some((e) => e.includes("nao-existe"))).toBe(true);
  });

  it("reporta alias duplicado", () => {
    const draft = baseDraft();
    draft.nodes.push({ ...draft.nodes[2]!, alias: "action-1" });
    const result = remapAliasesToStableIds(draft, {
      workspaceId: "0123456789abcdef0001",
      planVersionId: "0123456789abcdef0002",
      defaultSourceArtifactId: null,
    });
    expect(result.errors.some((e) => e.includes("duplicado"))).toBe(true);
  });

  it("reporta dependency_alias inexistente", () => {
    const draft = baseDraft();
    draft.nodes[2]!.dependency_aliases = ["fantasma"];
    const result = remapAliasesToStableIds(draft, {
      workspaceId: "0123456789abcdef0001",
      planVersionId: "0123456789abcdef0002",
      defaultSourceArtifactId: null,
    });
    expect(result.errors.some((e) => e.includes("fantasma"))).toBe(true);
  });
});
