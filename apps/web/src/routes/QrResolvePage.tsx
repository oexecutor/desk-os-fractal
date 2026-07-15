import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { QrResolveResponseDTO } from "@desk-os/client-sdk";
import { QrResolutionDialog } from "@desk-os/ui";
import { client } from "../api.js";

/** ADR-0015: GET/resolve nunca muta; execução exige confirmação explícita. */
export function QrResolvePage() {
  const { token } = useParams<{ token: string }>();
  const [resolution, setResolution] = useState<QrResolveResponseDTO | null>(null);
  const [status, setStatus] = useState<"idle" | "confirming" | "executing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    client
      .resolveQrToken(token)
      .then((res) => {
        setResolution(res);
        setStatus(res.confirmation_required ? "confirming" : "done");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Não foi possível resolver este QR.");
        setStatus("error");
      });
  }, [token]);

  async function onConfirm() {
    if (!token || !resolution) return;
    setStatus("executing");
    try {
      await client.executeQrToken(token, {
        confirmed: true,
        idempotencyKey: crypto.randomUUID(),
        expectedVersion: resolution.expected_version,
      });
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execução falhou.");
      setStatus("error");
    }
  }

  if (status === "idle") return <p>Resolvendo QR…</p>;
  if (status === "error") return <p role="alert">{error}</p>;
  if (status === "done") return <p>Pronto. Pode fechar esta tela ou voltar ao portfólio.</p>;

  if (!resolution) return null;

  return (
    <QrResolutionDialog
      description={resolution.description}
      targetTitle={resolution.target.title}
      mutatesState={resolution.mutates_state}
      confirmationRequired={resolution.confirmation_required}
      onConfirm={onConfirm}
      onCancel={() => setStatus("done")}
    />
  );
}
