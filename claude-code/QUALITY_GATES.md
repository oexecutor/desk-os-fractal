# Quality gates

## Gate de contrato

- schemas compilam;
- fixtures válidas passam;
- fixtures inválidas falham pelo motivo esperado;
- OpenAPI parseia;
- nenhuma referência quebrada.

## Gate de domínio

- ciclos e órfãos rejeitados;
- lifecycle testado;
- LINK calculado;
- plano não ativo bloqueado;
- replay idempotente;
- conflito de versão.

## Gate de UI

- teclado completo;
- axe sem violações críticas/sérias;
- 320 px sem rolagem horizontal;
- 200% zoom;
- uma ação dominante;
- sem `innerHTML` inseguro.

## Gate de impressão

- duas páginas exatas;
- A4 landscape;
- QR decodifica;
- P&B legível;
- sem truncamento silencioso;
- snapshot/checksum visíveis.
