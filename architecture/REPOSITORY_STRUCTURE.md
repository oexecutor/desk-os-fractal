# Estrutura-alvo do repositório

```text
.
├── apps/
│   ├── web/
│   ├── functions/
│   └── mobile/                 # criado somente na fase Capacitor
├── packages/
│   ├── domain/
│   ├── schemas/
│   ├── ingestion/
│   ├── agents/
│   ├── decomposition/
│   ├── approval/
│   ├── events/
│   ├── storage/
│   ├── qr/
│   ├── print/
│   ├── ui/
│   └── client-sdk/
├── tests/
│   ├── contract/
│   ├── integration/
│   ├── e2e/
│   ├── accessibility/
│   └── print/
├── docs/
├── schemas/
├── fixtures/
├── .claude/commands/
├── CLAUDE.md
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Regras

- `apps/` contém composição e adapters, não regras de domínio.
- `packages/domain` não importa bibliotecas de UI ou infraestrutura.
- Cada package expõe API pública por `index.ts`.
- Imports internos profundos são proibidos fora do próprio package.
- Schemas são publicados como assets e também compilados em validadores.
- Fixtures normativas ficam versionadas e alimentam testes de contrato.
