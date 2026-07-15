import { randomBytes, createHash } from "node:crypto";

/** ADR-0005: token opaco e aleatório — nunca deriva de IDs legíveis. */
export function generateOpaqueToken(): string {
  return randomBytes(24).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
