# DESK-OS / TAL de Fractal — pacote autossuficiente para Claude Code

**Versão:** 1.1.0  
**Status:** contrato inicial aprovado para construção do zero  
**Idioma normativo:** português do Brasil

Este repositório é a fonte de verdade para construir o DESK-OS / TAL de Fractal sem depender de protótipos, ZIPs ou códigos anteriores. Ele contém visão de produto, PRD, requisitos, ADRs, modelo de domínio, schemas, API, UX, especificação do dashboard físico de duas faces, segurança, testes, backlog e instruções específicas para Claude Code.

## Resultado esperado

Construir um sistema web-first que:

1. recebe um projeto ou portfólio por arquivo, texto ou JSON;
2. extrai e normaliza o conteúdo;
3. identifica projeto único ou múltiplos projetos;
4. gera uma decomposição hierárquica validada;
5. exige aprovação humana antes de permitir execução;
6. apresenta a estrutura em um frontend fractal por zoom;
7. projeta o mesmo estado em sprint, modo foco e dashboard físico;
8. sincroniza progresso, evidências e decisões;
9. usa QR Codes semânticos e estáveis para abrir ou atualizar contexto;
10. opera como PWA e, posteriormente, como aplicativo Capacitor.

## Regra central do produto

A árvore é dinâmica nos níveis superiores. O bloco operacional ativo segue preferencialmente:

```text
Projeto → Dia/Bloco → 3 ações atômicas → 1 entregável-síntese (LINK)
```

As cardinalidades `9 × 3 × 3` e `5 × 5 × 3` são exemplos de projeção, não regras universais.

## Emissão física — contrato v1.1.0

O artefato é uma única folha A4 retrato, impressa em um lado e dobrada para formar duas faces horizontais:

- **Face 1 — Visão e contrato semanal:** resultado dominante, definição de concluído, cinco blocos planejados, riscos e QR.
- **Face 2 — Execução semanal:** SEG–SEX, três ações e um LINK por bloco, marcação manual, Recycle e fechamento.

O conteúdo é estático durante a semana. O aplicativo permanece dinâmico. O mesmo QR semântico resolve a tarefa aberta, o LINK ou o fechamento no momento do escaneamento.

## Como usar com Claude Code

1. Extraia este pacote em uma pasta vazia.
2. Abra a pasta no Claude Code.
3. Cole o conteúdo de `claude-code/MASTER_PROMPT.md`.
4. Execute primeiro o comando `/project-audit`.
5. Siga `implementation/ROADMAP.md` e pare nos gates indicados.
6. Não comece pelo frontend. O primeiro artefato de implementação é o contrato canônico validado.

## Ordem de leitura obrigatória

1. `CLAUDE.md`
2. `product/PRD.md`
3. `product/REQUIREMENTS.md`
4. `architecture/SYSTEM_ARCHITECTURE.md`
5. `architecture/ADR/`
6. `specs/CANONICAL_DOMAIN_MODEL.md`
7. `specs/STATE_AND_EVENT_MODEL.md`
8. `specs/DECOMPOSITION_ENGINE.md`
9. `specs/FRONTEND_FRACTAL.md`
10. `specs/PHYSICAL_DASHBOARD_TWO_FACES.md`
11. `api/openapi.yaml`
12. `qa/ACCEPTANCE_TESTS.feature`
13. `implementation/ROADMAP.md`

## Autoridade dos artefatos

Em caso de conflito, prevalece esta ordem:

1. ADR aceito mais recente;
2. schemas JSON;
3. OpenAPI;
4. especificações em `specs/`;
5. PRD e requisitos;
6. exemplos, wireframes e referências visuais.

## Restrições essenciais

- Nenhuma ação externa automática sem confirmação do usuário.
- Um plano `BLOQUEADO` nunca pode alimentar execução, impressão ou QR mutável.
- `workspace_id` não é autenticação.
- IDs não podem depender de data, índice de lista ou resposta instável do modelo.
- QRs impressos devem usar domínio/router estável.
- O papel deve funcionar offline como snapshot.
- Não produzir claims clínicos ou terapêuticos.
- A interface deve ser de baixa densidade, responsiva e acessível por teclado.

## Execução local e release Netlify

Para solicitar a construção completa sem push e sem deploy, use:

`PROMPT_CLAUDE_CODE_BUILD_LOCAL_NETLIFY.md`

Saída exigida do Claude Code:

`release/desk-os-netlify-release-v1.1.0.zip`
