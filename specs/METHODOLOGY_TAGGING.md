# Especificação — Metodologias e padrões opcionais

O motor pode associar nós a vocabulários como PMBOK, ISO, métodos internos ou fases editoriais, mas esses rótulos não definem a árvore canônica.

## Regras

- metodologia é metadado/projeção, não cardinalidade fixa;
- cinco dias ou nove fases são templates opcionais;
- o usuário não precisa conhecer a metodologia para executar;
- o sistema deve mostrar o rótulo somente quando ajuda a orientação;
- mapeamentos inferidos precisam ser identificados como inferência;
- nenhuma conformidade normativa pode ser declarada sem validação específica.

Exemplo:

```json
{
  "metadata": {
    "methodology_tags": [
      {"scheme": "PMBOK", "label": "Execution", "classification": "INFERENCE"}
    ]
  }
}
```
