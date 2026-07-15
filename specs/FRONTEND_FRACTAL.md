# Especificação — Frontend fractal

## Princípio

A interface apresenta uma escala de cada vez e mantém contexto por breadcrumb. Não existe uma árvore visual infinita na mesma tela.

## Primeira interação

A primeira tela é Intake, não a grade fractal. Após decomposição e aprovação, o usuário entra no navegador.

## Modos

### PortfolioView

Mostra projetos priorizados, progresso, estado e resultado dominante. Cardinalidade dinâmica; em baixa largura usa lista vertical.

### ProjectView

Mostra filhos relevantes do projeto: fases, workflows, semanas ou blocos, conforme a estrutura canônica.

### NodeView

Mostra filhos de qualquer nó. Layout é escolhido por quantidade e tipo, sem alterar o domínio.

### FocusView

Mostra somente contexto ativo, próxima ação, critério de conclusão, bloqueio e LINK do bloco.

## Componentes

- `FractalRoot`
- `NodeCollection`
- `NodeCard`
- `BreadcrumbTrail`
- `ProgressSummary`
- `FocusPanel`
- `ActionCard`
- `SynthesisCard`
- `ApprovalBanner`
- `SyncIndicator`
- `PrintPreview`
- `QrResolutionDialog`

## Regras de interação

- controles nativos `button`, `a`, `input` ou semântica equivalente;
- Enter/Espaço executam cards interativos;
- foco move para heading do novo nível;
- mudanças de contexto são anunciadas em região `aria-live`;
- breadcrumb atual possui `aria-current`;
- nenhum texto funcional abaixo de 12 px na tela;
- sem rolagem horizontal em mobile;
- uma ação visualmente dominante por tela;
- o usuário pode voltar sem perder posição/contexto.

## Layout dinâmico

- 1 item: hero card;
- 2–4: grid responsivo;
- 5–9: grid ou lista condensada;
- >9: agrupamento, filtro ou paginação; nunca cards ilegíveis.

## Segurança de renderização

Conteúdo do usuário é renderizado como texto. HTML rico só é permitido após sanitização centralizada e necessidade aprovada.
