import { ActionCard, type ActionCardData } from "./ActionCard.js";
import { SynthesisCard } from "./SynthesisCard.js";

export interface FocusPanelProps {
  blockTitle: string;
  actions: ActionCardData[];
  currentActionId: string | null;
  synthesisTitle: string;
  synthesisStatus: "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE" | "CANCELLED";
  blockedReason?: string | null;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
}

/** specs/FRONTEND_FRACTAL.md: FocusView mostra somente contexto ativo, próxima ação, LINK e bloqueio. */
export function FocusPanel({
  blockTitle,
  actions,
  currentActionId,
  synthesisTitle,
  synthesisStatus,
  blockedReason,
  onStart,
  onComplete,
}: FocusPanelProps) {
  const done = actions.filter((a) => a.status === "DONE").length;
  return (
    <section aria-labelledby="desk-os-focus-heading" className="desk-os-focus-panel">
      <h2 id="desk-os-focus-heading">{blockTitle}</h2>
      {blockedReason && (
        <p role="alert" className="desk-os-focus-blocked">
          Bloqueio: {blockedReason}
        </p>
      )}
      <div className="desk-os-focus-actions">
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            isCurrent={action.id === currentActionId}
            onStart={onStart}
            onComplete={onComplete}
          />
        ))}
      </div>
      <SynthesisCard
        title={synthesisTitle}
        status={synthesisStatus}
        completedCount={done}
        totalCount={actions.length}
      />
    </section>
  );
}
