# Arquitetura do sistema

## Estilo

Modular monolith com fronteiras internas explícitas. A primeira versão é implantada como frontend estático/PWA e funções serverless. O domínio permanece independente de framework e provedor.

## Fluxo principal

```text
Intake
  → Extraction
  → Classification
  → Decomposition
  → Deterministic Validation
  → Human Review
  → Active Canonical Graph
  → Projections: Fractal | Focus | Sprint | Print
  → Commands/Events
  → Materialized State
```

## Módulos

| Módulo | Responsabilidade |
|---|---|
| `domain` | Entidades, IDs, regras, estados e invariantes. |
| `schemas` | JSON Schemas e validadores de fronteira. |
| `ingestion` | Upload, extração e normalização de fontes. |
| `agents` | Orquestração de prompts e structured output. |
| `decomposition` | Transformar contexto em grafo canônico draft. |
| `approval` | Revisão, comparação, aprovação e ativação. |
| `events` | Comandos, eventos append-only e projeções de estado. |
| `storage` | Interfaces e adapters de persistência. |
| `qr` | Registro, resolução e execução segura de tokens. |
| `print` | Composição e renderização das duas faces. |
| `ui` | Componentes visuais e tokens. |
| `web` | Aplicativo React/PWA e roteamento. |
| `functions` | Adaptadores HTTP/serverless. |
| `mobile` | Casca Capacitor opcional. |

## Dependências permitidas

```text
apps/web ──────→ packages/ui, domain, schemas, client-sdk
apps/functions → domain, schemas, ingestion, agents, events, storage, qr, print
packages/*      → domain e schemas conforme necessário

domain não depende de UI, HTTP, Netlify, filesystem ou LLM.
```

## Fonte de verdade

- Estrutura: grafo canônico versionado.
- Execução: log de eventos append-only.
- Leitura: snapshot materializado reconstruível.
- Impressão: snapshot imutável derivado.
- QR: token registry, nunca URL montada do `location.href`.

## Consistência

Toda mutação recebe:

- `command_id`;
- `idempotency_key`;
- `expected_version`;
- identidade do ator;
- timestamp do servidor.

Conflitos retornam `409` e exigem recarregar ou reconciliar.
