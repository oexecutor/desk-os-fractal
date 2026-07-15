# CR-001 — Dashboard semanal dobrável em uma folha A4 retrato

**Status:** Aprovado para incorporação contratual  
**Versão:** 1.1.0  
**Substitui:** partes de ADR-0010, `PHYSICAL_DASHBOARD_TWO_FACES.md`, `print-snapshot.schema.json`, fixture de impressão, AT-030+ e plano de testes de impressão.

## Problema

O contrato v1.0.0 descreve duas páginas A4 paisagem com conteúdo de estado atual. O objeto físico validado é uma única folha A4 retrato dobrada. A impressão ocorre uma vez por semana; portanto, progresso e foco atuais ficariam obsoletos.

## Decisão

O papel é um **plano semanal físico estático**. O aplicativo permanece como fonte de verdade dinâmica. O QR é a ponte semântica entre ambos.

## Requisitos invariantes

1. `@page size: A4 portrait; margin: 0`.
2. Uma única página impressa, um único lado.
3. Dimensão nominal: `210 × 297 mm`.
4. Zonas verticais, na ordem:
   - área mecânica superior: `40 mm`;
   - Face 1: `100 mm`;
   - área mecânica central: `40 mm`;
   - Face 2: `100 mm`;
   - aba mecânica inferior: `17 mm`.
5. Face 2 rotacionada `180deg` no arquivo.
6. Margem segura interna das faces: mínimo `5 mm`.
7. Nenhum conteúdo necessário em áreas mecânicas.
8. Conteúdo impresso não depende do progresso posterior à emissão.
9. O mesmo `qr_token_id` deve ser usado nas duas faces.
10. QR mínimo impresso: `25 × 25 mm`, quiet zone preservada, correção M ou superior.
11. O QR não pode conter IDs legíveis nem ação fixa.
12. GET de QR nunca altera estado.
13. Plano precisa estar `ACTIVE` para emissão.
14. Renderer deve falhar em overflow; nunca cortar silenciosamente.
15. Impressão em 100%, sem “ajustar à página”.

## Face 1 — Visão e contrato semanal

Pergunta: **O que esta semana precisa produzir?**

Obrigatório:

- identidade;
- usuário/cliente;
- projeto ou portfólio;
- semana/sprint;
- resultado dominante;
- definição de concluído;
- contrato: número de blocos, ações e LINKS;
- mapa dos cinco blocos semanais;
- riscos/dependências conhecidos no planejamento;
- QR semântico;
- versão, data da emissão e checksum.

Proibido:

- percentual concluído;
- “estado atual”;
- projeto “ativo agora”;
- dia atual destacado;
- ação atual impressa.

## Face 2 — Execução semanal

Pergunta: **O que está previsto para cada dia?**

Obrigatório:

- cinco linhas: SEG–SEX;
- um bloco/resultado por dia;
- exatamente três ações por bloco;
- um LINK/entregável-síntese por bloco;
- checkboxes para marcação manual;
- Recycle: Continuar, Reduzir, Dividir, Reconfigurar;
- fechamento semanal: entrega principal, bloqueio e próxima ação;
- mesmo QR da Face 1.

## QR semântico

`kind = OPEN_CURRENT_ACTION`  
`target.strategy = CURRENT_ACTION`

Ordem de resolução:

1. ação `IN_PROGRESS` do bloco aberto;
2. primeira ação `TODO` elegível por ordem e dependências;
3. LINK do bloco quando as três ações estiverem concluídas;
4. fechamento do dia quando o LINK estiver concluído;
5. primeira ação elegível do próximo bloco;
6. Recycle quando todos os blocos estiverem fechados.

## Fora do escopo deste CR

- autenticação de produção;
- definição do domínio final do QR;
- OCR do papel;
- atualização visual em tempo real;
- impressão frente e verso;
- alteração da geometria física sem novo ADR.
