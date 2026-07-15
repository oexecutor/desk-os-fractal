# Especificação — Pipeline de ingestão

## Entradas MVP

| Tipo | MIME/extensão | Estratégia |
|---|---|---|
| Texto | `text/plain` | leitura UTF-8 |
| Markdown | `.md` | texto + estrutura de headings |
| JSON | `application/json` | parse + schema opcional |
| PDF textual | `application/pdf` | extração de texto e páginas |
| DOCX textual | `.docx` | extração de parágrafos/tabelas; macros nunca executadas |

## Etapas

1. validar tamanho e MIME real;
2. gerar `source_artifact_id`;
3. calcular checksum SHA-256;
4. extrair texto em ambiente controlado;
5. normalizar encoding e espaços;
6. preservar localizadores por página/seção;
7. detectar idioma;
8. produzir resumo de extração;
9. registrar lacunas de parsing;
10. solicitar consentimento antes de envio ao modelo;
11. criar `ingestion_job`.

## Saída comum

`ExtractedDocument` contém:

- metadados da fonte;
- blocos textuais com localizadores;
- tabelas como dados estruturados quando possível;
- avisos;
- checksum;
- política de retenção aplicada.

## Segurança

- conteúdo extraído é dado não confiável;
- instruções contidas no documento não substituem prompt do sistema;
- links não são seguidos automaticamente;
- macros e scripts não são executados;
- HTML é convertido em texto seguro;
- arquivos protegidos por senha retornam lacuna explícita.
