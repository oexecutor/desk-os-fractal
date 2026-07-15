# Especificação da release para Netlify

## Princípio

A release final deve ser um projeto autocontido, reproduzível pelo lockfile e configurado por `netlify.toml`.

## Estrutura esperada

```text
/
├── apps/
│   ├── web/
│   └── functions/
├── packages/
├── tests/
├── schemas/
├── fixtures/
├── docs/
├── netlify/
│   └── functions/        # quando este for o diretório escolhido
├── dist/                 # ou publish directory equivalente
├── netlify.toml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── .env.example
├── DEPLOY_NETLIFY.md
├── VALIDATION_REPORT.md
├── RELEASE_MANIFEST.json
└── CHECKSUMS.sha256
```

## Configuração obrigatória

- build command explícito;
- publish directory explícito;
- functions directory explícito;
- SPA fallback;
- API routing;
- headers de segurança;
- Permissions-Policy compatível com câmera do scanner;
- Node 24 declarado;
- ambiente local mockável;
- nenhuma chave no cliente.

## Modos de deploy documentados

1. Netlify CLI, que suporta build e deploy manual, incluindo Functions.
2. Integração Git, em que o Netlify executa build e detecta as Functions.

O Claude Code prepara os arquivos, mas não executa deploy.
