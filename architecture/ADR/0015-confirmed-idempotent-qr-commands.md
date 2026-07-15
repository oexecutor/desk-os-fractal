# ADR-0015 — Comandos QR confirmados e idempotentes

**Status:** Aceito

## Decisão

QR de contexto pode abrir leitura diretamente. QR que altera estado resolve para uma tela de confirmação e só executa via POST autenticado com idempotency key e expected version.

## Consequências

Não existe toggle direto por query string; o fluxo é mais seguro e auditável.
