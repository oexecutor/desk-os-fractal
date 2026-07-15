# Especificação — Estado e eventos

## Estratégia

- comandos expressam intenção;
- domínio valida e gera eventos;
- eventos são append-only;
- snapshot materializado acelera leitura;
- versão do stream aumenta monotonamente.

## Eventos mínimos

- `plan.generated`
- `plan.review_started`
- `plan.approved`
- `plan.activated`
- `node.focused`
- `action.started`
- `action.completed`
- `action.reopened`
- `action.blocked`
- `action.unblocked`
- `evidence.added`
- `synthesis.completed`
- `day.closed`
- `recycle.decided`
- `plan.reconfiguration_requested`
- `qr.command_resolved`
- `qr.command_executed`
- `print.snapshot_created`

## Progresso

Conclusão e evidência são estados distintos:

```text
action status = TODO | IN_PROGRESS | BLOCKED | DONE
has_evidence = true | false
```

A política pode exigir evidência para certos tipos de ação, mas não deve fingir que qualquer conclusão possui evidência.

## Concorrência

Comando inclui `expected_version`. Se versão atual divergir, retornar conflito com snapshot atual. Não usar last-write-wins silencioso.

## Idempotência

`idempotency_key` único por comando lógico. Repetição retorna o resultado original sem duplicar evento.
