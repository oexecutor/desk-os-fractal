import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { client, getOrCreateWorkspaceId } from "../api.js";
import { ApiError } from "@desk-os/client-sdk";

/** J1 — specs/PRD.md: Intake é a primeira tela, não a grade fractal. */
export function IntakePage() {
  const navigate = useNavigate();
  const [pastedText, setPastedText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!consent) {
      setError("Confirme o consentimento de processamento antes de continuar.");
      return;
    }
    if (!pastedText.trim() && files.length === 0) {
      setError("Cole um texto ou selecione ao menos um arquivo.");
      return;
    }
    setIsSubmitting(true);
    try {
      const workspaceId = getOrCreateWorkspaceId();
      const job = await client.createIngestion({
        workspaceId,
        files,
        ...(pastedText ? { pastedText } : {}),
        consentToModelProcessing: true,
      });
      navigate(`/ingestions/${job.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h1>Transforme um projeto em uma próxima ação</h1>
      <p>Arraste PDF, DOCX, MD, JSON ou texto — ou cole o contexto abaixo.</p>
      <form onSubmit={onSubmit}>
        <div className="desk-os-form-field">
          <label htmlFor="pasted-text">Colar texto</label>
          <textarea
            id="pasted-text"
            rows={8}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Cole aqui o contexto do projeto..."
          />
        </div>
        <div className="desk-os-form-field">
          <label htmlFor="files">Arquivos (texto, markdown, JSON, PDF ou DOCX textuais)</label>
          <input
            id="files"
            type="file"
            multiple
            accept=".txt,.md,.markdown,.json,.pdf,.docx"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </div>
        <div className="desk-os-form-field">
          <label>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />{" "}
            Autorizo o processamento deste conteúdo por um modelo para gerar a estrutura do projeto.
          </label>
        </div>
        {error && (
          <p role="alert" style={{ color: "var(--color-blocked)" }}>
            {error}
          </p>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando…" : "Processar projeto"}
        </button>
      </form>
    </section>
  );
}
