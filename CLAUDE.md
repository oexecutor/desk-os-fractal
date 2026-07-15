# Instruções normativas para Claude Code

Você está construindo o DESK-OS / TAL de Fractal do zero. Este repositório é o contrato completo. Não dependa de arquivos externos, protótipos anteriores ou conhecimento implícito.

## Missão

Implementar um modular monolith TypeScript, web-first, capaz de ingerir projetos, gerar uma árvore fractal aprovada, persistir estado e projetá-lo em frontend, sprint, folha A4 retrato dobrável de duas faces horizontais e QR Codes semânticos.

## Sequência obrigatória

1. Auditar a consistência deste pacote.
2. Criar o monorepo e os testes de contrato.
3. Implementar schemas e domínio canônico.
4. Implementar estado/eventos e storage adapters.
5. Implementar ingestão e decomposição.
6. Implementar aprovação humana.
7. Implementar frontend fractal.
8. Implementar projeções de foco, sprint e impressão.
9. Implementar QR router.
10. Implementar PWA; Capacitor somente após o web core estabilizar.

## Proibições

- Não começar pela aparência.
- Não hardcodar 3, 5 ou 9 elementos em níveis superiores.
- Não permitir execução de plano não aprovado.
- Não aceitar retorno de modelo sem validação por schema.
- Não usar `workspace_id` como controle de acesso.
- Não armazenar API keys no cliente.
- Não usar `innerHTML` para conteúdo de usuário.
- Não criar IDs a partir de título, posição ou data.
- Não executar comandos de QR sem resolução, autenticação aplicável, confirmação e idempotência.
- Não implementar OCR manuscrito no MVP.
- Não fazer claims clínicos.

## Decisões técnicas

- Linguagem: TypeScript estrito.
- Arquitetura: modular monolith com packages internos.
- Frontend: React + TypeScript + Vite, sem dependência de framework de servidor.
- Backend piloto: funções serverless compatíveis com Netlify.
- Persistência piloto: adapter para Netlify Blobs + adapter de memória para testes.
- Validação: JSON Schema em todas as fronteiras.
- Estado: snapshot materializado + log de eventos append-only.
- IDs: UUIDv7 ou ULID monotônico; nunca índice/data.
- Testes: unitários, contratos, integração, Playwright, acessibilidade e impressão.
- PWA primeiro; Capacitor depois.

Não fixe versões de bibliotecas sem consultar a documentação oficial vigente no momento da implementação. Gere lockfile e registre versões exatas no primeiro commit de bootstrap.

## Gate de trabalho

Ao final de cada fase:

1. rode lint, typecheck e testes;
2. atualize `docs/DECISION_LOG.md` se houver decisão nova;
3. produza relatório de evidências;
4. pare e solicite aprovação antes da próxima fase quando o roadmap indicar `GATE HUMANO`.

## Regra de interpretação

Separe sempre:

- FATO: presente na entrada ou persistência;
- EVIDÊNCIA: referência verificável;
- INFERÊNCIA: conclusão do sistema;
- HIPÓTESE: suposição a validar;
- CONTRAEVIDÊNCIA: informação que desafia a proposta;
- LACUNA: informação necessária ausente.

Nunca transforme LACUNA em fato.

## Override normativo v1.1.0

- ADR-0017 substitui o contrato físico anterior.
- Papel é plano semanal estático.
- A4 retrato, uma página, um lado.
- Face 1: contrato semanal.
- Face 2: cinco dias, três ações e um LINK por dia.
- Face 2 é rotacionada 180°.
- O mesmo QR `OPEN_CURRENT_ACTION` é usado nas duas faces.
- Para execução completa local e empacotamento Netlify, seguir `PROMPT_CLAUDE_CODE_BUILD_LOCAL_NETLIFY.md`.
