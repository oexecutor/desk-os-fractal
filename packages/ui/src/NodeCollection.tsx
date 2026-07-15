import { useState } from "react";
import { NodeCard, type NodeCardData } from "./NodeCard.js";

export interface NodeCollectionProps {
  nodes: NodeCardData[];
  onOpen: (id: string) => void;
  pageSize?: number;
}

/**
 * specs/FRONTEND_FRACTAL.md "Layout dinâmico": 1 item = hero card; 2-4 grid;
 * 5-9 grid/lista condensada; >9 agrupamento/filtro/paginação — nunca cards
 * ilegíveis. Cardinalidade nunca é fixa (ADR-0008).
 */
export function NodeCollection({ nodes, onOpen, pageSize = 9 }: NodeCollectionProps) {
  const [page, setPage] = useState(0);

  if (nodes.length === 0) {
    return <p>Nenhum item nesta escala ainda.</p>;
  }

  if (nodes.length === 1) {
    const [only] = nodes;
    return (
      <div className="desk-os-node-collection desk-os-node-collection--hero">
        <NodeCard node={only!} onOpen={onOpen} />
      </div>
    );
  }

  if (nodes.length <= 9) {
    return (
      <div className="desk-os-node-collection desk-os-node-collection--grid" role="list">
        {nodes.map((node) => (
          <div role="listitem" key={node.id}>
            <NodeCard node={node} onOpen={onOpen} />
          </div>
        ))}
      </div>
    );
  }

  const totalPages = Math.ceil(nodes.length / pageSize);
  const start = page * pageSize;
  const pageNodes = nodes.slice(start, start + pageSize);

  return (
    <div className="desk-os-node-collection desk-os-node-collection--paginated">
      <div role="list">
        {pageNodes.map((node) => (
          <div role="listitem" key={node.id}>
            <NodeCard node={node} onOpen={onOpen} />
          </div>
        ))}
      </div>
      <nav aria-label="Paginação" style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
          Anterior
        </button>
        <span>
          {page + 1} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
        >
          Próxima
        </button>
      </nav>
    </div>
  );
}
