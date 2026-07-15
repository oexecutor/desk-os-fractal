# Especificação — QR router

## URL pública

```text
https://<QR_BASE_URL>/q/{opaqueToken}
```

O token não contém IDs legíveis nem payload confiável no cliente.

## Tipos

- `VIEW_CONTEXT`: leitura do mesmo contexto da Face 1.
- `OPEN_FOCUS`: abre o bloco/ação atual.
- `COMPLETE_ACTION`: propõe conclusão de uma ação específica.
- `CLOSE_DAY`: abre formulário de fechamento.
- `RECYCLE`: abre decisão de continuidade.

## Registro

Token registry armazena:

- hash do token;
- workspace/contexto;
- comando e alvo;
- lifecycle mínimo requerido;
- criado/expira;
- revogado;
- usos permitidos;
- versão de destino ou estratégia relativa;
- política de autenticação.

## Resolvedores relativos

Devem ser funções separadas:

- `resolveTodayAction()`;
- `resolveNearestGate()`;
- `resolveActiveBlock()`;
- `resolveCurrentContext()`.

Nunca usar um resolvedor genérico ambíguo para comandos semanticamente diferentes.

## Fluxo mutável

1. GET `/q/{token}` abre aplicação.
2. Aplicação chama resolve.
3. Backend valida token e retorna descrição segura.
4. UI mostra alvo, ação e consequência.
5. Usuário confirma.
6. POST execute com `idempotency_key` e `expected_version`.
7. Backend valida plano ativo e alvo existente.
8. Evento é criado.
9. Resposta retorna snapshot atualizado.

## Regras

- token revogado/expirado não executa;
- plano superseded não aceita comando, salvo política explícita de re-resolução;
- comando duplicado retorna resultado original;
- VIEW_CONTEXT pode ser público somente por decisão de segurança explícita;
- nenhum QR alterna estado por GET.
