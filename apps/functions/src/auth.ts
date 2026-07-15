/**
 * ASSUMPTIONS_AND_LACUNAE.md: "Provedor de autenticação" é uma lacuna
 * comercial explícita. Este é só um bearer estático de piloto — nunca
 * confundir com autenticação real, e `workspace_id` nunca substitui isto
 * (CLAUDE.md).
 */
export class AuthRequiredError extends Error {
  constructor() {
    super("AUTH_REQUIRED: bearer token ausente ou inválido.");
    this.name = "AuthRequiredError";
  }
}

export function assertPilotAuth(request: Request, pilotBearerToken: string | null): void {
  if (!pilotBearerToken) return; // piloto sem token configurado: acesso controlado por outra camada (rede).
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (token !== pilotBearerToken) {
    throw new AuthRequiredError();
  }
}
