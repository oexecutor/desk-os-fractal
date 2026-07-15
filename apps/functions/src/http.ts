export interface StructuredError {
  code: string;
  message: string;
  retryable: boolean;
  status: number;
}

/** specs/API_ERROR_MODEL.md */
export const ERROR_CODES = {
  VALIDATION_FAILED: { status: 422, retryable: false },
  UNSUPPORTED_FILE: { status: 415, retryable: false },
  PAYLOAD_TOO_LARGE: { status: 413, retryable: false },
  AUTH_REQUIRED: { status: 401, retryable: false },
  FORBIDDEN: { status: 403, retryable: false },
  NOT_FOUND: { status: 404, retryable: false },
  VERSION_CONFLICT: { status: 409, retryable: true },
  PLAN_NOT_ACTIVE: { status: 409, retryable: false },
  QR_EXPIRED: { status: 410, retryable: false },
  QR_REVOKED: { status: 410, retryable: false },
  IDEMPOTENCY_CONFLICT: { status: 409, retryable: false },
  MODEL_OUTPUT_INVALID: { status: 502, retryable: true },
  STORAGE_UNAVAILABLE: { status: 503, retryable: true },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export function json(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json", ...init.headers },
  });
}

export function errorResponse(code: ErrorCode, message: string, correlationId: string): Response {
  const meta = ERROR_CODES[code];
  return json(
    { error: { code, message, correlation_id: correlationId, retryable: meta.retryable, details: [] } },
    { status: meta.status },
  );
}

/** Mapeia exceptions conhecidas dos packages de domínio para specs/API_ERROR_MODEL.md. */
export function mapErrorToResponse(err: unknown, correlationId: string): Response {
  const name = err instanceof Error ? err.name : "";
  const message = err instanceof Error ? err.message : String(err);

  if (name === "VersionConflictError") return errorResponse("VERSION_CONFLICT", message, correlationId);
  if (name === "PlanNotActiveError" || message.startsWith("PLAN_NOT_ACTIVE")) {
    return errorResponse("PLAN_NOT_ACTIVE", message, correlationId);
  }
  if (name === "NodeNotFoundError" || name === "PlanNotFoundError") {
    return errorResponse("NOT_FOUND", message, correlationId);
  }
  if (name === "InvalidLifecycleTransitionError") return errorResponse("PLAN_NOT_ACTIVE", message, correlationId);
  if (name === "SchemaValidationError") return errorResponse("VALIDATION_FAILED", message, correlationId);
  if (name === "PayloadTooLargeError") return errorResponse("PAYLOAD_TOO_LARGE", message, correlationId);
  if (name === "UnsupportedFileError") return errorResponse("UNSUPPORTED_FILE", message, correlationId);
  if (name === "ConsentRequiredError") return errorResponse("VALIDATION_FAILED", message, correlationId);
  if (name === "ModelOutputInvalidError") return errorResponse("MODEL_OUTPUT_INVALID", message, correlationId);
  if (name === "QrTokenExpiredError") return errorResponse("QR_EXPIRED", message, correlationId);
  if (name === "QrTokenRevokedError") return errorResponse("QR_REVOKED", message, correlationId);
  if (name === "QrConfirmationRequiredError" || name === "QrRecycleDecisionRequiredError" || name === "QrNoActionableTargetError" || name === "QrSynthesisNotManualError") {
    return errorResponse("VALIDATION_FAILED", message, correlationId);
  }
  if (name === "PrintOverflowError" || name === "PlanNotActiveForPrintError") {
    return errorResponse(name === "PlanNotActiveForPrintError" ? "PLAN_NOT_ACTIVE" : "VALIDATION_FAILED", message, correlationId);
  }
  if (name === "InsufficientInputError") return errorResponse("VALIDATION_FAILED", message, correlationId);

  console.error(`[correlation_id=${correlationId}]`, err);
  return errorResponse("STORAGE_UNAVAILABLE", "Erro interno inesperado.", correlationId);
}
