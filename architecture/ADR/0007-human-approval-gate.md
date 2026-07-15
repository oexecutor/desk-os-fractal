# ADR-0007 — Gate humano antes da execução

**Status:** Aceito

## Decisão

Saída do agente nasce `GENERATED`. Somente aprovação humana cria versão `ACTIVE`. Estados bloqueados/rejeitados não geram execução, QR mutável ou emissão operacional.

## Consequências

Aumenta segurança e confiança; adiciona etapa de revisão obrigatória.
