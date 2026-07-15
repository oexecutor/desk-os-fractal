# Especificação — Modelo de domínio canônico

## Agregados

### Workspace

- `id`
- `name`
- `version`
- `settings`
- `root_node_ids`

### Project

- `id`
- `workspace_id`
- `title`
- `objective`
- `lifecycle_state`
- `active_plan_version_id`
- `root_node_id`

### PlanVersion

- versão imutável da estrutura gerada/revisada;
- possui estado de lifecycle;
- referencia fontes e relatório de validação;
- quando ativada, torna-se base das projeções.

### WorkNode

Campos normativos:

- `id`: estável;
- `workspace_id`;
- `project_id`;
- `plan_version_id`;
- `parent_id`: `null` somente para raiz permitida;
- `node_type`: `portfolio | project | phase | workflow | week | day | block | deliverable | action | synthesis`;
- `title`;
- `description`;
- `order`;
- `depth`;
- `status`;
- `completion_rule`;
- `done_criteria`;
- `owner`;
- `schedule`;
- `risk`;
- `source_refs`;
- `metadata`.

## Invariantes

1. Todo nó pertence a um workspace e a uma versão de plano.
2. Nós abaixo de projeto possuem `project_id`.
3. `parent_id` referencia nó da mesma versão e workspace.
4. Não existem ciclos.
5. `depth(parent) + 1 = depth(child)`.
6. `order` é único entre irmãos.
7. Toda ação possui ao menos um critério verificável.
8. Síntese não é concluída manualmente quando sua regra é calculada.
9. Plano não ativo não aceita eventos de execução.
10. Nós removidos por nova versão não invalidam eventos históricos da versão anterior.

## Cardinalidade

- Portfólio e projeto: dinâmica.
- Fases/workflows: dinâmica.
- Bloco operacional padrão: exatamente três ações filhas e uma síntese calculada.
- Reconfiguração pode gerar novos blocos, mas nunca altera silenciosamente versão ativa.

## Projeções

A árvore canônica não contém propriedades específicas de layout. Informações como coluna, card, grid e posição visual pertencem à projeção.
