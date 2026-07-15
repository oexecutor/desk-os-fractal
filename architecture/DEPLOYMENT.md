# Implantação

## Piloto

- frontend PWA publicado como assets estáticos;
- API em funções serverless;
- adapter Netlify Blobs para snapshots, eventos e token registry;
- assets QR locais, sem CDN obrigatória;
- domínio estável para `/q/{token}`;
- ambientes `local`, `preview`, `production`.

## Separação de dados

```text
workspaces/{workspaceId}/plans/{planId}/versions/{version}
workspaces/{workspaceId}/events/{streamId}/{eventId}
workspaces/{workspaceId}/snapshots/current
qr-tokens/{tokenHash}
print-snapshots/{snapshotId}
ingestions/{ingestionId}
```

O layout exato depende do adapter, mas a interface de storage não pode expor conceitos específicos do provedor ao domínio.

## CI/CD

1. install com lockfile;
2. lint;
3. typecheck;
4. unit tests;
5. schema validation;
6. contract tests;
7. build;
8. Playwright smoke;
9. accessibility smoke;
10. print regression;
11. preview deploy;
12. aprovação para produção.
