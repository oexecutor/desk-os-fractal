# Schemas

Todos os schemas usam JSON Schema 2020-12 e versão de contrato `1.0.0`.

## Validação em duas camadas

1. **Schema:** tipos, campos, enums e estruturas.
2. **Invariantes de domínio:** ciclos, referências, profundidade, ordem entre irmãos, lifecycle, bloco 3+LINK e autorização para execução.

Não tente codificar todas as invariantes relacionais somente em JSON Schema.

## Compatibilidade

Mudança incompatível exige nova versão de schema e estratégia de migração. Campos experimentais ficam em `metadata` até estabilização; não transformar `metadata` em depósito de regras centrais.
