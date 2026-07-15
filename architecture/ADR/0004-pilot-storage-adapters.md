# ADR-0004 — Storage por adapters; Netlify Blobs no piloto

**Status:** Aceito

## Decisão

O domínio usa interfaces de repositório. O piloto terá adapters de memória e Netlify Blobs. Nenhuma regra de domínio conhece APIs Netlify.

## Consequências

Permite testes rápidos e migração futura para banco transacional.
