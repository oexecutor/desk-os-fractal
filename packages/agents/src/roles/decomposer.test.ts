import { describe, expect, it } from "vitest";
import { FakeModelClient } from "../fake-model-client.js";
import { decomposeDraft } from "./decomposer.js";
import { ModelOutputInvalidError } from "../model-client.js";

function validDraft() {
  return {
    input_kind: "single_project" as const,
    objective: "Digitalizar operação",
    dominant_result: "Piloto validado",
    root_aliases: ["project-1"],
    nodes: [
      { alias: "project-1", parent_alias: null, node_type: "project", title: "Projeto", order: 0 },
      {
        alias: "action-1",
        parent_alias: "project-1",
        node_type: "action",
        title: "Mapear processo",
        order: 0,
        done_criteria: ["Mapa produzido"],
      },
    ],
  };
}

describe("decomposeDraft — nunca ativa o plano, usa aliases temporários", () => {
  it("aceita um draft schema-valid com aliases", async () => {
    const client = new FakeModelClient(() => validDraft());
    const draft = await decomposeDraft(client, "fonte", []);
    expect(draft.root_aliases).toEqual(["project-1"]);
    expect(draft.nodes).toHaveLength(2);
  });

  it("rejeita alias duplicado", async () => {
    const client = new FakeModelClient(() => {
      const draft = validDraft();
      draft.nodes.push({ ...draft.nodes[1]!, alias: "action-1" });
      return draft;
    });
    await expect(decomposeDraft(client, "fonte", [])).rejects.toThrow(ModelOutputInvalidError);
  });

  it("rejeita ação sem done_criteria", async () => {
    const client = new FakeModelClient(() => ({
      ...validDraft(),
      nodes: [
        { alias: "p1", parent_alias: null, node_type: "project", title: "P", order: 0 },
        { alias: "a1", parent_alias: "p1", node_type: "action", title: "Ação vaga", order: 0 },
      ],
    }));
    await expect(decomposeDraft(client, "fonte", [])).rejects.toThrow(ModelOutputInvalidError);
  });
});
