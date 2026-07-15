# ADR-0006 — Log de eventos e snapshot materializado

**Status:** Aceito

## Decisão

Registrar mutações como eventos append-only e manter snapshot atual para leitura rápida. O snapshot deve ser reconstruível.

## Consequências

Melhora auditoria, sync e histórico; exige versionamento e projetor determinístico.
