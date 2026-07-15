# Especificação — Dashboard físico semanal dobrável

## 1. Propósito

O artefato físico é um cockpit semanal de planejamento e execução. Ele não replica a interface digital e não exibe estado volátil.

```text
PAPEL = contrato semanal estático
QR    = ponte semântica estável
APP   = fonte de verdade dinâmica
```

## 2. Geometria normativa

| Propriedade | Valor |
|---|---:|
| mídia | A4 retrato |
| largura | 210 mm |
| altura | 297 mm |
| lados impressos | 1 |
| escala | 100% |
| zona mecânica superior | 40 mm |
| Face 1 | 210 × 100 mm |
| zona mecânica central | 40 mm |
| Face 2 | 210 × 100 mm |
| aba mecânica inferior | 17 mm |
| rotação Face 1 | 0° |
| rotação Face 2 | 180° |
| safe area por face | 5 mm mínimo |
| gutter recomendado | 3 mm |
| raio | 3 px equivalente CSS |

Tolerância de teste geométrico: ±0,5 mm após impressão em 100%.

## 3. Face 1 — Visão / contrato semanal

### Pergunta

**O que esta semana precisa produzir?**

### Ordem de atenção

1. resultado dominante;
2. definição de concluído;
3. mapa dos cinco blocos;
4. contrato quantitativo;
5. risco/dependência de planejamento;
6. QR.

### Conteúdo obrigatório

- marca DESK-OS/TAL;
- usuário ou cliente;
- projeto/portfólio;
- sprint e intervalo de datas;
- resultado dominante;
- definition of done da semana;
- cinco blocos resumidos;
- contagem planejada de 5 blocos, 15 ações e 5 LINKS;
- até três riscos/dependências conhecidos;
- QR `OPEN_CURRENT_ACTION`;
- versão, timestamp de emissão e checksum.

### Proibições

Não renderizar:

- porcentagem concluída;
- contagem concluída;
- status atual;
- dia atual;
- ação atual;
- destaques que dependam de execução posterior à emissão.

## 4. Face 2 — Execução semanal

### Pergunta

**O que está previsto para cada dia?**

### Estrutura fixa

Cinco linhas ordenadas SEG–SEX. Cada linha contém:

- rótulo do dia;
- título do bloco/resultado;
- exatamente três ações atômicas;
- um LINK/entregável-síntese;
- checkboxes manuais.

### Coluna de apoio

- QR igual ao da Face 1;
- Recycle: Continuar, Reduzir, Dividir, Reconfigurar;
- campos: entrega principal, bloqueio e próxima ação.

## 5. Orçamento de conteúdo

| Campo | Limite de renderização |
|---|---:|
| resultado dominante | 110 caracteres |
| definition of done | 150 caracteres |
| título de bloco | 42 caracteres |
| título de ação | 38 caracteres |
| título de LINK | 48 caracteres |
| risco | 120 caracteres |
| projetos exibidos na Face 1 | máximo 5 blocos semanais |

O modelo canônico pode guardar textos maiores. O projection builder deve criar rótulos de impressão e registrar a origem. Não usar truncamento silencioso com reticências.

## 6. QR

- mesmo token nas duas faces;
- tamanho mínimo final 25 mm;
- quiet zone mínima de 4 módulos;
- correção de erro M ou superior;
- URL pública `https://<QR_BASE_URL>/q/{opaqueToken}`;
- não imprimir payload interno;
- não fixar `node_id` de ação no token semanal;
- GET apenas resolve e abre confirmação;
- mutações somente após POST confirmado.

## 7. Identidade visual

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
amber-soft        #f3e6d2
clay             #a8492f
clay-soft         #f2dcd3
```

Sans-serif para conteúdo; monoespaçada para IDs, datas e metadados. LINK usa âmbar. Riscos usam terracota. Nenhuma informação depende apenas da cor.

## 8. Renderer

O renderer deve:

- produzir HTML autossuficiente e offline;
- gerar exatamente uma página;
- usar CSS em mm para geometria;
- incorporar QR como SVG ou PNG local;
- ocultar toolbar em impressão;
- expor modo de guias apenas em tela;
- rejeitar plano não ativo;
- rejeitar quantidade diferente de cinco blocos no template semanal padrão;
- rejeitar bloco sem exatamente três ações;
- rejeitar ação sem `done_criteria` no domínio;
- detectar overflow antes de liberar impressão;
- manter checksum determinístico do payload normalizado.

## 9. Critério cognitivo

- Face 1: compreender o resultado semanal em até 5 segundos.
- Face 2: localizar o dia e suas três ações em até 5 segundos.
- QR: retomar o estado digital com um escaneamento.
