# Plano de testes de impressão v2

## Saída obrigatória

- Chromium headless e navegador real;
- `@page size: A4 portrait`;
- 210 × 297 mm;
- margem da página 0;
- exatamente uma página;
- impressão em um lado;
- escala 100%;
- nenhuma toolbar;
- Face 2 rotacionada 180°.

## Teste dimensional

Imprimir régua de calibração e medir:

- 40 mm superior;
- 100 mm Face 1;
- 40 mm central;
- 100 mm Face 2;
- 17 mm inferior.

Tolerância: ±0,5 mm. Reprovar se o driver aplicar “fit to page”.

## Teste de dobra

- dobrar no mockup físico aprovado;
- confirmar Face 1 legível para um lado;
- confirmar Face 2 legível para o lado oposto;
- confirmar ausência de informação essencial em áreas sobrepostas;
- confirmar safe margin mínimo de 5 mm.

## Casos de conteúdo

- projeto único;
- portfólio projetado para uma semana;
- títulos no limite máximo;
- 0, 1 e 3 riscos;
- caracteres acentuados;
- P&B: LINK, risco e ação distinguíveis por texto/borda;
- falha explícita em seis blocos;
- falha explícita com duas ou quatro ações em um dia;
- falha explícita em overflow.

## QR

- mesmo token nas duas faces;
- tamanho final mínimo 25 mm;
- quiet zone de quatro módulos;
- ECC M ou superior;
- decodificar a partir do papel em Android e iOS;
- testar luz normal, baixa luz e ângulo de 30°;
- GET não muta;
- re-resolução após conclusão abre o próximo alvo;
- token revogado/expirado mostra erro seguro.

## Evidências do gate

- PDF de uma página;
- fotografia da folha plana com régua;
- fotografias do objeto dobrado pelos dois lados;
- relatório de medição;
- vídeo curto de QR resolvendo dois alvos diferentes com o mesmo papel;
- resultado dos testes AT-030–AT-040.
