# Especificação — Recycle e reconfiguração

## Decisões

- `CONTINUE`: preservar estrutura e avançar.
- `REDUCE`: reduzir escopo/critério do próximo bloco.
- `SPLIT`: dividir ação ou bloco amplo.
- `RECONFIGURE`: propor nova estrutura.

## Regra

Recycle registra decisão no histórico. `REDUCE`, `SPLIT` e `RECONFIGURE` não alteram silenciosamente o plano ativo; geram uma proposta de nova versão para revisão e aprovação.

## Fechamento mínimo

- o que foi entregue;
- o que travou;
- o que vira próxima ação;
- decisão Recycle;
- evidências opcionais ou obrigatórias conforme política.
