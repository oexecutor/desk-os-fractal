# Especificação — Ciclo de vida do plano

## Estados

- `GENERATED`: criado e validado tecnicamente.
- `IN_REVIEW`: aberto para revisão humana.
- `APPROVED`: aceito, aguardando ativação transacional.
- `ACTIVE`: fonte executável atual.
- `BLOCKED`: falha, risco ou lacuna impede aprovação.
- `REJECTED`: rejeitado pelo usuário.
- `SUPERSEDED`: substituído por versão ativa posterior.
- `COMPLETED`: resultados encerrados.
- `ARCHIVED`: somente histórico.

## Transições

```text
GENERATED → IN_REVIEW
GENERATED → BLOCKED
IN_REVIEW → APPROVED | REJECTED | BLOCKED
APPROVED → ACTIVE
ACTIVE → SUPERSEDED | COMPLETED | BLOCKED
```

## Ativação

Ativação deve ser atômica:

1. validar versão esperada;
2. validar que não há bloqueios críticos;
3. marcar versão anterior como `SUPERSEDED`;
4. ativar nova versão;
5. emitir `plan.activated`;
6. reconstruir projeções.

## Restrições

`GENERATED`, `IN_REVIEW`, `BLOCKED` e `REJECTED` não aceitam eventos de conclusão, impressão operacional ou QR mutável.
