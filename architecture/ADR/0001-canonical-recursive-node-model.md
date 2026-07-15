# ADR-0001 — Modelo canônico recursivo de nós

**Status:** Aceito

## Contexto

Projeto único, portfólio, sprint e frontend usavam estruturas diferentes.

## Decisão

Adotar um grafo de nós recursivos com `id`, `parent_id`, `project_id`, `node_type`, `order`, `status`, regra de conclusão e metadados. Todas as telas são projeções desse grafo.

## Consequências

- elimina conversores com perda de informação;
- permite cardinalidade dinâmica;
- exige validação de ciclos, IDs e referências;
- a UI não pode guardar sua própria árvore paralela.
