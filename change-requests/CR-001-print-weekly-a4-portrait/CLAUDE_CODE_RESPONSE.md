# Resposta ao `/project-audit`

## Decisão

**CORRIGIR** antes do `/bootstrap`.

A auditoria foi correta para o pacote v1.0.0, mas uma decisão de produto aprovada depois da auditoria supersede o contrato de impressão existente. A correção é contratual e precisa entrar no repositório antes de congelar schemas, fixtures e testes na Fase 0.

## Correção obrigatória

Aplicar o Change Request `CR-001 — A4 portrait folded weekly dashboard`:

- substituir o formato `A4_LANDSCAPE_TWO_FACE_V1` por `A4_PORTRAIT_FOLDED_WEEKLY_V2`;
- gerar uma única página A4 retrato, impressa em um lado;
- usar zonas verticais de `40 / 100 / 40 / 100 / 17 mm`;
- Face 1 e Face 2 são layouts horizontais de `210 × 100 mm`;
- rotacionar a Face 2 em 180°;
- retirar progresso, estado atual, dia atual e ação atual do conteúdo impresso;
- imprimir o plano estático da semana: 5 blocos, 3 ações e 1 LINK por bloco;
- usar o mesmo QR opaco nas duas faces;
- o QR deve executar `OPEN_CURRENT_ACTION` com estratégia `CURRENT_ACTION` e resolver o estado dinâmico no backend.

Após aplicar a correção:

1. validar schemas e fixtures;
2. atualizar testes AT-030+;
3. registrar evidências;
4. então mudar a decisão para **AVANÇAR** e executar `/bootstrap`;
5. parar no **GATE HUMANO 0** conforme o roadmap.

## Stack

Aprovo a direção da stack com uma correção:

- Node.js 24 LTS;
- pnpm 11.x, fixado exatamente no lockfile;
- TypeScript 6.0.x;
- não usar TypeScript 7.0 nesta fase;
- demais versões devem ser consultadas e fixadas no momento da instalação.

TypeScript 7 deve permanecer fora do bootstrap até existir release estável e compatibilidade comprovada com lint, type-aware tooling, Vite e testes.

## Push 403

Não repetir tentativas de push enquanto a permissão não for corrigida.

Preservar o commit local e registrar claramente `REMOTE_SYNC=PENDING`.

A correção é responsabilidade do proprietário do repositório:

- se a autenticação for por GitHub App, instalar a aplicação no repositório correto e conceder `Contents: Read and write`;
- conceder `Workflows: Read and write` somente se o agente precisar alterar `.github/workflows/**`;
- confirmar que o usuário associado também possui acesso de escrita ao repositório;
- alternativa: usar PAT fine-grained restrito ao repositório com `Contents: Read and write`;
- nunca colar token em chat, documentação ou commit.

Depois da correção, fazer uma única nova tentativa de `git push`. Se continuar bloqueado, gerar `git bundle` ou patch para preservar o trabalho fora do ambiente local.
