import { getChildren, type WorkNode } from "@desk-os/domain";

export interface CriticReport {
  warnings: string[];
  gaps: string[];
}

const MIN_TITLE_WORDS = 2;
const BLOCK_OVERLOAD_THRESHOLD = 6;

/**
 * specs/DECOMPOSITION_ENGINE.md — Critic determinístico (sem segunda
 * chamada de LLM): ações vagas, sobrecarga de bloco, duplicação de título
 * entre irmãos e dependências quebradas. Produz avisos que entram no
 * `validation_report`, sem alterar a árvore silenciosamente.
 */
export function critiquePlan(nodes: readonly WorkNode[]): CriticReport {
  const warnings: string[] = [];
  const gaps: string[] = [];
  const idSet = new Set(nodes.map((n) => n.id));

  for (const node of nodes) {
    if (node.node_type === "action") {
      const wordCount = node.title.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount < MIN_TITLE_WORDS) {
        warnings.push(`Ação "${node.title}" (${node.id}) parece vaga — título muito curto.`);
      }
    }

    for (const depId of node.dependencies ?? []) {
      if (!idSet.has(depId)) {
        warnings.push(`${node.id} depende de um nó inexistente: ${depId}.`);
      }
    }

    if (node.risk && (node.risk.level === "HIGH" || node.risk.level === "CRITICAL")) {
      warnings.push(`Risco ${node.risk.level} em ${node.id}: ${node.risk.reason ?? "sem detalhe"}.`);
    }
  }

  const parentIds = new Set(
    nodes.map((n) => n.parent_id).filter((id): id is NonNullable<typeof id> => id !== null),
  );
  for (const parentId of parentIds) {
    const children = getChildren(nodes, parentId);
    if (children.length > BLOCK_OVERLOAD_THRESHOLD) {
      warnings.push(`Nó ${parentId} tem ${children.length} filhos — possível sobrecarga.`);
    }
    const titleCounts = new Map<string, number>();
    for (const child of children) {
      titleCounts.set(child.title, (titleCounts.get(child.title) ?? 0) + 1);
    }
    for (const [title, count] of titleCounts) {
      if (count > 1) {
        warnings.push(`Título duplicado entre irmãos de ${parentId}: "${title}" (${count}x).`);
      }
    }
  }

  return { warnings, gaps };
}
