# Roadmap de implementação

## Fase 0 — Bootstrap e contratos

- criar monorepo;
- configurar TypeScript estrito, lint, formatter, tests e CI;
- copiar schemas e fixtures normativas;
- validar todos os contratos;
- implementar IDs e validadores de grafo.

**Saída:** domínio compila e fixtures passam.  
**GATE HUMANO 0:** aprovar stack e árvore do repositório.

## Fase 1 — Domínio, eventos e storage

- entidades e invariantes;
- state machine do plano;
- comandos/eventos;
- projector de snapshot;
- adapters memory e Netlify Blobs;
- expected version e idempotência.

**GATE HUMANO 1:** demonstrar conflitos, replay e reconstrução.

## Fase 2 — Ingestão

- upload/text input;
- extractors para formatos MVP;
- source artifacts e checksums;
- consentimento e retenção;
- UI de revisão da extração.

## Fase 3 — Agentes e decomposição

- interface de modelo estruturado;
- fake model para testes;
- classifier, extractor, decomposer e critic;
- schema validation e retry;
- relatório FATO/EVIDÊNCIA/INFERÊNCIA/HIPÓTESE/CONTRAEVIDÊNCIA/LACUNA.

**GATE HUMANO 2:** revisar árvores geradas para fixtures reais.

## Fase 4 — Aprovação e frontend fractal

- revisão de plano;
- ativação transacional;
- PortfolioView, ProjectView, NodeView e FocusView;
- acessibilidade e responsividade.

## Fase 5 — Sprint, fechamento e Recycle

- projeção semanal;
- próxima ação determinística;
- evidências;
- close day;
- propostas de reconfiguração.

## Fase 6 — Emissão física

- print composer;
- budget de conteúdo;
- Face 1 e Face 2;
- snapshot/checksum;
- HTML offline;
- testes de impressão.

**GATE HUMANO 3:** validar impressão física real em 100%.

## Fase 7 — QR router

- registry;
- tokens opacos;
- resolvers separados;
- deep link;
- confirmação;
- idempotência e revogação;
- scanner por câmera e entrada manual.

## Fase 8 — PWA e sincronização

- service worker registrado;
- manifest/icons válidos;
- cache do último snapshot;
- foco/polling/backoff;
- estados online/offline/conflito.

## Fase 9 — Capacitor

- criar casca após web core estável;
- preferências nativas;
- câmera e permissões;
- deep links;
- testes Android/iOS.

## Fase 10 — Hardening comercial

- autenticação/autorização;
- rate limit e quotas;
- política de retenção;
- backups;
- auditoria;
- observabilidade e controle de custo.
