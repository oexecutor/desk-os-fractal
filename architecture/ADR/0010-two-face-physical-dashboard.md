# ADR-0010 — Dashboard físico de duas faces

**Status:** Substituído por ADR-0017 (v1.1.0 / CR-001)

> A geometria e o conteúdo descritos abaixo não são mais normativos. O contrato vigente é
> A4 retrato dobrável semanal — ver `architecture/ADR/0017-a4-portrait-folded-weekly-dashboard.md`
> e `specs/PHYSICAL_DASHBOARD_FOLDED_WEEKLY.md`. Este registro é mantido apenas como histórico.

## Decisão

Substituir mapa multifaces por duas faces A4 paisagem:

- Face 1: visão, orientação e estado;
- Face 2: foco, ação e fechamento.

QR, metadados e identificação são componentes integrados. O papel é snapshot seletivo, não réplica da interface.

## Consequências

O renderer precisa de orçamento rígido de conteúdo e seleção determinística.
