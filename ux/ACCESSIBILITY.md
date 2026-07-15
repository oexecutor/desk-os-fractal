# Acessibilidade

## Alvo

WCAG 2.2 AA.

## Requisitos

- todos os controles acessíveis por teclado;
- foco visível com contraste suficiente;
- headings em ordem;
- `aria-current` no breadcrumb;
- região `aria-live` para mudança de escala e sync;
- cards interativos implementados como botões/links;
- progress ring com valor textual e `aria-valuenow` quando apropriado;
- labels persistentes;
- contraste de texto normal ≥ 4.5:1;
- tamanho base de tela ≥ 16 px; metadados nunca abaixo de 12 px;
- redução de movimento respeita `prefers-reduced-motion`;
- impressão não depende somente de cor;
- scanner possui alternativa de colar código/link.

## Testes

- axe automatizado;
- navegação só por teclado;
- VoiceOver/NVDA smoke;
- zoom 200%;
- viewport 320 px;
- modo alto contraste quando disponível.
