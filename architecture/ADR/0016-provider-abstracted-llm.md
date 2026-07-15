# ADR-0016 — Provedor de LLM abstraído

**Status:** Aceito

## Decisão

O motor depende de uma interface `StructuredModelClient`, não de SDK específico. A configuração inicial pode usar Anthropic, mas prompts, schemas e retry pertencem ao package de agentes.

## Consequências

Facilita testes com fake model e mudança futura de provedor.
