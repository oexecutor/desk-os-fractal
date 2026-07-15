# API

`openapi.yaml` é o contrato HTTP inicial. Referências apontam para schemas do pacote.

## Regras

- requests autenticados por padrão;
- resolução pública de QR retorna somente contexto mínimo e nunca muta por GET;
- comandos usam `expected_version` e `idempotency_key`;
- erros seguem `specs/API_ERROR_MODEL.md`;
- endpoints podem ser adaptados a funções serverless, mas sem alterar semântica.
