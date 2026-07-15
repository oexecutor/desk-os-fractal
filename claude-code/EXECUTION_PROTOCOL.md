# Protocolo de execução no Claude Code

## Para cada tarefa

1. citar task ID do backlog;
2. listar arquivos afetados;
3. escrever teste falhando;
4. implementar mínimo necessário;
5. rodar testes locais relevantes;
6. rodar lint e typecheck;
7. atualizar documentação quando contrato mudar;
8. registrar riscos ou lacunas;
9. apresentar diff resumido e evidências.

## Gates

Quando o roadmap indicar GATE HUMANO, não iniciar fase seguinte. Entregar:

- resumo do que funciona;
- comandos executados;
- testes e resultados;
- decisões tomadas;
- débitos conhecidos;
- demonstração reproduzível;
- decisão solicitada: AVANÇAR, CORRIGIR, PAUSAR ou ENCERRAR.

## Escopo por sessão

Preferir uma tarefa vertical pequena. Não combinar refatoração ampla, mudança de contrato e UI na mesma sessão.
