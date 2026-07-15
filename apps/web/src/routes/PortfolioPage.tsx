import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { PlanVersion, WorkspaceTree } from "@desk-os/client-sdk";
import { FractalRoot, ProgressSummary, type NodeCardData } from "@desk-os/ui";
import { client, getOrCreateWorkspaceId } from "../api.js";

function findNode(plan: PlanVersion, id: string) {
  return plan.nodes.find((n) => n.id === id);
}

function crumbTrail(plan: PlanVersion, nodeId: string | null) {
  const crumbs: { id: string; label: string }[] = [{ id: "__root__", label: "Portfólio" }];
  if (!nodeId) return crumbs;
  const path: { id: string; label: string }[] = [];
  let current = findNode(plan, nodeId);
  while (current) {
    path.unshift({ id: current.id, label: current.title });
    current = current.parent_id ? findNode(plan, current.parent_id) : undefined;
  }
  return [...crumbs, ...path];
}

/** specs/FRONTEND_FRACTAL.md: PortfolioView/ProjectView/NodeView compartilham o mesmo navegador recursivo. */
export function PortfolioPage() {
  const { nodeId } = useParams<{ nodeId?: string }>();
  const navigate = useNavigate();
  const [tree, setTree] = useState<WorkspaceTree | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    client
      .getWorkspaceTree(getOrCreateWorkspaceId())
      .then(setTree)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Sem plano ativo."));
  }, []);

  if (error) {
    return (
      <section>
        <h1>Portfólio</h1>
        <p>{error} Envie um projeto na tela de Intake e ative um plano primeiro.</p>
      </section>
    );
  }
  if (!tree) return <p>Carregando…</p>;

  const { plan, state } = tree;
  const childrenOf = nodeId ? plan.nodes.filter((n) => n.parent_id === nodeId) : plan.nodes.filter((n) => n.parent_id === null);
  const cards: NodeCardData[] = childrenOf
    .sort((a, b) => a.order - b.order)
    .map((n) => ({
      id: n.id,
      title: n.title,
      status: state.node_states[n.id]?.status ?? n.status,
    }));

  const totalActions = plan.nodes.filter((n) => n.node_type === "action").length;
  const doneActions = plan.nodes.filter(
    (n) => n.node_type === "action" && state.node_states[n.id]?.status === "DONE",
  ).length;

  return (
    <section>
      <ProgressSummary label="Progresso geral" completed={doneActions} total={totalActions} />
      <FractalRoot
        crumbs={crumbTrail(plan, nodeId ?? null)}
        children={cards}
        announcement={`${cards.length} itens nesta escala.`}
        onNavigate={(id) => navigate(id === "__root__" ? "/portfolio" : `/portfolio/${id}`)}
        onOpenChild={(id) => navigate(`/portfolio/${id}`)}
      />
    </section>
  );
}
