export interface NodeCardData {
  id: string;
  title: string;
  status: string;
  subtitle?: string;
  progressLabel?: string;
}

export interface NodeCardProps {
  node: NodeCardData;
  onOpen: (id: string) => void;
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "rascunho",
  READY: "pronto",
  TODO: "a fazer",
  IN_PROGRESS: "em andamento",
  BLOCKED: "bloqueado",
  DONE: "concluído",
  CANCELLED: "cancelado",
  ARCHIVED: "arquivado",
};

/** specs/FRONTEND_FRACTAL.md: cards interativos são button/a; Enter/Espaço funcionam nativamente. */
export function NodeCard({ node, onOpen }: NodeCardProps) {
  return (
    <button
      type="button"
      className={`desk-os-node-card desk-os-status-${node.status.toLowerCase()}`}
      onClick={() => onOpen(node.id)}
      aria-label={`Abrir ${node.title} — ${STATUS_LABEL[node.status] ?? node.status}`}
    >
      <span className="desk-os-node-card-title">{node.title}</span>
      {node.subtitle && <span className="desk-os-node-card-subtitle">{node.subtitle}</span>}
      <span className="desk-os-node-card-status">{STATUS_LABEL[node.status] ?? node.status}</span>
      {node.progressLabel && <span className="desk-os-node-card-progress">{node.progressLabel}</span>}
    </button>
  );
}
