# Aceite da release Netlify

A release é aceita quando:

- [ ] instalação por lockfile funciona em Node 24;
- [ ] `pnpm validate` passa;
- [ ] `pnpm test` passa;
- [ ] `pnpm build` passa;
- [ ] `netlify build` passa;
- [ ] diretório de publicação existe e contém o app;
- [ ] Functions são detectadas;
- [ ] nenhum segredo está no bundle;
- [ ] SPA fallback funciona;
- [ ] API routes funcionam localmente via Netlify Dev;
- [ ] câmera não está bloqueada por Permissions-Policy;
- [ ] service worker é registrado;
- [ ] impressão gera uma página A4 retrato;
- [ ] Face 2 está a 180°;
- [ ] QR tem no mínimo 25 mm;
- [ ] GET do QR não muta estado;
- [ ] ZIP passa em `unzip -t`;
- [ ] SHA-256 é registrado.
