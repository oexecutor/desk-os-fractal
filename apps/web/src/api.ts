import { createDeskOsClient } from "@desk-os/client-sdk";

const WORKSPACE_STORAGE_KEY = "desk-os:workspace-id";

/**
 * LACUNA (ASSUMPTIONS_AND_LACUNAE.md): o OpenAPI normativo não define um
 * endpoint de criação de workspace (FR-001 existe, mas não há CRUD de
 * workspace na especificação v1.1.0). Para o piloto, o cliente gera um
 * identificador local e o reutiliza — `workspace_id` continua sendo apenas
 * uma chave de agrupamento, nunca controle de acesso (CLAUDE.md).
 */
export function getOrCreateWorkspaceId(): string {
  const existing = localStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (existing) return existing;
  const generated = crypto.randomUUID().replace(/-/g, "");
  localStorage.setItem(WORKSPACE_STORAGE_KEY, generated);
  return generated;
}

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

export const client = createDeskOsClient({ baseUrl: apiBaseUrl });
