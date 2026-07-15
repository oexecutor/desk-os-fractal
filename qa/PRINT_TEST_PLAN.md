# Plano de testes de impressão

## Viewports e saída

- Chromium print em A4 landscape;
- 297 × 210 mm;
- margem CSS 0 na página e 10 mm no sheet;
- duas páginas exatas;
- escala 100%;
- sem barras/toolbar;
- QR com tamanho físico mínimo definido pelo renderer e quiet zone preservada.

## Casos

- projeto único;
- portfólio com 1, 5 e >5 projetos;
- título longo;
- três alertas;
- ausência de bloqueio;
- bloqueio longo;
- todos os estados de ação;
- P&B: estados continuam distinguíveis por texto/símbolo;
- QR decodificado depois de impressão e captura de câmera.
