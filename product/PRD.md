# PRD — DESK-OS / TAL de Fractal

## 1. Resumo

DESK-OS / TAL de Fractal é um sistema de gestão e execução de projetos que transforma material bruto em uma estrutura progressiva de trabalho. O usuário arrasta um projeto ou portfólio; o sistema interpreta, decompõe, valida e apresenta o resultado em uma navegação fractal, um modo de foco e um dashboard físico de duas faces.

## 2. Problema

Projetos chegam em formatos densos, fragmentados ou ambíguos. Ferramentas tradicionais exigem que o usuário primeiro modele manualmente fases, tarefas, prioridades e estados. Isso aumenta carga operacional, dificulta decidir a próxima ação e separa o planejamento digital da execução cotidiana.

## 3. Proposta de valor

Converter um conjunto de informações em uma árvore rastreável e aprovada, mantendo o mesmo estado entre:

- visão de portfólio;
- visão de projeto;
- zoom fractal;
- sprint semanal;
- ação atual;
- dashboard físico;
- QR contextual.

## 4. Usuário primário

Solo worker, consultor ou profissional não desenvolvedor que administra um ou vários projetos e precisa reduzir o esforço de estruturar, priorizar e retomar o trabalho.

## 5. Jornada principal

1. Usuário cria ou abre workspace.
2. Arrasta arquivo, cola texto ou importa JSON.
3. Confirma consentimento de processamento.
4. Sistema extrai texto e metadados.
5. Sistema classifica entrada como projeto único ou portfólio.
6. Sistema apresenta fatos, lacunas e riscos detectados.
7. Motor gera árvore em estado `GENERATED`.
8. Validador determinístico verifica schema e invariantes.
9. Usuário revisa e aprova.
10. Plano passa a `ACTIVE`.
11. Frontend apresenta a árvore fractal.
12. Usuário entra no bloco ativo e executa uma ação por vez.
13. Eventos atualizam progresso e evidências.
14. Usuário emite o dashboard físico de duas faces.
15. QR abre o mesmo contexto ou inicia comando confirmado.
16. Ao fechar o dia, usuário escolhe continuar, reduzir, dividir ou reconfigurar.

## 6. Modos de raiz

### Projeto único

```text
Workspace → Projeto → Fases/Workflows → Blocos → Ações
```

### Portfólio

```text
Workspace → Portfólio → Projetos → Fases/Blocos → Ações
```

O frontend usa o mesmo componente recursivo; somente a raiz muda.

## 7. Resultado dominante

Todo projeto e sprint deve possuir um resultado dominante claro. Ele orienta a Face 1 e impede que o dashboard físico se torne uma lista extensa.

## 8. Regra do bloco operacional

- três ações atômicas executáveis;
- cada ação possui critério de conclusão;
- o LINK é síntese calculada, não ação manual;
- 3/3 concluídas fecha o LINK por padrão;
- exceções exigem regra explícita e devem ser visíveis.

## 9. Gate humano

Estados mínimos:

```text
GENERATED → IN_REVIEW → APPROVED → ACTIVE
                   ↘ REJECTED
GENERATED/IN_REVIEW → BLOCKED
```

Somente `ACTIVE` pode:

- criar sprint executável;
- aceitar conclusão de ações;
- emitir dashboard físico operacional;
- gerar QR mutável.

## 10. Emissão física

### Face 1 — Visão / Dashboard

Responde: **Onde estou e como o projeto está?**

Inclui identidade, usuário/cliente, contexto ativo, trilha, resultado dominante, progresso, estado de projetos/fases, entregáveis, alertas e QR de contexto.

### Face 2 — Execução / Foco

Responde: **O que preciso fazer agora?**

Inclui bloco ativo, três ações, LINK, próxima ação, bloqueio, fechamento do dia, decisão de continuidade e QR contextual.

## 11. Métricas de sucesso do MVP

- percentual de entradas que geram árvore válida sem correção técnica;
- tempo entre upload e plano revisável;
- percentual de planos aprovados pelo usuário;
- percentual de sessões que chegam a uma próxima ação explícita;
- taxa de comandos QR resolvidos sem ambiguidade;
- consistência entre estado digital e snapshot físico;
- taxa de blocos fechados com evidência ou registro de encerramento.

## 12. Fora do escopo do MVP

- OCR manuscrito;
- edição colaborativa em tempo real;
- marketplace de agentes;
- automações externas irreversíveis;
- execução autônoma de tarefas por terceiros;
- claims clínicos ou terapêuticos;
- personalização visual ilimitada;
- planejamento financeiro ou jurídico automatizado sem revisão humana.
