# ADR-0014 — Identificadores estáveis gerados pelo sistema

**Status:** Aceito

## Decisão

Usar UUIDv7 ou ULID monotônico. IDs não podem ser formados por data, índice, título ou saída do modelo. IDs de modelo são tratados apenas como aliases temporários.

## Consequências

Importação exige remapeamento explícito, mas evita colisões e quebra de QR.
