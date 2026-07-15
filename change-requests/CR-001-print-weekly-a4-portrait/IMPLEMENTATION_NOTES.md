# Notas de implementação

## Componentes sugeridos

```text
WeeklyPrintProjectionBuilder
FoldedA4PortraitRenderer
FaceOneWeeklyContract
FaceTwoWeeklyExecution
SemanticQrBlock
PrintContentBudgetValidator
PrintGeometryValidator
CurrentActionResolver
```

## API interna sugerida

```ts
type BuildWeeklyPrintProjection = (
  plan: ActivePlanVersion,
  sprint: WeeklySprint,
  qrToken: QrTokenRecord,
) => Result<WeeklyFoldedPrintSnapshot, PrintProjectionError>;
```

O builder não recebe progresso como fonte de conteúdo. `state_version_at_emission` existe apenas para auditoria e não deve gerar percentuais ou destaques.

## Erros tipados

- `PLAN_NOT_ACTIVE`
- `INVALID_WEEK_STRUCTURE`
- `INVALID_ACTION_CARDINALITY`
- `MISSING_DONE_CRITERIA`
- `CONTENT_BUDGET_EXCEEDED`
- `QR_TOKEN_KIND_INVALID`
- `QR_TOKEN_SCOPE_MISMATCH`
- `PRINT_GEOMETRY_INVALID`
- `PRINT_OVERFLOW_DETECTED`

## CSS de impressão

- usar unidades `mm` para folha, zonas, safe areas e QR;
- evitar transformações que alterem o bounding box da página;
- aplicar `transform: rotate(180deg)` somente ao container interno da Face 2;
- incluir teste automatizado de `page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true })`;
- confirmar `pages.length === 1` por parser de PDF no teste.
