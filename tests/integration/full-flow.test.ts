import { beforeAll, describe, expect, it } from "vitest";

process.env.MOCK_MODE = "true";
process.env.QR_BASE_URL = "https://desk-os.test";

const ROUTES = "../../apps/functions/src/routes";

function fakeContext(params: Record<string, string> = {}) {
  return { params } as unknown as import("@netlify/functions").Context;
}

describe("Fluxo ponta a ponta — ingest -> decompose -> approve -> activate -> print -> QR", () => {
  let workspaceId: string;
  let ingestionId: string;
  let planVersionId: string;

  beforeAll(() => {
    workspaceId = "0123456789abcdef0001";
  });

  it("cria uma ingestão a partir de texto colado", async () => {
    const { default: ingestionsHandler } = await import(`${ROUTES}/ingestions.js`);
    const form = new FormData();
    form.set("workspace_id", workspaceId);
    form.set("consent_to_model_processing", "true");
    form.set(
      "pasted_text",
      "Projeto de digitalização da operação. Precisamos mapear o processo atual, diagnosticar dores, desenhar o fluxo futuro, configurar um piloto e testar em campo.",
    );
    const request = new Request("https://x/api/ingestions", { method: "POST", body: form });
    const response = await ingestionsHandler(request, fakeContext());
    expect(response.status).toBe(202);
    const job = await response.json();
    expect(job.status).toBe("EXTRACTED");
    ingestionId = job.id;
  });

  it("decompõe a ingestão em um plano GENERATED de 5 blocos (modo mock)", async () => {
    const { default: decomposeHandler } = await import(`${ROUTES}/ingestion-decompose.js`);
    const request = new Request(`https://x/api/ingestions/${ingestionId}/decompose`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workspace_id: workspaceId }),
    });
    const response = await decomposeHandler(request, fakeContext({ ingestionId }));
    expect(response.status).toBe(202);
    const job = await response.json();
    expect(["COMPLETED", "BLOCKED"]).toContain(job.status);
    expect(job.result_plan_version_id).toBeTruthy();
    planVersionId = job.result_plan_version_id;

    const { default: planDetailHandler } = await import(`${ROUTES}/plan-detail.js`);
    const planResponse = await planDetailHandler(
      new Request(`https://x/api/plans/${planVersionId}`),
      fakeContext({ planVersionId }),
    );
    const plan = await planResponse.json();
    expect(plan.lifecycle_state).toBe("GENERATED");
    expect(plan.nodes.filter((n: { node_type: string }) => n.node_type === "block")).toHaveLength(5);
  });

  it("aprovação antes da execução: review -> approve -> activate", async () => {
    const { default: reviewHandler } = await import(`${ROUTES}/plan-review.js`);
    const reviewResponse = await reviewHandler(
      new Request(`https://x/api/plans/${planVersionId}/review`, { method: "POST" }),
      fakeContext({ planVersionId }),
    );
    expect(reviewResponse.status).toBe(200);

    const { default: approveHandler } = await import(`${ROUTES}/plan-approve.js`);
    const approveResponse = await approveHandler(
      new Request(`https://x/api/plans/${planVersionId}/approve`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ expected_version: 1, idempotency_key: "idem-approve-000000001" }),
      }),
      fakeContext({ planVersionId }),
    );
    expect(approveResponse.status).toBe(200);

    const { default: activateHandler } = await import(`${ROUTES}/plan-activate.js`);
    const activateResponse = await activateHandler(
      new Request(`https://x/api/plans/${planVersionId}/activate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ expected_version: 2, idempotency_key: "idem-activate-000000001" }),
      }),
      fakeContext({ planVersionId }),
    );
    expect(activateResponse.status).toBe(200);

    const { default: planDetailHandler } = await import(`${ROUTES}/plan-detail.js`);
    const planResponse = await planDetailHandler(
      new Request(`https://x/api/plans/${planVersionId}`),
      fakeContext({ planVersionId }),
    );
    const plan = await planResponse.json();
    expect(plan.lifecycle_state).toBe("ACTIVE");
  });

  it("GET /workspaces/{id}/tree retorna o plano ativo e o snapshot materializado", async () => {
    const { default: treeHandler } = await import(`${ROUTES}/workspace-tree.js`);
    const response = await treeHandler(
      new Request(`https://x/api/workspaces/${workspaceId}/tree`),
      fakeContext({ workspaceId }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.plan.lifecycle_state).toBe("ACTIVE");
    // review/approve/activate já anexaram 3 eventos de lifecycle ao stream.
    expect(body.state.stream_version).toBe(3);
  });

  let printSnapshotId: string;

  it("emite o dashboard físico semanal (ADR-0017) só porque o plano está ACTIVE", async () => {
    const { default: printHandler } = await import(`${ROUTES}/print-snapshots.js`);
    const { default: planDetailHandler } = await import(`${ROUTES}/plan-detail.js`);
    const planResponse = await planDetailHandler(
      new Request(`https://x/api/plans/${planVersionId}`),
      fakeContext({ planVersionId }),
    );
    const plan = await planResponse.json();
    const projectNode = plan.nodes.find((n: { node_type: string }) => n.node_type === "project");

    const response = await printHandler(
      new Request("https://x/api/print-snapshots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ workspace_id: workspaceId, context_node_id: projectNode.id, state_version: 0 }),
      }),
      fakeContext(),
    );
    expect(response.status).toBe(201);
    const snapshot = await response.json();
    expect(snapshot.format).toBe("A4_PORTRAIT_FOLDED_WEEKLY_V2");
    expect(snapshot.face1.blocks).toHaveLength(5);
    printSnapshotId = snapshot.id;
  });

  it("renderiza o HTML A4 retrato dobrável offline", async () => {
    const { default: htmlHandler } = await import(`${ROUTES}/print-snapshot-html.js`);
    const response = await htmlHandler(
      new Request(`https://x/api/print-snapshots/${printSnapshotId}/html`),
      fakeContext({ snapshotId: printSnapshotId }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    const html = await response.text();
    expect(html).toContain("@page { size: A4 portrait; margin: 0; }");
    expect(html).toContain("<svg");
  });

  it("QR: resolve nunca muta e execute exige confirmação (AT-037/AT-039)", async () => {
    const { default: qrResolveHandler } = await import(`${ROUTES}/qr-resolve.js`);
    const { default: qrTokensHandler } = await import(`${ROUTES}/qr-tokens.js`);

    const createResponse = await qrTokensHandler(
      new Request("https://x/api/qr/tokens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          kind: "OPEN_CURRENT_ACTION",
          target: {
            strategy: "CURRENT_ACTION",
            sprint_id: "0123456789abcdefsprint",
            plan_version_id: planVersionId,
          },
          minimum_plan_state: "ACTIVE",
          authentication_policy: "REQUIRED",
        }),
      }),
      fakeContext(),
    );
    expect(createResponse.status).toBe(201);
    const { url } = await createResponse.json();
    const token = url.split("/q/")[1];

    const resolveResponse = await qrResolveHandler(
      new Request(`https://x/api/qr/${token}/resolve`, { method: "POST" }),
      fakeContext({ token }),
    );
    expect(resolveResponse.status).toBe(200);
    const resolution = await resolveResponse.json();
    expect(resolution.kind).toBe("ACTION");
    expect(resolution.confirmation_required).toBe(true);

    const { default: qrExecuteHandler } = await import(`${ROUTES}/qr-execute.js`);
    const unconfirmed = await qrExecuteHandler(
      new Request(`https://x/api/qr/${token}/execute`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmed: false, idempotency_key: "idem-qr-000000000001", expected_version: 0 }),
      }),
      fakeContext({ token }),
    );
    expect(unconfirmed.status).toBe(422);

    // O stream do plano já tem 3 eventos de lifecycle (review/approve/activate).
    const confirmed = await qrExecuteHandler(
      new Request(`https://x/api/qr/${token}/execute`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmed: true, idempotency_key: "idem-qr-000000000002", expected_version: 3 }),
      }),
      fakeContext({ token }),
    );
    expect(confirmed.status).toBe(200);
    const result = await confirmed.json();
    expect(result.events[0].event_type).toBe("action.started");
  });
});
