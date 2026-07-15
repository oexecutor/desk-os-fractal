export interface ActionCardData {
  id: string;
  title: string;
  doneCriteria: string[];
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE" | "CANCELLED";
  hasEvidence: boolean;
}

export interface ActionCardProps {
  action: ActionCardData;
  isCurrent: boolean;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
}

/** ux/INTERACTION_AND_CONTENT.md: estado explícito, nunca "salvo" sem persistência confirmada. */
export function ActionCard({ action, isCurrent, onStart, onComplete }: ActionCardProps) {
  return (
    <article
      className={`desk-os-action-card${isCurrent ? " desk-os-action-card--current" : ""}`}
      aria-current={isCurrent ? "step" : undefined}
    >
      <h3>{action.title}</h3>
      {action.doneCriteria.length > 0 && (
        <p className="desk-os-action-card-criteria">{action.doneCriteria.join(" · ")}</p>
      )}
      <p className="desk-os-action-card-evidence">
        {action.hasEvidence ? "Evidência registrada" : "Sem evidência registrada"}
      </p>
      {action.status === "TODO" && (
        <button type="button" onClick={() => onStart(action.id)}>
          Iniciar
        </button>
      )}
      {action.status === "IN_PROGRESS" && (
        <button type="button" onClick={() => onComplete(action.id)}>
          Concluir
        </button>
      )}
      {action.status === "DONE" && <p>Concluída neste dispositivo.</p>}
    </article>
  );
}
