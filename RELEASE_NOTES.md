# Release notes — desk-os-netlify-release-v1.1.0

Construção local completa do DESK-OS / TAL de Fractal a partir do pacote
normativo (PRD, ADRs, schemas, OpenAPI, fixtures, testes de aceitação),
incorporando o delta CR-001/ADR-0017. Ver `CHANGELOG.md` para o histórico
de decisões de contrato.

## O que está nesta release

- Monorepo pnpm completo: 12 `packages/*` (domínio, schemas, eventos,
  storage, ingestão, agentes, decomposição, aprovação, QR, impressão, UI,
  client-sdk) + 2 `apps/*` (`web`, `functions`).
- Frontend fractal (React 19 + Vite 8 + react-router-dom 7), PWA com
  service worker offline-read-first e manifest.
- Netlify Functions v2 cobrindo os 14 endpoints de `api/openapi.yaml`.
- Emissão física A4 retrato dobrável de página única, Face 2 rotacionada
  180° (ADR-0017), com orçamento de conteúdo que nunca trunca em silêncio.
- QR router semântico com o novo tipo `OPEN_CURRENT_ACTION` (resolvedor
  determinístico de 10 passos).
- `netlify.toml` configurado (build, publish, functions, SPA fallback,
  cabeçalhos de segurança, `Permissions-Policy` de câmera escopada a
  `/scan/*`).
- Suíte de testes completa: contratos, unitários, integração, E2E
  (Playwright, navegador real) e acessibilidade (axe + navegação por
  teclado) — ver `VALIDATION_REPORT.md` para os números exatos.

## Estado de sincronização remota

`REMOTE_SYNC=PENDING` — nenhum `git push`, pull request ou deploy foi
executado nesta sessão, por contrato (`EXECUTION_CONTRACT_LOCAL_NETLIFY.md`).
Commits foram feitos localmente na branch de trabalho.

## Como implantar

Ver `DEPLOY_NETLIFY.md`.
