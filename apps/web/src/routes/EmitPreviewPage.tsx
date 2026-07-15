import { useEffect, useState } from "react";
import { PrintPreview } from "@desk-os/ui";
import { client, getOrCreateWorkspaceId } from "../api.js";

/** ux/SCREEN_INVENTORY.md "Emit Preview": conferir as duas faces, gerar snapshot. */
export function EmitPreviewPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [overflowErrors, setOverflowErrors] = useState<string[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  async function generate() {
    setIsLoading(true);
    setOverflowErrors([]);
    setGeneralError(null);
    try {
      const workspaceId = getOrCreateWorkspaceId();
      const tree = await client.getWorkspaceTree(workspaceId);
      const projectNode = tree.plan.nodes.find((n) => n.node_type === "project" || n.node_type === "portfolio");
      if (!projectNode) throw new Error("Nenhum nó de contexto encontrado no plano ativo.");

      const snapshot = await client.createPrintSnapshot({
        workspaceId,
        contextNodeId: projectNode.id,
        stateVersion: tree.state.stream_version,
      });
      const rendered = await client.getPrintSnapshotHtml(String(snapshot.id));
      setHtml(rendered);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao gerar emissão.";
      if (message.includes("Overflow")) {
        setOverflowErrors(message.split(";").map((s) => s.trim()));
      } else {
        setGeneralError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Gera uma vez ao montar; "Gerar novamente" cobre re-execução manual.
  useEffect(() => {
    generate();
  }, []);

  return (
    <section>
      <h1>Emitir dashboard físico</h1>
      <p>Folha A4 retrato dobrável, uma página, plano semanal estático (ADR-0017).</p>
      <button type="button" onClick={generate} disabled={isLoading}>
        {isLoading ? "Gerando…" : "Gerar novamente"}
      </button>
      {generalError && <p role="alert">{generalError}</p>}
      <PrintPreview html={html} isLoading={isLoading} overflowErrors={overflowErrors} />
    </section>
  );
}
