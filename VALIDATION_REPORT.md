# Relatório de validação — release v1.1.0

**Data:** 2026-07-15
**Escopo:** implementação completa do DESK-OS / TAL de Fractal (Fases 0–9 de
`CLAUDE.md`), incluindo o delta CR-001/ADR-0017, construída localmente
neste ambiente.
**Resultado:** APROVADO para empacotamento de release. Deploy real no
Netlify **não foi executado** (fora do escopo autorizado desta execução —
ver `EXECUTION_CONTRACT_LOCAL_NETLIFY.md`).

## Ambiente

| Ferramenta | Versão |
|---|---|
| Node.js | v22.22.2 (repositório roda com `>=22.12.0`; build remoto do Netlify usa Node 24 via `netlify.toml`) |
| pnpm | 11.13.0 |
| TypeScript | 6.0.3 |
| Playwright | 1.61.1 |
| Vitest | 4.1.10 |

## Resultado dos testes

| Camada | Ferramenta | Resultado | Evidência |
|---|---|---|---|
| Contratos (JSON Schema 2020-12, 14 schemas, fixtures válidas/inválidas, `events.ndjson`, OpenAPI 3.1) | `scripts/validate-contracts.ts` | **PASS** — 0 falhas | `pnpm run validate:contracts` |
| Unitários + contrato + integração (domínio, eventos, storage, ingestão, agentes, decomposição, aprovação, QR, impressão, UI, client-sdk) | Vitest | **PASS** — 198/198 testes, 45 arquivos | `pnpm run test` |
| Integração ponta a ponta backend (ingest → decompose → review → approve → activate → tree → print → QR, 14 handlers reais) | Vitest (`tests/integration/full-flow.test.ts`) | **PASS** — incluído nos 198 acima | idem |
| E2E navegador real (intake → decomposição → aprovação → ativação → navegador fractal → foco → emissão A4) | Playwright | **PASS** — 6/6 | `pnpm exec playwright test tests/e2e` |
| Acessibilidade (axe, navegação só-teclado, skip link, 320px sem rolagem horizontal — NFR-004) | Playwright + `@axe-core/playwright` | **PASS** — 4/4 | `pnpm exec playwright test tests/accessibility` |
| Tipos estritos (`exactOptionalPropertyTypes`, sem `any` implícito) | `tsc --noEmit` em cada pacote | **PASS** — 14/14 pacotes | `pnpm run typecheck` |
| Lint (bane `innerHTML`/`document.write`, regras `typescript-eslint` recomendadas) | ESLint flat config | **PASS** — 0 erros, 0 avisos | `pnpm run lint` |
| Build de produção (todos os pacotes + `apps/web` via Vite + `apps/functions` via `tsc`) | pnpm workspaces | **PASS** — 14/14 pacotes | `pnpm run build` |

**Total: 208 testes automatizados executados, 208 aprovados.**

## Casos de aceitação verificados nominalmente

- **A4 retrato dobrável (ADR-0017):** o snapshot de impressão gerado contém
  a string `A4 portrait` e a regra CSS `.face2 { transform: rotate(180deg) }`,
  confirmando a Face 2 rotacionada — verificado tanto por teste unitário de
  `packages/print` quanto pelo teste E2E que lê o `<iframe>` de
  pré-visualização renderizado no navegador real.
- **QR semântico `OPEN_CURRENT_ACTION`:** resolvedor determinístico de 10
  passos testado em `packages/qr` (inclui o caso de bloco sem ação elegível
  e o caso de conclusão automática de síntese como efeito colateral SYSTEM
  ao concluir a 3ª ação-irmã).
- **Plano bloqueado:** `InsufficientInputError` cobre entrada insuficiente
  sem gerar um `PlanVersion` inválido (nunca retorna `nodes: []`, que
  violaria `plan-version.schema.json`).
- **Projeto único e portfólio:** ambas as fixtures canônicas
  (`canonical-single-project.json`, `canonical-portfolio.json`) validam
  contra `plan-version.schema.json` e exercitam cardinalidade dinâmica (sem
  3/5/9 hardcoded) nos testes de `packages/domain` e no teste E2E do
  navegador fractal.

## Gaps reais remanescentes

- **`netlify dev`/Netlify CLI indisponíveis neste sandbox.** O E2E roda
  contra `vite preview` (build de produção real) mais um servidor HTTP
  mínimo (`tests/e2e/dev-api-server.ts`) que invoca os mesmos handlers reais
  de `apps/functions/src/routes/*.ts` sobre `fetch`/`Request`/`Response`
  padrão — não é uma simulação dos handlers, mas também não reproduz
  comportamentos específicos do runtime do Netlify (rate limiting, cold
  start, roteamento exato de Functions v2 em produção). Nenhum deploy real
  foi executado nem simulado além disso.
- **`AnthropicModelClient` (`packages/agents/src/anthropic-model-client.ts`)
  não foi exercitado em nenhum teste automatizado** — só o
  `FakeModelClient` determinístico (`MOCK_MODE=true`) foi testado. É
  responsabilidade de quem fizer o deploy real validar a integração com
  o provedor de modelo antes de desligar `MOCK_MODE`.
- **Testes de impressão física real (papel) não foram feitos** — os testes
  cobrem geometria em mm, orçamento de conteúdo e o HTML/CSS gerado, não
  uma impressão física de conferência.
- **Capacitor/mobile nativo não implementado** — decisão intencional de
  escopo por `CLAUDE.md` ("PWA primeiro; Capacitor depois"), não uma
  lacuna do MVP web.
- **OCR manuscrito não implementado** — proibido explicitamente no MVP por
  `CLAUDE.md`.
