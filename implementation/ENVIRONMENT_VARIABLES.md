# Variáveis de ambiente

```dotenv
APP_ENV=local
PUBLIC_APP_BASE_URL=http://localhost:5173
QR_BASE_URL=http://localhost:8888
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=
LLM_MODEL=
MAX_UPLOAD_MB=20
STORAGE_ADAPTER=memory
NETLIFY_BLOBS_SITE_ID=
NETLIFY_BLOBS_TOKEN=
POLL_INTERVAL_MS=20000
LOG_LEVEL=info
```

## Regras

- segredos nunca usam prefixo público;
- `.env.example` não contém valores reais;
- produção valida todas as variáveis na inicialização;
- modelo não é hardcodado; configuração registra a escolha;
- `QR_BASE_URL` deve ser estável antes de imprimir QRs permanentes.
