# Matriz de rastreabilidade

| Requisito | Especificação | API/Schema | Teste principal |
|---|---|---|---|
| FR-002–004 | `specs/INGESTION_PIPELINE.md` | ingestion schemas, `/ingestions` | AT-001–AT-004 |
| FR-005–008 | `specs/DECOMPOSITION_ENGINE.md` | decomposition schema | AT-005–AT-010 |
| FR-009–010 | `specs/PLAN_LIFECYCLE.md` | plan schema, `/approve` | AT-011–AT-014 |
| FR-011–013 | `specs/FRONTEND_FRACTAL.md` | node schema | AT-015–AT-020 |
| FR-014–015 | `specs/STATE_AND_EVENT_MODEL.md` | event/progress schema | AT-021–AT-026 |
| FR-016 | `specs/SPRINT_AND_FOCUS_PROJECTIONS.md` | projection endpoints | AT-027–AT-029 |
| FR-017 | `specs/PHYSICAL_DASHBOARD_FOLDED_WEEKLY.md` (ADR-0017, CR-001) | print snapshot schema v1.1.0 | `qa/ACCEPTANCE_TESTS_PRINT_V2.feature` AT-030–AT-040 |
| FR-018–022 | `specs/QR_ROUTER.md` + `specs/QR_SEMANTIC_CURRENT_ACTION.md` | QR schema/endpoints (`OPEN_CURRENT_ACTION`) | AT-037–AT-045, AT-035–AT-038 (v2) |
| FR-023–024 | `specs/SYNC_AND_OFFLINE.md` | state endpoint | AT-046–AT-050 |
| FR-025 | `specs/RECYCLE_AND_RECONFIGURATION.md` | events | AT-051–AT-055 |
| NFR-003–005 | UX + print specs | design tokens | accessibility/print suites |
| NFR-001–002 | Security architecture | OpenAPI + schemas | security suite |
