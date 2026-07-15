export interface PrintPreviewProps {
  html: string | null;
  isLoading: boolean;
  overflowErrors?: string[];
}

/** specs/PHYSICAL_DASHBOARD_FOLDED_WEEKLY.md §8: overflow nunca é escondido — mostrado explicitamente. */
export function PrintPreview({ html, isLoading, overflowErrors }: PrintPreviewProps) {
  if (isLoading) return <p role="status">Gerando pré-visualização…</p>;

  if (overflowErrors && overflowErrors.length > 0) {
    return (
      <div role="alert" className="desk-os-print-preview-error">
        <p>Não é possível emitir: o conteúdo excede o orçamento da folha.</p>
        <ul>
          {overflowErrors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (!html) return <p>Nenhuma pré-visualização disponível.</p>;

  return (
    <iframe
      title="Pré-visualização do dashboard físico"
      srcDoc={html}
      sandbox=""
      className="desk-os-print-preview-frame"
      style={{ width: "100%", height: "80vh", border: "1px solid var(--color-line-strong)" }}
    />
  );
}
