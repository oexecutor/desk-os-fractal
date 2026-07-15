import { describe, expect, it } from "vitest";
import { createStorage } from "@desk-os/storage";
import {
  assertTokenUsable,
  createQrToken,
  findQrTokenRecord,
  QrTokenExpiredError,
  QrTokenRevokedError,
  recordTokenUse,
  revokeQrToken,
} from "./registry.js";
import type { QrTokenRecord } from "./qr-token.js";

function repo() {
  return createStorage<unknown, unknown, QrTokenRecord, unknown, unknown>({ adapter: "memory" })
    .qrTokens;
}

describe("createQrToken / registry — ADR-0005", () => {
  it("cria um token opaco válido contra o schema e retorna a URL só nesta chamada", async () => {
    const { record, token } = await createQrToken(repo(), {
      workspaceId: "0123456789abcdef0001",
      kind: "OPEN_CURRENT_ACTION",
      target: { strategy: "CURRENT_ACTION", sprint_id: "sprint000000000001", plan_version_id: "plan0000000000000001" },
      minimumPlanState: "ACTIVE",
      authenticationPolicy: "REQUIRED",
    });
    expect(token.length).toBeGreaterThan(20);
    expect(record.token_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(record.revoked).toBe(false);
    expect(record.use_count).toBe(0);
  });

  it("findQrTokenRecord localiza pelo token original, não pelo hash", async () => {
    const store = repo();
    const { token, record } = await createQrToken(store, {
      workspaceId: "0123456789abcdef0001",
      kind: "VIEW_CONTEXT",
      target: { strategy: "CURRENT_CONTEXT" },
      authenticationPolicy: "PUBLIC_VIEW",
    });
    const found = await findQrTokenRecord(store, token);
    expect(found?.id).toBe(record.id);
  });

  it("assertTokenUsable rejeita token revogado", async () => {
    const store = repo();
    const { token, record } = await createQrToken(store, {
      workspaceId: "0123456789abcdef0001",
      kind: "VIEW_CONTEXT",
      target: { strategy: "CURRENT_CONTEXT" },
      authenticationPolicy: "PUBLIC_VIEW",
    });
    await revokeQrToken(store, token);
    const revoked = await findQrTokenRecord(store, token);
    expect(() => assertTokenUsable(revoked!, new Date())).toThrow(QrTokenRevokedError);
    void record;
  });

  it("assertTokenUsable rejeita token expirado", async () => {
    const store = repo();
    const { record } = await createQrToken(store, {
      workspaceId: "0123456789abcdef0001",
      kind: "VIEW_CONTEXT",
      target: { strategy: "CURRENT_CONTEXT" },
      authenticationPolicy: "PUBLIC_VIEW",
      expiresAt: "2020-01-01T00:00:00Z",
    });
    expect(() => assertTokenUsable(record, new Date("2026-07-14T00:00:00Z"))).toThrow(
      QrTokenExpiredError,
    );
  });

  it("assertTokenUsable rejeita quando max_uses foi atingido", async () => {
    const store = repo();
    const { token, record } = await createQrToken(store, {
      workspaceId: "0123456789abcdef0001",
      kind: "VIEW_CONTEXT",
      target: { strategy: "CURRENT_CONTEXT" },
      authenticationPolicy: "PUBLIC_VIEW",
      maxUses: 1,
    });
    await recordTokenUse(store, record);
    const used = await findQrTokenRecord(store, token);
    expect(() => assertTokenUsable(used!, new Date())).toThrow(QrTokenExpiredError);
  });
});
