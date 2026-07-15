# Deploy no Netlify — DESK-OS / TAL de Fractal v1.1.0

Este pacote é código-fonte + build estático (`apps/web/dist`), pronto para
deploy no Netlify. **O Claude Code preparou os arquivos, mas não executou
nenhum deploy real** — a etapa abaixo é manual, executada por quem recebe
este ZIP.

## Pré-requisitos

- Node.js >= 22.12.0 (o `netlify.toml` declara `NODE_VERSION = 24` para o
  build remoto do Netlify).
- pnpm 11.13.0 (`packageManager` fixado em `package.json`; `corepack enable`
  resolve isso automaticamente no build remoto).
- Uma conta Netlify com permissão para criar um site.

## Modo 1 — Integração Git (recomendado)

1. Extraia este ZIP e faça push do conteúdo para um repositório Git novo ou
   existente (`git init && git add -A && git commit -m "release v1.1.0" && git push`).
2. No Netlify: **Add new site → Import an existing project**, aponte para o
   repositório.
3. O Netlify lê `netlify.toml` automaticamente:
   - `build.command = "corepack enable && pnpm install --frozen-lockfile && pnpm run build"`
   - `build.publish = "apps/web/dist"`
   - `build.functions = "apps/functions/src/routes"` (Netlify Functions v2,
     bundladas via esbuild a partir do código-fonte — não da pasta `dist`).
4. Configure as variáveis de ambiente do site (ver `.env.example`) antes do
   primeiro deploy — nenhuma chave de API deve ir no cliente (Vite só expõe
   variáveis prefixadas `VITE_*`, e nenhuma delas deve ser um segredo).
5. Dispare o deploy. O Netlify roda o build completo (schemas, domínio,
   web, functions) do zero a partir da fonte.

## Modo 2 — Netlify CLI

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run build
netlify deploy --build   # preview
netlify deploy --build --prod   # produção, após validar o preview
```

`netlify deploy --build` reexecuta o `build.command` do `netlify.toml`
localmente antes de publicar — não depende do `apps/web/dist` já presente
neste ZIP, mas o build já incluso serve como conferência rápida sem
depender de rede.

## Por que não "upload estático" por drag-and-drop

A aplicação depende das Netlify Functions (`apps/functions/src/routes/*.ts`)
para toda a API (`/api/*`) — ingestão, decomposição, aprovação, árvore de
estado, impressão e resolução de QR. Um upload estático de `apps/web/dist`
sozinho serve o frontend mas deixa a API fora do ar. Use sempre o Modo 1 ou
o Modo 2 acima.

## Variáveis de ambiente

Ver `.env.example` na raiz para a lista completa. Nenhuma é obrigatória em
`MOCK_MODE=true` (usado nos testes locais); para produção real, configure o
provedor de modelo (classificador/decompositor) e as opções de storage
(Netlify Blobs) conforme documentado no arquivo.

## Verificação pós-deploy sugerida

- `GET /api/workspaces/:id/tree` de um workspace novo retorna 404 limpo
  (nenhum plano ainda).
- Fluxo de intake → decomposição → aprovação → ativação completa sem erro
  de schema.
- `/emit` gera uma folha A4 retrato com Face 2 rotacionada 180° (ADR-0017).
- Cabeçalhos de segurança (`Content-Security-Policy`, `Permissions-Policy`
  restringindo câmera a `/scan/*`) presentes na resposta.
