import { FakeModelClient, type ModelRequest } from "@desk-os/agents";

const DAY_LABELS = ["SEG", "TER", "QUA", "QUI", "SEX"] as const;
const DAY_TITLES: Record<(typeof DAY_LABELS)[number], string> = {
  SEG: "Mapear situação atual",
  TER: "Diagnosticar dores",
  QUA: "Desenhar próximo passo",
  QUI: "Configurar piloto",
  SEX: "Testar e medir",
};

function isClassificationSchema(schema: Record<string, unknown>): boolean {
  const props = schema.properties as Record<string, unknown> | undefined;
  return typeof props?.kind === "object" && typeof props?.confidence === "object";
}

function isAnalysisRecordsSchema(schema: Record<string, unknown>): boolean {
  return schema.type === "array";
}

/**
 * MOCK_MODE (ENVIRONMENT_VARIABLES.md): "o aplicativo deve iniciar
 * localmente em modo mock sem chave de LLM, usando fixtures determinísticas."
 * Em vez de decidir pela ordem das chamadas (frágil sob concorrência),
 * inspeciona a forma do schema pedido — funciona para qualquer sequência.
 * Sempre produz uma semana completa (5 blocos x 3 ações + 1 síntese) para
 * que o fluxo ponta-a-ponta (decompor -> aprovar -> ativar -> imprimir ->
 * QR) seja demonstrável sem depender de inteligência real do modelo.
 */
export function createMockModelClient(): FakeModelClient {
  return new FakeModelClient((request: ModelRequest) => {
    if (isClassificationSchema(request.schema)) {
      return {
        schema_version: "1.0.0",
        kind: "single_project",
        confidence: 0.87,
        evidence_refs: [],
        gaps: [],
      };
    }

    if (isAnalysisRecordsSchema(request.schema)) {
      return [
        { classification: "FACT", statement: "Conteúdo recebido via ingestão.", source_refs: [] },
        { classification: "GAP", statement: "Detalhamento fino de prazos não informado na fonte.", source_refs: [] },
      ];
    }

    // Decomposer: sempre uma semana completa e válida.
    const nodes: Array<Record<string, unknown>> = [
      { alias: "project-1", parent_alias: null, node_type: "project", title: "Projeto (modo mock)", order: 0 },
    ];
    const rootAliases = ["project-1"];

    DAY_LABELS.forEach((day, dayIndex) => {
      const blockAlias = `block-${day}`;
      nodes.push({
        alias: blockAlias,
        parent_alias: "project-1",
        node_type: "block",
        title: DAY_TITLES[day],
        order: dayIndex,
      });
      for (let i = 0; i < 3; i += 1) {
        nodes.push({
          alias: `${blockAlias}-action-${i}`,
          parent_alias: blockAlias,
          node_type: "action",
          title: `${DAY_TITLES[day]} — ação ${i + 1}`,
          order: i,
          done_criteria: [`Ação ${i + 1} de ${day} produz um resultado verificável.`],
        });
      }
      nodes.push({
        alias: `${blockAlias}-synthesis`,
        parent_alias: blockAlias,
        node_type: "synthesis",
        title: `Entregável de ${day}`,
        order: 3,
        completion_rule: { kind: "ALL_CHILDREN" },
      });
    });

    return {
      input_kind: "single_project",
      objective: "Objetivo extraído do material de ingestão (modo mock).",
      dominant_result: "Resultado dominante da semana (modo mock).",
      root_aliases: rootAliases,
      nodes,
    };
  });
}
