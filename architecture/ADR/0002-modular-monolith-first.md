# ADR-0002 — Modular monolith antes de microsserviços

**Status:** Aceito

## Decisão

Implementar módulos internos com fronteiras testadas em um único repositório e implantação principal. Extrair serviços somente quando houver evidência operacional.

## Consequências

Menor custo cognitivo e operacional; contratos internos continuam explícitos.
