import type { Config, Context } from "@netlify/functions";
import { createId, getChildren, type WorkNode } from "@desk-os/domain";
import { composePrintSnapshot, DAY_LABELS, type DayLabel } from "@desk-os/print";
import { createQrToken } from "@desk-os/qr";
import { getAppContext } from "../context.js";
import { assertPilotAuth } from "../auth.js";
import { errorResponse, json, mapErrorToResponse } from "../http.js";

function collectBlocksInOrder(nodes: readonly WorkNode[], rootId: string): WorkNode[] {
  const blocks: WorkNode[] = [];
  const visit = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    if (node.node_type === "block") blocks.push(node);
    for (const child of getChildren(nodes, nodeId)) visit(child.id);
  };
  visit(rootId);
  return blocks;
}

function qrTokenKey(snapshotId: string): string {
  return `print-snapshots/${snapshotId}/qr-token`;
}

export default async function handler(request: Request, _context: Context): Promise<Response> {
  const correlationId = createId();
  try {
    const ctx = getAppContext();
    assertPilotAuth(request, ctx.pilotBearerToken);

    const body = (await request.json()) as {
      workspace_id: string;
      context_node_id: string;
      state_version: number;
    };
    if (!body.workspace_id || !body.context_node_id) {
      return errorResponse("VALIDATION_FAILED", "workspace_id e context_node_id são obrigatórios.", correlationId);
    }

    const activePlanId = await ctx.storage.getActivePlanVersion(body.workspace_id);
    if (!activePlanId) return errorResponse("PLAN_NOT_ACTIVE", "Workspace sem plano ativo.", correlationId);
    const plan = await ctx.storage.planVersions.get(activePlanId);
    if (!plan) return errorResponse("NOT_FOUND", "Plano ativo não encontrado.", correlationId);

    const blocks = collectBlocksInOrder(plan.nodes, body.context_node_id);
    if (blocks.length < 5) {
      return errorResponse(
        "VALIDATION_FAILED",
        `Contexto possui apenas ${blocks.length} bloco(s); a emissão semanal exige 5 (SEG–SEX).`,
        correlationId,
      );
    }

    const blocksByDay = {} as Record<DayLabel, string>;
    DAY_LABELS.forEach((day, i) => {
      blocksByDay[day] = blocks[i]!.id;
    });

    const sprintId = createId();
    const contextNode = plan.nodes.find((n) => n.id === body.context_node_id);

    const { record: qrTokenRecord, token: qrToken } = await createQrToken(ctx.storage.qrTokens, {
      workspaceId: body.workspace_id,
      kind: "OPEN_CURRENT_ACTION",
      target: { strategy: "CURRENT_ACTION", sprint_id: sprintId, plan_version_id: plan.id },
      minimumPlanState: "ACTIVE",
      authenticationPolicy: "REQUIRED",
    });

    const snapshot = composePrintSnapshot({
      plan,
      workspaceId: body.workspace_id,
      sprintId,
      userLabel: "Usuário do piloto",
      contextTrail: [contextNode?.title ?? "Workspace"],
      weekLabel: `SEMANA ${new Date().toISOString().slice(0, 10)}`,
      dateRange: new Date().toISOString().slice(0, 10),
      dominantResult: plan.dominant_result ?? plan.objective ?? "Resultado dominante não informado.",
      definitionOfDone: "Definir a partir do plano ativo antes de imprimir em produção.",
      projectLabel: contextNode?.title ?? "Projeto",
      qrTokenId: qrTokenRecord.id,
      stateVersionAtEmission: body.state_version ?? null,
      blocksByDay,
    });

    await ctx.storage.printSnapshots.save(snapshot.id, snapshot);
    await ctx.storage.blobs.set(qrTokenKey(snapshot.id), qrToken);

    return json(snapshot, { status: 201 });
  } catch (err) {
    return mapErrorToResponse(err, correlationId);
  }
}

export const config: Config = { path: "/api/print-snapshots" };
export { qrTokenKey };
