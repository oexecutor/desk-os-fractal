# Especificação — QR semântico da tarefa atual

## Identidade

```text
kind: OPEN_CURRENT_ACTION
target.strategy: CURRENT_ACTION
```

O token é opaco, estável durante a semana e reutilizado nas duas faces.

## Escopo armazenado no registry

- workspace_id;
- plan_version_id;
- project_id ou portfolio projection id;
- sprint_id;
- minimum_plan_state = ACTIVE;
- estratégia CURRENT_ACTION;
- política de autenticação;
- expiração/revogação;
- hash do token.

O payload público não expõe esses campos.

## Resolvedor determinístico

`resolveCurrentAction(context, materializedState, now)`:

1. validar token, workspace, autenticação, expiração e revogação;
2. validar que a versão do plano está ACTIVE;
3. localizar o sprint semanal associado;
4. localizar ação `IN_PROGRESS` elegível; se houver mais de uma, retornar conflito de domínio e não escolher silenciosamente;
5. senão localizar a primeira ação `TODO` cujas dependências estejam satisfeitas, ordenada por bloco e `order`;
6. se as três ações do bloco estiverem concluídas e o LINK estiver aberto, retornar o LINK;
7. se LINK estiver concluído e fechamento do dia pendente, retornar `CLOSE_DAY`;
8. se o dia estiver fechado, avançar para a primeira ação elegível do próximo bloco;
9. se todos os blocos estiverem fechados, retornar `RECYCLE`;
10. se não houver alvo válido, retornar estado `NO_ACTIONABLE_TARGET` com orientação segura.

## Resposta de resolve

A resposta deve conter descrição segura, sem mutação:

- resolved_kind;
- target_id;
- target_title;
- project/sprint labels;
- consequence_preview;
- expected_version;
- confirmation_required;
- canonical_app_url.

## Execução

- GET nunca muta;
- conclusão exige POST separado;
- POST exige `idempotency_key`;
- POST exige `expected_version`;
- alvo deve existir no plano ativo;
- comando duplicado retorna resultado original;
- conflito de versão retorna 409;
- token não pode criar estado para ID inexistente.

## Compatibilidade

`OPEN_FOCUS` pode continuar existindo para deep links de bloco. O impresso semanal usa exclusivamente `OPEN_CURRENT_ACTION`.
