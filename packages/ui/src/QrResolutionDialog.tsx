export interface QrResolutionDialogProps {
  description: string;
  targetTitle: string | null;
  mutatesState: boolean;
  confirmationRequired: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** ADR-0015: QR mutável resolve para tela de confirmação; GET nunca executa. */
export function QrResolutionDialog({
  description,
  targetTitle,
  mutatesState,
  confirmationRequired,
  onConfirm,
  onCancel,
}: QrResolutionDialogProps) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="desk-os-qr-dialog-title" className="desk-os-qr-dialog">
      <h2 id="desk-os-qr-dialog-title">{targetTitle ?? "Contexto"}</h2>
      <p>{description}</p>
      {mutatesState && <p className="desk-os-qr-dialog-warning">Esta ação vai alterar o estado do plano.</p>}
      <div className="desk-os-qr-dialog-actions">
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
        {confirmationRequired ? (
          <button type="button" onClick={onConfirm} autoFocus>
            Confirmar
          </button>
        ) : (
          <button type="button" onClick={onConfirm} autoFocus>
            Abrir
          </button>
        )}
      </div>
    </div>
  );
}
