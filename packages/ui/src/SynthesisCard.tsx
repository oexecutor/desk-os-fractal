export interface SynthesisCardProps {
  title: string;
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE" | "CANCELLED";
  completedCount: number;
  totalCount: number;
}

/** GLOSSARY.md: LINK é entregável-síntese calculado — nunca uma quarta ação manual. */
export function SynthesisCard({ title, status, completedCount, totalCount }: SynthesisCardProps) {
  return (
    <section className={`desk-os-synthesis-card desk-os-status-${status.toLowerCase()}`}>
      <span className="desk-os-synthesis-card-label">LINK</span>
      <h3>{title}</h3>
      <p>
        {completedCount} de {totalCount} ações concluídas
      </p>
      {status === "DONE" ? <p>Fechado automaticamente.</p> : <p>Fecha quando as ações concluírem.</p>}
    </section>
  );
}
