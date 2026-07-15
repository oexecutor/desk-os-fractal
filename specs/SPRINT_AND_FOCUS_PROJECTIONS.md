# Especificação — Projeções de sprint e foco

## Sprint

A sprint é derivada, não armazenada como árvore paralela. Critérios de seleção:

- plano ativo;
- janela temporal;
- prioridade;
- dependências satisfeitas;
- capacidade configurada;
- resultado dominante.

## Semana padrão

Pode apresentar cinco dias, mas o domínio não presume que toda sprint tenha cinco dias. Cada dia/bloco pode referenciar um bloco operacional.

## Foco

Seleciona a próxima ação executável usando ordem determinística:

1. ação explicitamente focada pelo usuário;
2. ação `IN_PROGRESS` não bloqueada;
3. primeira ação `TODO` com dependências concluídas;
4. se nenhuma, mostrar bloqueio ou necessidade de reconfiguração.

O motor não alterna automaticamente entre projetos sem sinalização clara.

## LINK

O LINK aparece como entregável calculado. Seu status é derivado da regra de conclusão do bloco. Quando completo, o sistema solicita fechamento e Recycle.
