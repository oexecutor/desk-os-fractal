import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { IngestionJob } from "@desk-os/client-sdk";
import { client, getOrCreateWorkspaceId } from "../api.js";

const POLL_INTERVAL_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS ?? 4000);

/** ux/SCREEN_INVENTORY.md "Decomposition Progress": mostra etapas reais, sem inventar percentual. */
export function DecompositionProgressPage() {
  const { ingestionId } = useParams<{ ingestionId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<IngestionJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ingestionId || started.current) return;
    started.current = true;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      if (cancelled || !ingestionId) return;
      try {
        const current = await client.getIngestion(ingestionId);
        if (cancelled) return;
        setJob(current);
        if (current.status === "COMPLETED" && current.result_plan_version_id) {
          navigate(`/plans/${current.result_plan_version_id}`);
          return;
        }
        if (current.status === "BLOCKED" || current.status === "FAILED") {
          return; // mostra o estado; usuário decide próximo passo.
        }
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao consultar ingestão.");
      }
    }

    client
      .decomposeIngestion(ingestionId, { workspaceId: getOrCreateWorkspaceId() })
      .then((initial) => {
        setJob(initial);
        if (initial.status === "COMPLETED" && initial.result_plan_version_id) {
          navigate(`/plans/${initial.result_plan_version_id}`);
        } else {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Falha ao iniciar decomposição."));

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [ingestionId, navigate]);

  if (error) {
    return (
      <section>
        <h1>Não foi possível decompor a ingestão</h1>
        <p role="alert">{error}</p>
      </section>
    );
  }

  return (
    <section aria-live="polite">
      <h1>Decompondo o material recebido</h1>
      <p>Status: {job?.status ?? "iniciando…"}</p>
      {job?.status === "BLOCKED" && (
        <div role="alert">
          <p>Entrada insuficiente para gerar um plano — revise o material e tente novamente.</p>
          {job.steps?.map((step) => (
            <p key={step.name}>
              {step.name}: {step.message}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
