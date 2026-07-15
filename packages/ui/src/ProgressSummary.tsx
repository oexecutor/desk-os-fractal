export interface ProgressSummaryProps {
  label: string;
  completed: number;
  total: number;
}

/** ux/INTERACTION_AND_CONTENT.md: progressos sempre informam numerador/denominador. */
export function ProgressSummary({ label, completed, total }: ProgressSummaryProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="desk-os-progress-summary">
      <span className="desk-os-progress-summary-label">{label}</span>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${completed} de ${total}`}
      >
        <span className="desk-os-progress-summary-bar" style={{ width: `${percent}%` }} />
      </div>
      <span>
        {completed} de {total} ({percent}%)
      </span>
    </div>
  );
}
