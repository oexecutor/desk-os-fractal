export interface ApprovalBannerProps {
  lifecycleState: string;
  onStartReview?: () => void;
  onApprove?: () => void;
  onActivate?: () => void;
}

const COPY: Record<string, string> = {
  GENERATED: "Plano gerado — revisão necessária.",
  IN_REVIEW: "Plano em revisão.",
  APPROVED: "Plano aprovado — pronto para ativar.",
  ACTIVE: "Plano ativo.",
  BLOCKED: "Plano bloqueado — corrija os itens listados antes de prosseguir.",
  REJECTED: "Plano rejeitado.",
  SUPERSEDED: "Versão substituída por um plano mais recente.",
  COMPLETED: "Plano concluído.",
  ARCHIVED: "Plano arquivado.",
};

/** ADR-0007: nenhuma execução, impressão operacional ou QR mutável antes de ACTIVE. */
export function ApprovalBanner({ lifecycleState, onStartReview, onApprove, onActivate }: ApprovalBannerProps) {
  return (
    <div role="status" className={`desk-os-approval-banner desk-os-lifecycle-${lifecycleState.toLowerCase()}`}>
      <p>{COPY[lifecycleState] ?? lifecycleState}</p>
      {lifecycleState === "GENERATED" && onStartReview && (
        <button type="button" onClick={onStartReview}>
          Iniciar revisão
        </button>
      )}
      {lifecycleState === "IN_REVIEW" && onApprove && (
        <button type="button" onClick={onApprove}>
          Aprovar
        </button>
      )}
      {lifecycleState === "APPROVED" && onActivate && (
        <button type="button" onClick={onActivate}>
          Ativar
        </button>
      )}
    </div>
  );
}
