# Observabilidade

## Logs estruturados

Campos mínimos:

- timestamp;
- level;
- correlation_id;
- workspace_id pseudonimizado;
- actor_id pseudonimizado;
- operation;
- duration_ms;
- result;
- error_code;
- model usage sem conteúdo sensível.

## Métricas

- ingestões por tipo e resultado;
- tempo de extração;
- tempo/custo de decomposição;
- taxa de saída inválida do modelo;
- taxa de aprovação;
- conflitos de versão;
- resolução/execução de QR;
- erros de impressão;
- uso offline.

## Auditoria

Eventos de aprovação, ativação, QR mutável, reconfiguração e exclusão devem possuir ator e timestamp do servidor.
