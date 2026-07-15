# ADR-0009 — Pipeline de ingestão por adapters

**Status:** Aceito

## Decisão

Cada formato possui extractor; todos produzem `ExtractedDocument` comum. O motor nunca recebe bytes brutos diretamente.

## Consequências

Permite novos formatos sem alterar decomposição e melhora segurança de parsing.
