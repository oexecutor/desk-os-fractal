import { useEffect, useState } from "react";
import { getChildren, selectNextAction } from "@desk-os/domain";
import type { PlanVersion, WorkspaceTree } from "@desk-os/client-sdk";
import { FocusPanel, type ActionCardData } from "@desk-os/ui";
import { client, getOrCreateWorkspaceId } from "../api.js";

function firstOpenBlock(plan: PlanVersion, doneIds: Set<string>) {
  const blocks = plan.nodes.filter((n) => n.node_type === "block").sort((a, b) => a.order - b.order);
  return blocks.find((b) => !doneIds.has(b.id)) ?? null;
}

/** specs/FRONTEND_FRACTAL.md FocusView: só o contexto ativo, a próxima ação e o LINK. */
export function FocusPage() {
  const [tree, setTree] = useState<WorkspaceTree | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const current = await client.getWorkspaceTree(getOrCreateWorkspaceId());
    setTree(current);
  }

  useEffect(() => {
    reload().catch((err: unknown) => setError(err instanceof Error ? err.message : "Sem plano ativo."));
  }, []);

  if (error) {
    return (
      <section>
        <h1>Foco</h1>
        <p>{error}</p>
      </section>
    );
  }
  if (!tree) return <p>Carregando…</p>;

  const { plan, state } = tree;
  const doneIds = new Set(Object.entries(state.node_states).filter(([, s]) => s.status === "DONE").map(([id]) => id));
  const block = firstOpenBlock(plan, doneIds);

  if (!block) {
    return (
      <section>
        <h1>Foco</h1>
        <p>Todos os blocos estão fechados — decida Recycle no navegador fractal.</p>
      </section>
    );
  }

  const children = getChildren(plan.nodes, block.id);
  const actionNodes = children.filter((c) => c.node_type === "action").sort((a, b) => a.order - b.order);
  const synthesisNode = children.find((c) => c.node_type === "synthesis");

  const actions: ActionCardData[] = actionNodes.map((a) => ({
    id: a.id,
    title: a.title,
    doneCriteria: a.done_criteria ?? [],
    status: (state.node_states[a.id]?.status ?? "TODO") as ActionCardData["status"],
    hasEvidence: (state.node_states[a.id]?.evidence_count ?? 0) > 0,
  }));

  const current = selectNextAction(actionNodes, {
    focusedNodeId: state.focused_node_id,
    doneNodeIds: doneIds,
  });

  async function sendActionCommand(nodeId: string, commandType: "START_ACTION" | "COMPLETE_ACTION") {
    if (!tree) return;
    setBusy(true);
    setError(null);
    try {
      await client.sendCommand({
        command_type: commandType,
        workspace_id: tree.plan.workspace_id,
        stream_id: tree.plan.id,
        expected_version: tree.state.stream_version,
        idempotency_key: crypto.randomUUID(),
        actor: { type: "USER", id: "pilot-user" },
        data: { node_id: nodeId },
      });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comando falhou.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h1>Modo foco</h1>
      {error && <p role="alert">{error}</p>}
      <FocusPanel
        blockTitle={block.title}
        actions={actions}
        currentActionId={current?.id ?? null}
        synthesisTitle={synthesisNode?.title ?? "LINK"}
        synthesisStatus={(state.node_states[synthesisNode?.id ?? ""]?.status ?? "TODO") as ActionCardData["status"]}
        onStart={(id) => !busy && sendActionCommand(id, "START_ACTION")}
        onComplete={(id) => !busy && sendActionCommand(id, "COMPLETE_ACTION")}
      />
    </section>
  );
}
