import { createId, type CompletionRule, type WorkNode, type WorkNodeId } from "@desk-os/domain";
import type { DecomposerDraftNode, DecomposerDraftOutput } from "@desk-os/agents";

export interface RemapContext {
  workspaceId: string;
  planVersionId: string;
  defaultSourceArtifactId: string | null;
}

export interface RemapResult {
  nodes: WorkNode[];
  rootNodeIds: string[];
  /** Referências (parent/dependency/root) que não resolveram para um alias real. */
  errors: string[];
}

function defaultCompletionRule(nodeType: DecomposerDraftNode["node_type"]): CompletionRule {
  if (nodeType === "synthesis") return { kind: "ALL_CHILDREN" };
  if (nodeType === "action") return { kind: "MANUAL" };
  return { kind: "NONE" };
}

/**
 * ADR-0014: o Decomposer nunca produz IDs estáveis — apenas aliases. Este é
 * o único lugar do sistema que transforma alias -> ID estável (ULID),
 * calcula depth e propaga project_id a partir do ancestral "project".
 */
export function remapAliasesToStableIds(
  draft: DecomposerDraftOutput,
  ctx: RemapContext,
): RemapResult {
  const errors: string[] = [];
  const aliasToId = new Map<string, string>();
  for (const node of draft.nodes) {
    if (aliasToId.has(node.alias)) {
      errors.push(`alias duplicado no draft: ${node.alias}`);
      continue;
    }
    aliasToId.set(node.alias, createId());
  }

  const byAlias = new Map(draft.nodes.map((n) => [n.alias, n]));

  const depthCache = new Map<string, number>();
  function depthOf(alias: string, trail: string[] = []): number {
    if (depthCache.has(alias)) return depthCache.get(alias)!;
    if (trail.includes(alias)) {
      errors.push(`ciclo de parent_alias detectado envolvendo ${alias}`);
      return 0;
    }
    const node = byAlias.get(alias);
    if (!node || node.parent_alias === null) {
      depthCache.set(alias, 0);
      return 0;
    }
    if (!byAlias.has(node.parent_alias)) {
      errors.push(`${alias} referencia parent_alias inexistente: ${node.parent_alias}`);
      depthCache.set(alias, 0);
      return 0;
    }
    const depth = depthOf(node.parent_alias, [...trail, alias]) + 1;
    depthCache.set(alias, depth);
    return depth;
  }

  const projectIdCache = new Map<string, string | null>();
  function projectIdOf(alias: string): string | null {
    if (projectIdCache.has(alias)) return projectIdCache.get(alias)!;
    const node = byAlias.get(alias);
    if (!node) return null;
    if (node.node_type === "project") {
      const ownId = aliasToId.get(alias) ?? null;
      projectIdCache.set(alias, ownId);
      return ownId;
    }
    if (node.parent_alias === null || !byAlias.has(node.parent_alias)) {
      projectIdCache.set(alias, null);
      return null;
    }
    const result = projectIdOf(node.parent_alias);
    projectIdCache.set(alias, result);
    return result;
  }

  const nodes: WorkNode[] = draft.nodes
    .filter((n) => aliasToId.has(n.alias))
    .map((draftNode) => {
      const id = aliasToId.get(draftNode.alias)!;
      const parentId = draftNode.parent_alias ? (aliasToId.get(draftNode.parent_alias) ?? null) : null;

      const dependencies: string[] = (draftNode.dependency_aliases ?? []).flatMap((depAlias) => {
        const depId = aliasToId.get(depAlias);
        if (!depId) {
          errors.push(`${draftNode.alias} depende de alias inexistente: ${depAlias}`);
          return [];
        }
        return [depId];
      });

      const node: WorkNode = {
        schema_version: "1.0.0",
        id: id as WorkNode["id"],
        workspace_id: ctx.workspaceId as WorkNode["workspace_id"],
        project_id: projectIdOf(draftNode.alias) as WorkNode["project_id"],
        plan_version_id: ctx.planVersionId as WorkNode["plan_version_id"],
        parent_id: parentId as WorkNode["parent_id"],
        node_type: draftNode.node_type,
        title: draftNode.title,
        description: draftNode.description ?? "",
        order: draftNode.order,
        depth: depthOf(draftNode.alias),
        status: "TODO",
        completion_rule: draftNode.completion_rule ?? defaultCompletionRule(draftNode.node_type),
        done_criteria: draftNode.done_criteria ?? [],
        dependencies: dependencies as WorkNodeId[],
        source_refs: (draftNode.source_locators ?? []).map((locator) => ({
          source_artifact_id: (ctx.defaultSourceArtifactId ?? "unknown-source-artifact") as never,
          locator,
          classification: "EVIDENCE",
        })),
        metadata: {},
      };
      return node;
    });

  const rootNodeIds = draft.root_aliases.flatMap((alias) => {
    const id = aliasToId.get(alias);
    if (!id) {
      errors.push(`root_alias inexistente: ${alias}`);
      return [];
    }
    return [id];
  });

  return { nodes, rootNodeIds, errors };
}
