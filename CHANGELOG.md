# Changelog

## 1.1.0 — 2026-07-14 (CR-001, breaking contract change)

- ADR-0017 substitui parcialmente ADR-0010: emissão física passa de duas páginas A4 paisagem para uma única folha A4 retrato dobrável.
- Novo formato de impressão `A4_PORTRAIT_FOLDED_WEEKLY_V2`: papel é plano semanal estático (sem progresso/estado volátil); Face 2 é impressa rotacionada 180°.
- `schemas/print-snapshot.schema.json` e `schemas/qr-token.schema.json` atualizados para `schema_version 1.1.0`.
- Novo tipo de QR `OPEN_CURRENT_ACTION` / estratégia `CURRENT_ACTION` com resolvedor determinístico de 10 passos (`specs/QR_SEMANTIC_CURRENT_ACTION.md`).
- `qa/ACCEPTANCE_TESTS_PRINT_V2.feature` e `qa/PRINT_TEST_PLAN_V2.md` substituem os cenários de impressão v1.0.0.
- Execução local autorizada a construir a aplicação integralmente e empacotar `release/desk-os-netlify-release-v1.1.0.zip` sem push/deploy.

## 1.0.0 — 2026-07-14

- Primeiro pacote autossuficiente.
- Consolidação de projeto único e portfólio em modelo recursivo.
- Definição de gate humano obrigatório.
- Definição de QR router estável e comandos idempotentes.
- Definição do frontend fractal como projeção principal.
- Mudança de emissão para dashboard físico de duas faces.
