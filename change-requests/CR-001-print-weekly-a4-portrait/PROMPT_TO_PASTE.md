Aplique o Change Request `CR-001 — Dashboard semanal dobrável em uma folha A4 retrato` antes do `/bootstrap`.

Leia nesta ordem:

1. `CLAUDE_CODE_RESPONSE.md`
2. `CHANGE_REQUEST.md`
3. `architecture/ADR/0017-a4-portrait-folded-weekly-dashboard.md`
4. `specs/PHYSICAL_DASHBOARD_FOLDED_WEEKLY.md`
5. `specs/QR_SEMANTIC_CURRENT_ACTION.md`
6. `MIGRATION_MAP.md`
7. schemas, fixture e testes anexos

Regras:

- preserve o histórico do ADR-0010 e marque-o como superseded;
- atualize todos os contratos afetados antes de escrever código de produto;
- valide schemas e fixtures;
- não use TypeScript 7.0 no bootstrap; use a última 6.0.x estável compatível;
- não tente `git push` novamente enquanto as permissões não forem corrigidas;
- mantenha `REMOTE_SYNC=PENDING` no relatório;
- depois da correção contratual, apresente o delta da auditoria e solicite a decisão para executar `/bootstrap`;
- não implemente o renderer antes da fase prevista;
- não trate o HTML de referência como fonte de dados ou componente de produção.

Decisão atual: **CORRIGIR**.
