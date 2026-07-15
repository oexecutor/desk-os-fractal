# Modelo de erros de API

```json
{
  "error": {
    "code": "PLAN_NOT_ACTIVE",
    "message": "O plano precisa estar ativo para executar esta ação.",
    "correlation_id": "...",
    "details": [],
    "retryable": false
  }
}
```

## Códigos essenciais

- `VALIDATION_FAILED` — 400/422
- `UNSUPPORTED_FILE` — 415
- `PAYLOAD_TOO_LARGE` — 413
- `AUTH_REQUIRED` — 401
- `FORBIDDEN` — 403
- `NOT_FOUND` — 404
- `VERSION_CONFLICT` — 409
- `PLAN_NOT_ACTIVE` — 409
- `QR_EXPIRED` — 410
- `QR_REVOKED` — 410
- `IDEMPOTENCY_CONFLICT` — 409
- `MODEL_OUTPUT_INVALID` — 502
- `STORAGE_UNAVAILABLE` — 503

Mensagens ao usuário devem ser claras; detalhes internos ficam em logs protegidos.
