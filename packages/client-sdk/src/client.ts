import type { PlanVersion } from "@desk-os/domain";
import {
  ApiError,
  type ApiErrorBody,
  type CommandInput,
  type CommandResult,
  type IngestionJob,
  type QrResolveResponseDTO,
  type WorkspaceTree,
} from "./types.js";

export interface ClientOptions {
  baseUrl: string;
  getAuthToken?: () => string | null | undefined;
}

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const err = body?.error;
    throw new ApiError(
      response.status,
      err?.code ?? "UNKNOWN_ERROR",
      err?.message ?? `Requisição falhou com status ${response.status}`,
      err?.correlation_id ?? "",
      err?.retryable ?? false,
    );
  }
  return response.json() as Promise<T>;
}

/** ADR-0012: o cliente confia estruturalmente na resposta — a validação de schema é do servidor. */
export function createDeskOsClient(options: ClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/$/, "");

  function headers(extra?: Record<string, string>): HeadersInit {
    const token = options.getAuthToken?.();
    return {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  }

  return {
    async createIngestion(input: {
      workspaceId: string;
      files: File[];
      pastedText?: string;
      consentToModelProcessing: true;
    }): Promise<IngestionJob> {
      const form = new FormData();
      form.set("workspace_id", input.workspaceId);
      form.set("consent_to_model_processing", "true");
      if (input.pastedText) form.set("pasted_text", input.pastedText);
      for (const file of input.files) form.append("files", file);

      const token = options.getAuthToken?.();
      const response = await fetch(`${baseUrl}/ingestions`, {
        method: "POST",
        body: form,
        ...(token ? { headers: { authorization: `Bearer ${token}` } } : {}),
      });
      return parseJsonOrThrow<IngestionJob>(response);
    },

    async getIngestion(ingestionId: string): Promise<IngestionJob> {
      const response = await fetch(`${baseUrl}/ingestions/${ingestionId}`, { headers: headers() });
      return parseJsonOrThrow<IngestionJob>(response);
    },

    async decomposeIngestion(
      ingestionId: string,
      input: { workspaceId: string; userContext?: string },
    ): Promise<IngestionJob> {
      const response = await fetch(`${baseUrl}/ingestions/${ingestionId}/decompose`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ workspace_id: input.workspaceId, user_context: input.userContext }),
      });
      return parseJsonOrThrow<IngestionJob>(response);
    },

    async getPlan(planVersionId: string): Promise<PlanVersion> {
      const response = await fetch(`${baseUrl}/plans/${planVersionId}`, { headers: headers() });
      return parseJsonOrThrow<PlanVersion>(response);
    },

    async startReview(planVersionId: string): Promise<void> {
      const response = await fetch(`${baseUrl}/plans/${planVersionId}/review`, {
        method: "POST",
        headers: headers(),
      });
      if (!response.ok) await parseJsonOrThrow(response);
    },

    async approvePlan(
      planVersionId: string,
      input: { expectedVersion: number; idempotencyKey: string; note?: string },
    ): Promise<void> {
      const response = await fetch(`${baseUrl}/plans/${planVersionId}/approve`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          expected_version: input.expectedVersion,
          idempotency_key: input.idempotencyKey,
          note: input.note,
        }),
      });
      if (!response.ok) await parseJsonOrThrow(response);
    },

    async activatePlan(
      planVersionId: string,
      input: { expectedVersion: number; idempotencyKey: string },
    ): Promise<void> {
      const response = await fetch(`${baseUrl}/plans/${planVersionId}/activate`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          expected_version: input.expectedVersion,
          idempotency_key: input.idempotencyKey,
        }),
      });
      if (!response.ok) await parseJsonOrThrow(response);
    },

    async getWorkspaceTree(workspaceId: string): Promise<WorkspaceTree> {
      const response = await fetch(`${baseUrl}/workspaces/${workspaceId}/tree`, { headers: headers() });
      return parseJsonOrThrow<WorkspaceTree>(response);
    },

    async sendCommand(command: CommandInput): Promise<CommandResult> {
      const response = await fetch(`${baseUrl}/commands`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(command),
      });
      return parseJsonOrThrow<CommandResult>(response);
    },

    async createPrintSnapshot(input: {
      workspaceId: string;
      contextNodeId: string;
      stateVersion: number;
    }): Promise<{ id: string; [key: string]: unknown }> {
      const response = await fetch(`${baseUrl}/print-snapshots`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          workspace_id: input.workspaceId,
          context_node_id: input.contextNodeId,
          state_version: input.stateVersion,
        }),
      });
      return parseJsonOrThrow(response);
    },

    async getPrintSnapshotHtml(snapshotId: string): Promise<string> {
      const response = await fetch(`${baseUrl}/print-snapshots/${snapshotId}/html`, { headers: headers() });
      if (!response.ok) await parseJsonOrThrow(response);
      return response.text();
    },

    async resolveQrToken(token: string): Promise<QrResolveResponseDTO> {
      const response = await fetch(`${baseUrl}/q/${token}/resolve`, { method: "POST" });
      return parseJsonOrThrow<QrResolveResponseDTO>(response);
    },

    async executeQrToken(
      token: string,
      input: { confirmed: true; idempotencyKey: string; expectedVersion: number },
    ): Promise<CommandResult> {
      const response = await fetch(`${baseUrl}/q/${token}/execute`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          confirmed: input.confirmed,
          idempotency_key: input.idempotencyKey,
          expected_version: input.expectedVersion,
        }),
      });
      return parseJsonOrThrow<CommandResult>(response);
    },
  };
}

export type DeskOsClient = ReturnType<typeof createDeskOsClient>;
