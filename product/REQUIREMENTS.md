# Requisitos funcionais e não funcionais

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| FR-001 | Permitir criar e selecionar workspace. | MUST |
| FR-002 | Aceitar entrada por texto, Markdown, JSON, PDF textual e DOCX textual. | MUST |
| FR-003 | Exibir consentimento antes de enviar conteúdo a um modelo externo. | MUST |
| FR-004 | Extrair conteúdo e registrar metadados da fonte. | MUST |
| FR-005 | Classificar entrada como projeto único, portfólio ou indeterminada. | MUST |
| FR-006 | Separar fato, evidência, inferência, hipótese, contraevidência e lacuna. | MUST |
| FR-007 | Gerar árvore canônica recursiva com IDs estáveis. | MUST |
| FR-008 | Validar schema, unicidade, referências, ciclos e critérios de conclusão. | MUST |
| FR-009 | Permitir revisão e aprovação humana do plano. | MUST |
| FR-010 | Impedir execução e impressão operacional de plano não ativo. | MUST |
| FR-011 | Navegar por zoom entre portfólio, projeto, fase/bloco e ação. | MUST |
| FR-012 | Exibir modo foco com uma próxima ação dominante. | MUST |
| FR-013 | Suportar bloco padrão de três ações e um LINK calculado. | MUST |
| FR-014 | Registrar iniciar, concluir, reabrir e bloquear ação. | MUST |
| FR-015 | Registrar evidência separadamente do estado de conclusão. | MUST |
| FR-016 | Projetar sprint semanal sem duplicar fonte de verdade. | MUST |
| FR-017 | Gerar dashboard físico de duas faces em A4 paisagem. | MUST |
| FR-018 | Gerar QR de contexto para Face 1. | MUST |
| FR-019 | Gerar QR contextual/operacional para Face 2. | MUST |
| FR-020 | Exigir confirmação para comando QR mutável. | MUST |
| FR-021 | Garantir idempotência de comandos QR. | MUST |
| FR-022 | Processar deep link aberto pela câmera do sistema. | MUST |
| FR-023 | Sincronizar snapshot ao foco da aba e por polling configurável. | SHOULD |
| FR-024 | Funcionar offline para leitura do último estado e do snapshot impresso. | SHOULD |
| FR-025 | Oferecer decisão Recycle: continuar, reduzir, dividir ou reconfigurar. | MUST |
| FR-026 | Exportar árvore e estado em JSON versionado. | SHOULD |
| FR-027 | Empacotar via Capacitor após estabilização web. | COULD |

## Requisitos não funcionais

| ID | Requisito | Critério |
|---|---|---|
| NFR-001 | Segurança de fronteira | Toda entrada de API validada por schema e autorização aplicável. |
| NFR-002 | Integridade | Atualizações usam `expected_version` e `idempotency_key`. |
| NFR-003 | Acessibilidade | WCAG 2.2 AA como alvo; teclado completo; foco e anúncios de mudança. |
| NFR-004 | Responsividade | Sem rolagem horizontal em viewport de 320 px. |
| NFR-005 | Impressão | A4 paisagem, 297 × 210 mm, duas faces, escala 100%, sem corte. |
| NFR-006 | Performance | Primeira tela útil em até 3 s em conexão móvel razoável, excluindo processamento do agente. |
| NFR-007 | Observabilidade | Correlation ID, eventos de domínio e erros estruturados. |
| NFR-008 | Privacidade | Minimização, consentimento, retenção configurável e exclusão. |
| NFR-009 | Portabilidade | Domínio não depende de Netlify, React ou Capacitor. |
| NFR-010 | Reprodutibilidade | Lockfile versionado; builds determinísticos no CI. |
| NFR-011 | Baixa densidade | Uma decisão principal por tela/bloco; textos mínimos e hierarquia evidente. |
| NFR-012 | Resiliência | Falha remota não apaga estado local confirmado. |
