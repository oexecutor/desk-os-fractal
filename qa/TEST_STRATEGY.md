# Estratégia de testes

## Pirâmide

1. **Unitários:** domínio, IDs, progressão, LINK, resolvedores QR, seleção de print.
2. **Schema/contract:** todas as fixtures e fronteiras.
3. **Integração:** storage adapters, funções, event projector, LLM fake.
4. **E2E:** intake → revisão → ativação → foco → impressão → QR.
5. **Acessibilidade:** axe + teclado + leitor de tela smoke.
6. **Visual/print:** screenshots e PDF/HTML em A4 paisagem.
7. **Segurança:** upload, prompt injection, XSS, QR replay, autorização, conflito.

## Fixtures obrigatórias

- projeto único válido;
- portfólio válido;
- entrada insuficiente;
- plano bloqueado;
- ação sem critério;
- parent inexistente;
- ciclo;
- ID duplicado;
- QR expirado/revogado;
- conflito de versão;
- texto longo para overflow de impressão.

## Cobertura de risco

Cobertura numérica não substitui cenários. Packages de domínio, QR e projeção de impressão devem possuir cobertura de branches alta e mutation testing quando viável.
