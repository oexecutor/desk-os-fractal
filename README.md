# DESK-OS / TAL de Fractal (v1.1.0)

**Sistema Operacional de Execução Assistida por IA** que transforma projetos e portfólios em planos estruturados, sprints, ações atômicas e dashboards físicos semanais sincronizados por QR semântico.

> **Status: Implementação v1.1.0 Concluída.**
> 198/198 testes passando. Pronto para deploy em produção (Netlify).

## Visão Geral
O Desk-OS não é apenas um gerenciador de tarefas; é uma engine de decomposição fractal. Ele permite que você entregue contextos complexos (documentos, textos, JSON) e receba uma estrutura operacional navegável que integra o mundo digital ao físico.

## Estado Real da Implementação
Diferente de um kit inicial, este repositório contém a **implementação funcional** dos seguintes módulos:

- **@desk-os/domain**: Modelo canônico recursivo, IDs (ULID), invariantes e ciclo de vida do plano.
- **@desk-os/ingestion**: Pipeline de extração de conteúdo (PDF, DOCX, MD, JSON) com detecção de linguagem e validação de consentimento.
- **@desk-os/agents**: Funções de IA para classificação, extração de contexto e decomposição assistida.
- **@desk-os/events**: Event Sourcing para rastreabilidade total de mudanças e materialização de estado.
- **@desk-os/qr**: Roteador semântico que resolve a "próxima melhor ação" sem mutar estado via GET.
- **@desk-os/print**: Motor de composição e renderização para o Dashboard Físico A4.
- **@desk-os/ui**: Componentes React validados para navegação fractal e aprovação de planos.

## Arquitetura
O projeto é um **Monorepo Modular** em TypeScript:
- `apps/web`: Frontend React + Vite (PWA).
- `apps/functions`: Backend Serverless para Netlify Functions.
- `packages/*`: Lógica de negócio e infraestrutura desacoplada.

## Qualidade e Testes
A robustez do sistema é garantida por uma suíte rigorosa:
- **Unitários & Integração**: 198 testes validados via Vitest.
- **Contratos**: Validação de schemas JSON para todas as fronteiras de dados.
- **E2E**: Fluxos críticos testados via Playwright.

## Como Executar
```bash
corepack enable
pnpm install
pnpm build
pnpm test
```

## Deploy (Netlify)
O sistema está pronto para ser publicado. Consulte `DEPLOY_NETLIFY.md` para instruções sobre as variáveis de ambiente de produção e configuração de segredos.

## Licença
Copyright © 2026 Leonardo Batista. All Rights Reserved.
Consulte [`LICENSE`](LICENSE).
