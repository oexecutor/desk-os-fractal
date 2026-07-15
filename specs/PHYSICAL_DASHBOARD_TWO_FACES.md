# STATUS: SUPERSEDED

Este documento foi substituído por:

- `architecture/ADR/0017-a4-portrait-folded-weekly-dashboard.md`
- `specs/PHYSICAL_DASHBOARD_FOLDED_WEEKLY.md`
- `specs/QR_SEMANTIC_CURRENT_ACTION.md`

Ele permanece somente como histórico do contrato v1.0.0 e não deve orientar a implementação.

---

# Especificação — Dashboard físico de duas faces

## Propósito

O artefato físico é um cockpit do estado atual. Ele não reproduz a navegação completa nem todos os dados do aplicativo.

## Formato

- A4 paisagem: 297 × 210 mm;
- duas páginas/faces;
- margem interna recomendada: 10 mm;
- impressão em 100%, sem ajuste;
- preferencialmente frente e verso;
- funcionamento offline após geração;
- HTML imprimível obrigatório; PDF opcional derivado;
- versão, snapshot timestamp e checksum no rodapé.

## Face 1 — Visão / Dashboard

Pergunta: **Onde estou e como o projeto está?**

### Conteúdo obrigatório

- identidade DESK-OS / TAL;
- usuário ou cliente;
- projeto ou portfólio ativo;
- trilha resumida `Portfólio › Projeto › Semana` ou equivalente;
- resultado dominante;
- progresso geral;
- estado resumido de projetos, fases ou workflows;
- entregáveis principais;
- até três alertas/bloqueios relevantes;
- QR de contexto que abre exatamente essa visão.

### Seleção para portfólio

Para preservar baixa densidade, mostrar no máximo cinco cards:

1. projeto ativo;
2. projetos bloqueados de maior prioridade;
3. próximos projetos priorizados;
4. completar com mais recentes;
5. se houver excedente, exibir `+N projetos`.

### Projeto único

Substituir cards de portfólio por visão macro de fases/workflows prioritários.

## Face 2 — Execução / Foco

Pergunta: **O que preciso fazer agora?**

### Conteúdo obrigatório

- projeto e dia/bloco ativos;
- resultado esperado;
- workflow/etapa ativa;
- exatamente três ações atômicas do bloco;
- LINK e regra de fechamento;
- próxima ação destacada;
- bloqueio atual;
- fechamento: entregue, travou, próxima ação;
- decisão Recycle: Continuar, Reduzir, Dividir, Reconfigurar;
- QR contextual para abrir, registrar, concluir ou reciclar via tela de confirmação.

## Identidade visual

```text
background       #f7f6f3
paper            #fffefb
surface          #ffffff
ink              #14140f
ink-soft         #5c5b52
line             #e3e1d8
line-strong      #c9c6b9
accent           #1f4b3f
accent-soft      #dce8e2
amber            #b3792c
amber-soft       #f3e6d2
clay             #a8492f
clay-soft        #f2dcd3
radius           3px
```

- sans-serif para conteúdo;
- monoespaçada para IDs, datas, escalas e estados;
- linhas finas;
- cards brancos;
- verde para progresso/ação;
- âmbar para LINK;
- terracota para bloqueio;
- baixa densidade e hierarquia clara.

## Componentes removidos

Não existem faces exclusivas para acesso, legenda, operação, montagem ou mapa técnico. QR e metadados são integrados; instruções de impressão ficam em rodapé mínimo.

## Budget de conteúdo

Renderer deve falhar com mensagem útil quando:

- resultado dominante exceder limite configurado;
- títulos causarem overflow;
- número de cards superar regra sem condensação;
- QR ficar menor que tamanho seguro;
- uma ação não tiver critério de conclusão;
- plano não estiver ativo.

Não cortar silenciosamente conteúdo com `.slice()`.

## QR

Face 1 usa token `VIEW_CONTEXT`. Face 2 usa `OPEN_FOCUS` ou comando contextual que sempre abre confirmação antes de mutar.
