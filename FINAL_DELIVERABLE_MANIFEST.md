# Manifesto de entrega exigido do Claude Code

## Artefato principal

- `release/desk-os-netlify-release-v1.1.0.zip`

## Dentro do ZIP

- código-fonte;
- build estático;
- Functions;
- contratos e schemas usados em runtime;
- fixtures de demonstração;
- documentação de deploy;
- relatório de validação;
- manifesto de versões;
- checksums;
- `.env.example`;
- lockfile.

## Evidências mínimas

- versão de Node, pnpm e TypeScript;
- saída resumida de lint/typecheck/test/build;
- resultado do `netlify build`;
- teste de integridade do ZIP;
- SHA-256 do ZIP;
- teste A4 retrato;
- teste do QR semântico;
- teste de plano bloqueado;
- teste de projeto único e portfólio.

## Proibições no ZIP

- segredos;
- `.env`;
- `.git`;
- `node_modules`;
- caches;
- artefatos do sistema operacional;
- logs com conteúdo sensível.
