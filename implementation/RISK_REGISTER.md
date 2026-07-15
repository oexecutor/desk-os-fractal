# Registro de riscos

| ID | Risco | Prob. | Impacto | Mitigação |
|---|---|---:|---:|---|
| R-001 | Modelo inventa estrutura | Alta | Alta | Schema, lacunas, critic, aprovação humana. |
| R-002 | Contratos divergem | Média | Alta | Schemas autoritativos e contract tests. |
| R-003 | QR executa alvo errado | Média | Crítica | Resolvers específicos, confirmação e target preview. |
| R-004 | QR quebra após mudança de domínio | Média | Alta | Router estável e token opaco. |
| R-005 | Conflito entre papel e digital | Média | Alta | Snapshot versionado/checksum e sync explícito. |
| R-006 | Layout impresso estoura | Alta | Média | Content budget e testes de impressão. |
| R-007 | Netlify Blobs limita escala | Média | Média | Storage adapter e plano de migração. |
| R-008 | `workspace_id` usado como auth | Média | Crítica | Security gate antes de usuários externos. |
| R-009 | Custos de LLM imprevisíveis | Média | Alta | Limites, métricas, cache e modelo configurável. |
| R-010 | Frontend começa antes do domínio | Alta | Alta | Gate 0 e CLAUDE.md. |
| R-011 | Offline gera conflitos | Média | Alta | Read-first; escrita offline fora do MVP. |
| R-012 | Claims clínicos indevidos | Baixa | Alta | ADR-0013 e revisão de conteúdo. |
