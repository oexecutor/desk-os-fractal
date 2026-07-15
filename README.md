# DESK-OS / TAL de Fractal

Sistema operacional de execução assistida por IA que transforma projetos e
portfólios em planos estruturados, sprints, ações atômicas, dashboards físicos
semanais e fluxos sincronizados por QR semântico.

> Status: implementação inicial. Repositório privado e código proprietário.

## Visão

```text
arquivo, texto ou JSON
        ↓
ingestão e normalização
        ↓
projeto único ou portfólio
        ↓
decomposição fractal assistida por IA
        ↓
revisão e aprovação humana
        ↓
plano ativo
        ↓
frontend + sprint + impressão + QR
```

O usuário entrega contexto. O sistema transforma esse contexto em uma estrutura
executável, rastreável e adaptada ao momento de trabalho.

## Proposta de valor

- importar projetos sem reconstrução manual;
- decompor automaticamente projetos e portfólios;
- apresentar somente o nível de detalhe necessário;
- organizar a semana em blocos de baixa carga cognitiva;
- integrar aplicação digital e dashboard físico;
- usar QR semântico para abrir a ação disponível no momento;
- preservar aprovação humana e critérios verificáveis de conclusão.

## Modelo fractal

```text
workspace
└── portfólio opcional
    └── projeto
        └── fase ou semana
            └── bloco
                ├── ação 1
                ├── ação 2
                ├── ação 3
                └── LINK
```

As cardinalidades superiores são dinâmicas. O bloco operacional padrão possui
três ações e um entregável-síntese chamado `LINK`.

## Aplicação

- intake por arquivo, texto ou JSON;
- projeto único e portfólio;
- navegação por zoom fractal;
- revisão e aprovação;
- sprint e modo foco;
- estado, eventos e evidências;
- emissão semanal;
- geração e leitura de QR;
- PWA web-first;
- backend serverless para Netlify.

## Dashboard físico

Uma folha A4 retrato, impressa em um lado e dobrada para formar duas faces
horizontais.

### Face 1 — contrato semanal

- resultado dominante;
- definição de concluído;
- cinco blocos;
- riscos e dependências;
- identificação da semana;
- QR semântico.

### Face 2 — execução semanal

- SEG a SEX;
- três ações por bloco;
- um LINK por bloco;
- marcação manual;
- Recycle e fechamento;
- o mesmo QR da Face 1.

O papel permanece estático durante a semana. O aplicativo é a fonte de verdade
dinâmica.

## QR semântico

```text
kind: OPEN_CURRENT_ACTION
strategy: CURRENT_ACTION
```

O backend resolve, nesta ordem:

1. ação em andamento;
2. primeira ação pendente elegível;
3. LINK do bloco;
4. fechamento do dia;
5. próximo bloco;
6. Recycle semanal.

GET nunca altera estado. Mutações exigem confirmação, idempotência e controle
de versão.

## Arquitetura planejada

```text
apps/
  web/
  functions/

packages/
  domain/
  schemas/
  ingestion/
  agents/
  decomposition/
  approval/
  events/
  storage/
  qr/
  print/
  ui/
  client-sdk/

tests/
  contract/
  integration/
  e2e/
  accessibility/
  print/
```

Arquitetura: modular monolith TypeScript, web-first.

## Stack de referência

- Node.js 24 LTS
- pnpm 11
- TypeScript 6
- React e Vite
- Ajv Draft 2020-12
- Playwright
- Netlify Functions
- Netlify Blobs por adapter
- PWA

As versões exatas devem ser fixadas no lockfile.

## Execução local

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm validate
pnpm test
pnpm build
npx netlify-cli build
```

Desenvolvimento:

```bash
pnpm dev
```

O projeto deve funcionar em modo mock sem chave de LLM.

## Variáveis de ambiente

```bash
cp .env.example .env.local
```

Nunca versione arquivos `.env`.

## Deploy

O deploy será realizado pela Netlify por integração Git ou Netlify CLI. O
`netlify.toml` será a fonte de verdade para build, publicação, Functions,
redirects e headers.

## Qualidade

Checks planejados:

`lint`, `typecheck`, `test`, `contract-validation`, `build`, `netlify-build`.

## Segurança

- nenhuma chave no cliente;
- nenhum dado real em fixtures públicas;
- `workspace_id` não substitui autenticação;
- planos bloqueados não executam nem imprimem;
- conteúdo do usuário não usa `innerHTML`;
- menor privilégio e logs sem segredos;
- nenhuma alegação clínica.

## Estado

- [x] conceito e arquitetura;
- [x] contratos iniciais;
- [x] dashboard físico;
- [x] QR semântico;
- [ ] bootstrap;
- [ ] domínio e validação;
- [ ] ingestão e decomposição;
- [ ] frontend e backend;
- [ ] impressão dinâmica;
- [ ] PWA;
- [ ] release Netlify.

## Licença

Copyright © 2026 Leonardo Batista. All Rights Reserved.

Consulte [`LICENSE`](LICENSE).
