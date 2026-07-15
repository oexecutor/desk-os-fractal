import { createId } from "@desk-os/domain";
import { validateOrThrow } from "@desk-os/schemas";
import type { JsonRepository } from "@desk-os/storage";
import { generateOpaqueToken, hashToken } from "./token.js";
import type { QrTokenRecord, QrTokenTarget } from "./qr-token.js";

export interface CreateQrTokenInput {
  workspaceId: string;
  kind: QrTokenRecord["kind"];
  target: QrTokenTarget;
  minimumPlanState?: QrTokenRecord["minimum_plan_state"];
  authenticationPolicy: QrTokenRecord["authentication_policy"];
  expiresAt?: string | null;
  maxUses?: number | null;
}

export interface CreatedQrToken {
  record: QrTokenRecord;
  /** URL/token retornado somente nesta chamada — nunca persistido em claro. */
  token: string;
}

/** ADR-0005/ADR-0015: registry server-side; a URL só é revelada uma vez, na criação. */
export async function createQrToken(
  repo: JsonRepository<QrTokenRecord>,
  input: CreateQrTokenInput,
): Promise<CreatedQrToken> {
  const token = generateOpaqueToken();
  const tokenHash = hashToken(token);

  const record: QrTokenRecord = {
    schema_version: "1.1.0",
    id: createId(),
    token_hash: tokenHash,
    workspace_id: input.workspaceId,
    kind: input.kind,
    target: input.target,
    ...(input.minimumPlanState ? { minimum_plan_state: input.minimumPlanState } : {}),
    created_at: new Date().toISOString(),
    expires_at: input.expiresAt ?? null,
    revoked: false,
    max_uses: input.maxUses ?? null,
    use_count: 0,
    authentication_policy: input.authenticationPolicy,
  };

  validateOrThrow("qrToken", record);
  await repo.save(tokenHash, record);
  return { record, token };
}

export async function findQrTokenRecord(
  repo: JsonRepository<QrTokenRecord>,
  token: string,
): Promise<QrTokenRecord | null> {
  return repo.get(hashToken(token));
}

export class QrTokenRevokedError extends Error {
  constructor() {
    super("QR_REVOKED: token foi revogado.");
    this.name = "QrTokenRevokedError";
  }
}

export class QrTokenExpiredError extends Error {
  constructor() {
    super("QR_EXPIRED: token expirado.");
    this.name = "QrTokenExpiredError";
  }
}

/** specs/QR_ROUTER.md: token revogado/expirado nunca executa nem resolve. */
export function assertTokenUsable(record: QrTokenRecord, now: Date): void {
  if (record.revoked) throw new QrTokenRevokedError();
  if (record.expires_at && new Date(record.expires_at).getTime() < now.getTime()) {
    throw new QrTokenExpiredError();
  }
  if (record.max_uses !== null && record.use_count >= record.max_uses) {
    throw new QrTokenExpiredError();
  }
}

export async function recordTokenUse(
  repo: JsonRepository<QrTokenRecord>,
  record: QrTokenRecord,
): Promise<void> {
  await repo.save(record.token_hash, { ...record, use_count: record.use_count + 1 });
}

export async function revokeQrToken(
  repo: JsonRepository<QrTokenRecord>,
  token: string,
): Promise<void> {
  const tokenHash = hashToken(token);
  const record = await repo.get(tokenHash);
  if (record) {
    await repo.save(tokenHash, { ...record, revoked: true });
  }
}
