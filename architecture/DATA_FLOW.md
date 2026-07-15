# Fluxos de dados

## Ingestão e plano

```text
Upload/text
  → SourceArtifact
  → ExtractedDocument
  → ClassifiedInput
  → DecompositionDraft
  → SchemaValidation
  → InvariantValidation
  → PlanVersion(GENERATED)
  → HumanReview
  → PlanVersion(ACTIVE)
```

## Execução

```text
User/QR command
  → Command validation
  → Authorization
  → Expected version check
  → Domain transition
  → Event append
  → Snapshot projection
  → UI/sync response
```

## Impressão

```text
Active plan + selected context + current snapshot
  → Print composer
  → Content budget validation
  → QR token creation
  → Immutable PrintSnapshot
  → HTML/PDF renderer
```

## Offline

```text
Remote snapshot
  → local cache
  → read-only offline navigation
  → queued safe commands (optional post-MVP)
  → reconnect reconciliation
```

No MVP, comandos mutáveis offline podem permanecer bloqueados para evitar conflitos silenciosos.
