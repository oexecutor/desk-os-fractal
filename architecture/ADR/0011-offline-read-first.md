# ADR-0011 — Offline read-first

**Status:** Aceito

## Decisão

PWA armazena shell e último snapshot para leitura offline. Escritas offline complexas ficam fora do MVP; a UI informa claramente quando uma mutação exige conexão.

## Consequências

Reduz risco de conflito e ainda preserva consulta e papel offline.
