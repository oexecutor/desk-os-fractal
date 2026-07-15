# Arquitetura de segurança

## Princípios

- confiança zero em entrada de usuário, arquivo, modelo ou QR;
- validação de schema em toda fronteira;
- menor privilégio;
- confirmação explícita para mutações;
- segregação entre contexto e comando;
- conteúdo do usuário nunca é instrução de sistema;
- logs sem conteúdo integral sensível.

## Ameaças principais

| Ameaça | Controle |
|---|---|
| Prompt injection em documento | Isolar conteúdo como dados; prompts estruturados; sem ferramentas externas no decompositor. |
| Retorno inválido do modelo | Structured output + schema + invariantes + retry limitado. |
| QR adulterado | Token opaco aleatório, registry server-side, expiração/revogação, confirmação. |
| Repetição de comando | `idempotency_key` e registro de execução. |
| Ação em plano bloqueado | Verificação de lifecycle no domínio. |
| ID inexistente | Lookup obrigatório no grafo ativo. |
| Escrita concorrente | `expected_version`, conflito 409 e retry consciente. |
| XSS | Renderizar texto com APIs seguras; CSP; sanitização apenas quando HTML for indispensável. |
| Exposição de API key | Chaves somente no backend. |
| Enumeração de workspace | IDs aleatórios + autenticação/autorização; nunca segurança por obscuridade. |
| Upload malicioso | MIME real, limite, parser isolado, sem execução de macros. |

## Pilot mode

Enquanto não houver autenticação comercial, o piloto deve operar atrás de acesso controlado e não conter dados altamente sensíveis. `workspace_id` não substitui identidade.

## Headers mínimos

- Content-Security-Policy;
- X-Content-Type-Options: nosniff;
- Referrer-Policy;
- Permissions-Policy permitindo câmera somente nas rotas necessárias;
- frame-ancestors 'none' ou política explícita;
- HTTPS obrigatório.
