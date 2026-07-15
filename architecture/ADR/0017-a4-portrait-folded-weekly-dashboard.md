# ADR-0017 — Dashboard semanal dobrável em A4 retrato

**Status:** Aceito  
**Supersede parcialmente:** ADR-0010

## Contexto

O objeto DESK-OS é produzido por uma única folha A4 retrato impressa em um lado e dobrada. As duas faces visíveis são faixas horizontais. A emissão ocorre uma vez por semana, portanto dados voláteis de progresso não pertencem ao papel.

## Decisão

Adotar o formato `A4_PORTRAIT_FOLDED_WEEKLY_V2`:

```text
A4 210 × 297 mm
┌────────────────────────────┐ 40 mm — área mecânica
├────────────────────────────┤
│ FACE 1 · 210 × 100 mm      │ visão/contrato semanal
├────────────────────────────┤ 40 mm — área mecânica
│                            │
├────────────────────────────┤
│ FACE 2 · 210 × 100 mm      │ execução semanal, rot. 180°
├────────────────────────────┤
│ aba mecânica · 17 mm       │
└────────────────────────────┘
```

O papel contém plano estático. O estado dinâmico é resolvido pelo mesmo QR semântico impresso nas duas faces.

## Consequências positivas

- uma única impressão por semana;
- continuidade física durante cinco dias;
- menor risco de informação obsoleta;
- objeto legível nos dois lados após a dobra;
- QR permanece válido mesmo quando a tarefa muda;
- renderer é determinístico e testável em milímetros.

## Consequências negativas

- área útil reduzida exige orçamento rígido de conteúdo;
- cinco dias e quinze ações precisam de títulos concisos;
- progresso digital não pode ser inferido visualmente pelo papel;
- qualquer mudança de geometria exige novo ADR e teste físico.

## Invariantes de domínio

- `face1.qr_token_id === face2.qr_token_id`;
- cada dia possui exatamente 3 ações e 1 síntese;
- a emissão deriva de uma versão de plano `ACTIVE`;
- nenhuma informação obrigatória cruza uma linha de dobra;
- áreas mecânicas não recebem conteúdo informacional.
