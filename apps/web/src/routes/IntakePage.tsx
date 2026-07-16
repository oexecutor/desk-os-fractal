import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { client, getOrCreateWorkspaceId } from "../api.js";
import { ApiError } from "@desk-os/client-sdk";

type IntakeMode = "choice" | "upload" | "generate";

/** J1 — specs/PRD.md: Intake é a primeira tela, remodelada para escolha de fluxo. */
export function IntakePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<IntakeMode>("choice");
  const [pastedText, setPastedText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === "generate" && !consent) {
      setError("Confirme o consentimento de processamento antes de continuar.");
      return;
    }

    if (mode === "generate" && !pastedText.trim() && files.length === 0) {
      setError("Cole um texto ou selecione ao menos um arquivo para gerar.");
      return;
    }

    if (mode === "upload" && files.length === 0) {
      setError("Selecione o arquivo JSON do projeto para enviar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const workspaceId = getOrCreateWorkspaceId();
      const job = await client.createIngestion({
        workspaceId,
        files,
        ...(pastedText ? { pastedText } : {}),
        consentToModelProcessing: mode === "generate",
      });
      navigate(`/ingestions/${job.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (mode === "choice") {
    return (
      <section style={{ textAlign: "center", padding: "2rem" }}>
        <h1>Como deseja iniciar seu projeto?</h1>
        <p>Escolha entre enviar um plano já estruturado ou gerar um novo com IA.</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem" }}>
          <button 
            onClick={() => setMode("upload")} 
            style={{ padding: "1.5rem", fontSize: "1.1rem", cursor: "pointer" }}
          >
            📁 Enviar Projeto Pronto (JSON)
          </button>
          <button 
            onClick={() => setMode("generate")}
            style={{ padding: "1.5rem", fontSize: "1.1rem", cursor: "pointer" }}
          >
            ✨ Gerar Projeto com IA
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <button onClick={() => setMode("choice")} style={{ marginBottom: "1rem", background: "none", border: "1px solid #ccc", cursor: "pointer" }}>
        ← Voltar
      </button>
      
      <h1>{mode === "upload" ? "Enviar Projeto Pronto" : "Gerar Projeto com IA"}</h1>
      <p>
        {mode === "upload" 
          ? "Arraste o arquivo JSON do seu projeto estruturado." 
          : "Arraste PDF, DOCX, MD ou cole o contexto abaixo para a IA decompor."}
      </p>

      <form onSubmit={onSubmit}>
        {mode === "generate" && (
          <div className="desk-os-form-field">
            <label htmlFor="pasted-text">Colar contexto</label>
            <textarea
              id="pasted-text"
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Cole aqui o contexto do projeto..."
            />
          </div>
        )}

        <div className="desk-os-form-field">
          <label htmlFor="files">
            {mode === "upload" ? "Arquivo JSON do Projeto" : "Arquivos de Contexto (PDF, DOCX, MD, TXT)"}
          </label>
          <input
            id="files"
            type="file"
            multiple={mode === "generate"}
            accept={mode === "upload" ? ".json" : ".txt,.md,.markdown,.pdf,.docx"}
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </div>

        {mode === "generate" && (
          <div className="desk-os-form-field">
            <label>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />{" "}
              Autorizo o processamento deste conteúdo por um modelo para gerar a estrutura do projeto.
            </label>
          </div>
        )}

        {error && (
          <p role="alert" style={{ color: "var(--color-blocked)", padding: "1rem", border: "1px solid red", borderRadius: "4px" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando…" : mode === "upload" ? "Enviar Projeto" : "Processar com IA"}
        </button>
      </form>
    </section>
  );
}
