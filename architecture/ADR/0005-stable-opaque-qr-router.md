# ADR-0005 — QR router estável com token opaco

**Status:** Aceito

## Decisão

Todo QR impresso usa `https://<qr-base>/q/{opaqueToken}`. O token é aleatório e mapeado server-side para contexto/comando. URLs nunca são derivadas de `location.href`.

## Consequências

Domínio e destino podem mudar sem reimprimir; exige registry, expiração, revogação e disponibilidade do router.
