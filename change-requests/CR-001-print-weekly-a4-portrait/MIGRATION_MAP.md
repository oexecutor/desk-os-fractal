# Mapa de migração

| Arquivo v1.0.0 | Ação |
|---|---|
| `architecture/ADR/0010-two-face-physical-dashboard.md` | Marcar como `Superseded by ADR-0017`; não apagar histórico. |
| `specs/PHYSICAL_DASHBOARD_TWO_FACES.md` | Substituir conteúdo normativo pela especificação v2 deste CR ou renomear e adicionar redirecionamento. |
| `specs/QR_ROUTER.md` | Adicionar `OPEN_CURRENT_ACTION`, `CURRENT_ACTION` e algoritmo determinístico. |
| `schemas/print-snapshot.schema.json` | Substituir pelo schema v1.1.0 deste pacote. |
| `schemas/qr-token.schema.json` | Substituir pelo schema v1.1.0 deste pacote. |
| `fixtures/print-snapshot.json` | Substituir pela fixture deste pacote. |
| `qa/ACCEPTANCE_TESTS.feature` | Substituir AT-030–AT-039 pelos cenários de `ACCEPTANCE_TESTS_PRINT_V2.feature`. |
| `qa/PRINT_TEST_PLAN.md` | Substituir pelo plano v2. |
| `.claude/commands/06-print-two-faces.md` | Substituir pelo comando deste pacote. |
| `product/REQUIREMENTS.md` | Atualizar requisitos de impressão e QR. |
| `product/TRACEABILITY_MATRIX.md` | Atualizar rastreabilidade para ADR-0017, schema v1.1 e AT v2. |
| `implementation/BACKLOG.csv` | Atualizar histórias de print renderer e QR resolver. |
| `CHANGELOG.md` | Registrar v1.1.0 como breaking contract change. |

## Regra de compatibilidade

O renderer não deve aceitar `A4_LANDSCAPE_TWO_FACE_V1` como formato novo. Dados antigos podem ser lidos apenas por uma migração explícita; não realizar conversão silenciosa.
