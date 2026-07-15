# Decision log

Use este arquivo para decisões menores que não justificam ADR. Decisões que alterem arquitetura, segurança, modelo de dados, lifecycle, QR ou formato físico exigem ADR.

| Data | Decisão | Motivo | Autor | Impacto |
|---|---|---|---|---|
| 2026-07-14 | Pacote inicial 1.0.0 | Consolidar contrato autossuficiente | Produto | Bootstrap |
| 2026-07-14 | Incorporado CR-001 / ADR-0017 (v1.1.0) | Papel físico corrigido para plano semanal estático A4 retrato dobrável; substitui geometria/paisagem de duas faces do v1.0.0 | Produto | Contrato de impressão e QR |
| 2026-07-14 | Execução local autorizada sem push/deploy | Construir aplicação integralmente e empacotar release Netlify em ZIP reprodutível | Usuário | Modo operacional desta sessão |
| 2026-07-15 | `VALIDATION_REPORT.md`/`CHECKSUMS.sha256` originais (auditoria do pacote de entrada, Fase 0) movidos para `docs/PACKAGE_AUDIT_*`; novos arquivos de mesmo nome na raiz passam a documentar a aplicação construída e testada | `NETLIFY_RELEASE_SPEC.md` exige esses nomes exatos na raiz do ZIP de release; preservar a auditoria original evita perder evidência da Fase 0 | Claude Code | Estrutura de entrega, sem perda de evidência |
| 2026-07-15 | `RELEASE_MANIFEST.json`/`CHECKSUMS.sha256` do build vão dentro do ZIP; o SHA-256 do próprio `.zip` fica em `release/<nome>.zip.sha256`, fora do ZIP | Um arquivo não pode conter o checksum de si mesmo (circular) | Claude Code | Empacotamento de release |
