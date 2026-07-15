# PROMPT MESTRE — Claude Code: construir localmente e entregar ZIP para Netlify

Você está recebendo o pacote normativo **DESK-OS / TAL de Fractal v1.1.0**.  
A pasta atual é a única fonte de verdade. Não dependa dos protótipos, ZIPs ou repositórios anteriores.

## MISSÃO

Construir localmente, do zero, a aplicação DESK-OS / TAL de Fractal conforme PRD, ADRs, schemas, OpenAPI, fixtures e testes deste pacote.

Ao final, entregar **um único arquivo ZIP de release**, pronto para ser extraído, validado e implantado no Netlify.

Nome obrigatório:

```text
desk-os-netlify-release-v1.1.0.zip
```

## AUTORIZAÇÃO DE EXECUÇÃO

Você está autorizado a executar localmente todas as fases necessárias até concluir a release.

Os gates do roadmap continuam sendo critérios de qualidade, mas nesta execução devem ser tratados como **gates internos**. Não interrompa o trabalho para pedir aprovação entre fases.

Pare antes do resultado final somente quando existir um bloqueio real que torne impossível continuar com segurança, como:

- credencial obrigatória ausente para um teste que não possa ser simulado;
- contrato normativo contraditório sem regra de precedência;
- falha de ambiente não contornável;
- risco de perda ou alteração externa.

Quando uma integração depender de segredo, implemente adapter, mock e `.env.example`; não invente nem solicite que uma chave seja colocada no código.

## MODO OPERACIONAL

- Trabalhe somente no filesystem e no repositório local.
- Não faça `git push`.
- Não crie Pull Request.
- Não faça deploy.
- Não altere serviços externos.
- Não envie emails ou mensagens.
- Não use credenciais persistidas sem autorização.
- Commits locais são permitidos e recomendados.
- Se o remoto continuar retornando 403, registre `REMOTE_SYNC=PENDING` e prossiga localmente.

## ORDEM DE AUTORIDADE

Em caso de conflito:

1. ADR aceito mais recente;
2. JSON Schemas;
3. OpenAPI;
4. especificações em `specs/`;
5. PRD e requisitos;
6. fixtures;
7. referências visuais.

O **ADR-0017** e o **CR-001** substituem o contrato de impressão anterior.

## LEITURA INICIAL OBRIGATÓRIA

Leia nesta ordem:

1. `CLAUDE.md`
2. `README.md`
3. `change-requests/CR-001-print-weekly-a4-portrait/CHANGE_REQUEST.md`
4. `architecture/ADR/0017-a4-portrait-folded-weekly-dashboard.md`
5. `specs/PHYSICAL_DASHBOARD_FOLDED_WEEKLY.md`
6. `specs/QR_SEMANTIC_CURRENT_ACTION.md`
7. `product/PRD.md`
8. `product/REQUIREMENTS.md`
9. `architecture/SYSTEM_ARCHITECTURE.md`
10. todos os ADRs aceitos;
11. schemas, OpenAPI, fixtures e testes;
12. `implementation/ROADMAP.md`.

Execute uma auditoria delta do CR-001 e incorpore as mudanças antes do bootstrap.

## STACK AUTORIZADA

Use versões estáveis e compatíveis verificadas na documentação oficial durante a execução:

- Node.js 24 LTS;
- pnpm 11.x com versão exata fixada;
- TypeScript 6.0.x;
- React + Vite;
- Ajv Draft 2020-12;
- Playwright;
- funções serverless modernas compatíveis com Netlify;
- Netlify Blobs atrás de adapter;
- PWA web-first.

Não use TypeScript 7 nesta release.

Gere e versione:

- `pnpm-lock.yaml`;
- `packageManager` no `package.json`;
- `.nvmrc` ou `.node-version`;
- versões exatas no manifesto da release.

## PRODUTO A CONSTRUIR

Fluxo mínimo completo:

```text
arquivo/texto/JSON
→ ingestão
→ extração e normalização
→ classificação projeto único/portfólio
→ decomposição fractal validada
→ revisão e aprovação humana
→ plano ACTIVE
→ frontend fractal
→ sprint/modo foco
→ emissão semanal
→ QR semântico
→ estado, eventos e evidências
```

### Regras invariantes

- retorno de LLM nunca entra no domínio sem validação;
- plano não `ACTIVE` não pode executar, imprimir ou gerar comando mutável;
- IDs são estáveis e nunca derivados de data, título ou índice;
- cardinalidades superiores são dinâmicas;
- o bloco operacional padrão possui exatamente três ações e um LINK;
- GET de QR nunca altera estado;
- mutação por QR exige confirmação, autenticação aplicável, `idempotency_key` e `expected_version`;
- `workspace_id` não substitui autenticação;
- conteúdo de usuário não usa `innerHTML`;
- nenhuma API key vai para o cliente;
- papel funciona offline;
- nenhuma alegação clínica.

## CONTRATO DE IMPRESSÃO OBRIGATÓRIO

A impressão é um **plano semanal estático**, não um dashboard de progresso.

```text
PAPEL = contrato semanal estático
QR    = ponte semântica estável
APP   = fonte de verdade dinâmica
```

Geometria normativa:

```text
A4 RETRATO — 210 × 297 mm — um lado — uma página

40 mm  área mecânica superior
100 mm Face 1 horizontal
40 mm  área mecânica central
100 mm Face 2 horizontal, rotacionada 180°
17 mm  aba mecânica inferior
```

### Face 1

Deve mostrar:

- identidade;
- usuário/cliente;
- projeto ou portfólio;
- sprint e intervalo;
- resultado dominante;
- definition of done;
- cinco blocos planejados;
- contrato: 5 blocos, 15 ações e 5 LINKS;
- riscos/dependências conhecidos;
- QR semântico;
- versão, emissão e checksum.

Não deve mostrar:

- percentual concluído;
- contagem concluída;
- estado atual;
- dia atual;
- ação atual;
- qualquer destaque que fique obsoleto durante a semana.

### Face 2

Deve mostrar:

- SEG a SEX;
- um bloco por dia;
- exatamente três ações por bloco;
- um LINK por bloco;
- marcação manual;
- Recycle;
- fechamento semanal;
- o mesmo QR da Face 1.

### QR impresso

Use:

```text
kind = OPEN_CURRENT_ACTION
target.strategy = CURRENT_ACTION
```

O token é opaco e estável durante a semana. Não fixa uma ação. O resolvedor seleciona deterministicamente:

1. ação `IN_PROGRESS`;
2. primeira ação `TODO` elegível;
3. LINK do bloco;
4. fechamento do dia;
5. primeira ação do próximo bloco;
6. Recycle semanal.

Tamanho final mínimo: 25 × 25 mm, quiet zone de quatro módulos e correção M ou superior.

## ARQUITETURA E ESTRUTURA

Implemente um modular monolith TypeScript com fronteiras claras:

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

`apps/mobile` fica fora desta release, salvo scaffolding documental. Não bloqueie a entrega web por Capacitor.

## NETLIFY

A release deve usar configuração versionada em `netlify.toml`.

O projeto final deve permitir:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm validate
pnpm test
pnpm build
npx netlify-cli build
npx netlify-cli deploy --prod
```

Não execute o último comando.

A configuração deve declarar explicitamente:

- comando de build;
- diretório de publicação;
- diretório das Functions;
- versão de Node;
- redirect da SPA;
- rotas de API;
- headers de segurança;
- câmera permitida apenas para a própria origem quando o scanner for usado.

Use a API moderna de Netlify Functions. Não use Lambda compatibility mode.

## VARIÁVEIS DE AMBIENTE

Inclua `.env.example` completo, sem valores secretos.

Classifique cada variável como:

- pública para build;
- privada de servidor;
- opcional;
- obrigatória em produção.

No mínimo, prever:

- provedor/modelo de LLM;
- chave do provedor, somente servidor;
- base URL pública do QR router;
- configuração de storage;
- política de autenticação;
- flags de mock/local.

O aplicativo deve iniciar localmente em modo mock sem chave de LLM, usando fixtures determinísticas.

## TESTES OBRIGATÓRIOS

Antes de empacotar:

1. lint;
2. typecheck;
3. unitários;
4. validação de todos os schemas;
5. fixtures válidas passam;
6. fixtures inválidas falham pelo motivo esperado;
7. contratos de API;
8. integração de estado/eventos;
9. idempotência e conflito de versão;
10. QR resolve sem mutar em GET;
11. fluxo de projeto único;
12. fluxo de portfólio;
13. aprovação antes da execução;
14. Playwright dos fluxos críticos;
15. acessibilidade por teclado;
16. PWA e service worker;
17. teste de scanner/câmera com fallback;
18. impressão A4 retrato em uma página;
19. Face 2 a 180°;
20. QR físico com 25 mm;
21. detector de overflow;
22. build local do Netlify.

Use mocks onde serviços externos não estiverem configurados.

## CRITÉRIO DE CONCLUSÃO

Não considere concluído enquanto:

- todos os comandos locais obrigatórios não passarem;
- o build do Netlify não passar;
- o app não funcionar com dados de projeto único e portfólio;
- a impressão não corresponder ao ADR-0017;
- o QR não cumprir o contrato semântico;
- a release não estiver reproduzível a partir do lockfile.

## ARQUIVO FINAL

Crie na raiz de trabalho:

```text
release/desk-os-netlify-release-v1.1.0.zip
```

O ZIP deve conter diretamente a raiz implantável do projeto, sem uma pasta externa adicional.

Conteúdo obrigatório:

```text
README.md
CLAUDE.md
DEPLOY_NETLIFY.md
RELEASE_NOTES.md
VALIDATION_REPORT.md
RELEASE_MANIFEST.json
CHECKSUMS.sha256
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
netlify.toml
.nvmrc ou .node-version
.env.example
apps/
packages/
tests/
schemas/
fixtures/
docs/
dist/ ou diretório de publicação definido
netlify/functions/ ou diretório declarado
```

Não incluir:

```text
node_modules/
.git/
.env
tokens
chaves
logs com segredos
caches
arquivos temporários
__MACOSX
.DS_Store
```

O ZIP deve passar em:

```bash
unzip -t release/desk-os-netlify-release-v1.1.0.zip
```

Os checksums devem ser calculados depois do build final.

## DEPLOY_NETLIFY.md

Inclua dois caminhos:

### Caminho A — Netlify CLI

1. extrair ZIP;
2. instalar dependências com lockfile;
3. autenticar no Netlify;
4. vincular ou criar o projeto;
5. cadastrar variáveis privadas no painel/CLI;
6. executar build local;
7. executar deploy de preview;
8. validar;
9. executar deploy de produção.

### Caminho B — Git

1. extrair ZIP em repositório;
2. fazer commit;
3. conectar o repositório ao Netlify;
4. cadastrar variáveis;
5. confirmar build, publish e functions pelo `netlify.toml`.

Explique que drag-and-drop do diretório estático é adequado apenas quando não há Functions. Esta aplicação depende de Functions e deve preferir CLI ou integração Git.

## RELATÓRIO FINAL

Na resposta final, entregue somente:

1. resumo do que foi implementado;
2. tabela dos testes e resultados;
3. lacunas reais restantes;
4. caminho absoluto do ZIP;
5. SHA-256 do ZIP;
6. instruções mínimas de deploy;
7. estado `REMOTE_SYNC=PENDING` se não houve push.

Não declare deploy realizado.

## DECISÃO

**AVANÇAR e concluir toda a implementação local, testes, build e empacotamento da release Netlify.**
