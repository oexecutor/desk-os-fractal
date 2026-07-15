import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { PlanVersion } from "@desk-os/client-sdk";
import { ApprovalBanner } from "@desk-os/ui";
import { client } from "../api.js";

/** J1 passo 9-10: usuário revisa, corrige ou aprova; plano aprovado torna-se ativo. */
export function PlanReviewPage() {
  const { planVersionId } = useParams<{ planVersionId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanVersion | null>(null);
  const [streamVersion, setStreamVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!planVersionId) return;
    const current = await client.getPlan(planVersionId);
    setPlan(current);
  }, [planVersionId]);

  useEffect(() => {
    reload().catch((err: unknown) => setError(err instanceof Error ? err.message : "Falha ao carregar plano."));
  }, [reload]);

  async function withBusy(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ação falhou.");
    } finally {
      setBusy(false);
    }
  }

  if (!plan) return <p>Carregando plano…</p>;

  const blocks = plan.nodes.filter((n) => n.node_type === "block");
  const actions = plan.nodes.filter((n) => n.node_type === "action");

  return (
    <section>
      <h1>{plan.dominant_result ?? plan.objective ?? "Plano gerado"}</h1>
      <ApprovalBanner
        lifecycleState={plan.lifecycle_state}
        onStartReview={() =>
          withBusy(async () => {
            await client.startReview(plan.id);
            setStreamVersion((v) => v + 1);
          })
        }
        onApprove={() =>
          withBusy(async () => {
            await client.approvePlan(plan.id, {
              expectedVersion: streamVersion,
              idempotencyKey: crypto.randomUUID(),
            });
            setStreamVersion((v) => v + 1);
          })
        }
        onActivate={() =>
          withBusy(async () => {
            await client.activatePlan(plan.id, {
              expectedVersion: streamVersion,
              idempotencyKey: crypto.randomUUID(),
            });
            setStreamVersion((v) => v + 1);
          })
        }
      />
      {error && <p role="alert">{error}</p>}
      <p>
        {blocks.length} blocos · {actions.length} ações
      </p>
      {plan.validation_report.gaps.length > 0 && (
        <div>
          <h2>Lacunas</h2>
          <ul>
            {plan.validation_report.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      )}
      {plan.validation_report.errors.length > 0 && (
        <div role="alert">
          <h2>Bloqueios</h2>
          <ul>
            {plan.validation_report.errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      {plan.lifecycle_state === "ACTIVE" && (
        <button type="button" onClick={() => navigate("/portfolio")} disabled={busy}>
          Ir para o navegador fractal
        </button>
      )}
    </section>
  );
}
