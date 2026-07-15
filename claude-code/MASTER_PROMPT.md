# Prompt mestre para iniciar no Claude Code

Leia `CLAUDE.md` e todos os documentos indicados em `README.md`. Este repositório é a única fonte de verdade e deve permitir construir o DESK-OS / TAL de Fractal do zero.

Sua primeira execução deve ser somente de auditoria e preparação:

1. verifique consistência entre PRD, requisitos, ADRs, schemas, OpenAPI, fixtures e testes;
2. liste conflitos reais, sem inventar;
3. proponha a árvore exata do monorepo;
4. proponha versões atuais e estáveis das ferramentas após consultar documentação oficial;
5. gere o plano de implementação da Fase 0;
6. não implemente frontend nem regras de negócio ainda;
7. pare no GATE HUMANO 0.

Regras permanentes:

- não dependa de protótipos externos;
- não altere requisito normativo sem ADR;
- não aceite saída de LLM sem schema;
- não permita execução antes de plano ACTIVE;
- não hardcode cardinalidade superior;
- preserve 3 ações + 1 LINK no bloco operacional;
- Face 1 é visão/estado; Face 2 é foco/fechamento;
- QR usa router estável, token opaco, confirmação e idempotência;
- reporte FATO, EVIDÊNCIA, INFERÊNCIA, HIPÓTESE, CONTRAEVIDÊNCIA e LACUNA separadamente.


## Execução integral local

Quando a solicitação for construir toda a aplicação e gerar a release Netlify, use como autoridade operacional:

`PROMPT_CLAUDE_CODE_BUILD_LOCAL_NETLIFY.md`

Nesse modo, os gates são internos, não há push nem deploy, e a saída é
`release/desk-os-netlify-release-v1.1.0.zip`.
