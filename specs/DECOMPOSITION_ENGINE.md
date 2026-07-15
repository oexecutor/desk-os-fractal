# Especificação — Motor de decomposição

## Objetivo

Converter `ExtractedDocument[]` e contexto do usuário em uma `PlanVersion` draft válida, rastreável e revisável.

## Pipeline lógico

```text
Classify → Extract facts → Identify gaps → Propose structure
→ Generate atomic actions → Generate synthesis nodes
→ Deterministic validation → Critique → Final draft
```

## Papéis

1. **Classifier:** projeto único, portfólio ou indeterminado.
2. **Context Extractor:** fatos, objetivos, restrições, datas, atores e fontes.
3. **Decomposer:** cria hierarquia e ações.
4. **Critic:** procura ambiguidade, sobrecarga, dependências e contraevidências.
5. **Normalizer:** devolve somente contrato canônico.
6. **Deterministic Validator:** código sem LLM que aplica schema e invariantes.

Os papéis podem usar o mesmo modelo, mas devem ter contratos e logs separados.

## Regras de conteúdo

- não inventar datas, donos ou entregáveis ausentes;
- marcar informação ausente como `LACUNA`;
- toda ação começa com verbo e produz saída verificável;
- ação atômica deve caber em um bloco de trabalho razoável; se ampla, dividir;
- separar objetivo, resultado e atividade;
- dependências devem referenciar IDs existentes;
- gerar no máximo a profundidade necessária para ação imediata;
- usar 3 ações por bloco operacional como padrão;
- LINK descreve o resultado composto das três ações;
- hierarquias superiores podem ter qualquer cardinalidade útil.

## Falhas

- JSON inválido: retry de structured output com limite;
- schema inválido: rejeitar e registrar erro;
- ciclo ou referência inválida: rejeitar;
- baixa confiança de classificação: pedir revisão em vez de adivinhar;
- entrada insuficiente: gerar relatório de lacunas, não plano artificial.

## Resultado

O motor nunca ativa o plano. Retorna `GENERATED` ou `BLOCKED` com validation report.
