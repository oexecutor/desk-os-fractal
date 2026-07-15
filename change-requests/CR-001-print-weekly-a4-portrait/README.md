# DESK-OS / TAL de Fractal — Print Amendment v1.1.0

Este pacote é um **Change Request normativo** para ser aplicado sobre o pacote v1.0.0 já auditado pelo Claude Code.

## Decisão de mudança

O contrato anterior `A4_LANDSCAPE_TWO_FACE_V1` está superseded para o artefato físico dobrável.

A implementação correta é:

- uma única folha A4 em retrato, 210 × 297 mm;
- impressão em um único lado;
- duas áreas úteis horizontais de 210 × 100 mm;
- Face 2 rotacionada 180° no arquivo;
- zonas mecânicas sem conteúdo: 40 mm no topo, 40 mm entre as faces e 17 mm no rodapé;
- conteúdo estático para toda a semana;
- nenhuma porcentagem, estado atual ou ação atual impressa;
- um mesmo QR semântico nas duas faces, resolvendo dinamicamente a ação aberta no aplicativo.

## Como aplicar

1. Copiar esta pasta para `changes/CR-001-print-weekly-folded-a4/` no repositório.
2. Entregar `CLAUDE_CODE_RESPONSE.md` ao Claude Code.
3. Executar o comando descrito em `.claude/commands/06-print-two-faces.md`.
4. Atualizar documentos e contratos afetados conforme `MIGRATION_MAP.md`.
5. Rodar validação de schemas e fixtures.
6. Somente depois alterar a decisão de `CORRIGIR` para `AVANÇAR` e executar `/bootstrap`.

## Hierarquia normativa

1. `CHANGE_REQUEST.md`
2. `architecture/ADR/0017-a4-portrait-folded-weekly-dashboard.md`
3. `specs/PHYSICAL_DASHBOARD_FOLDED_WEEKLY.md`
4. `specs/QR_SEMANTIC_CURRENT_ACTION.md`
5. schemas e testes deste pacote
6. HTML aprovado apenas como referência visual e geométrica

O HTML não autoriza hardcode de dados de demonstração na aplicação.
