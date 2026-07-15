# Especificação — Sincronização e offline

## Cache local

Armazenar:

- shell da aplicação;
- último snapshot válido;
- preferências não sensíveis;
- metadados de sync;
- print snapshots criados localmente, quando permitido.

## Atualização

- carregar remoto na inicialização;
- atualizar quando a aba ganha foco;
- polling padrão configurável, sugerido 15–30 s no piloto;
- backoff em falhas;
- indicador de estado: sincronizado, pendente, offline, conflito.

## Mutação

MVP prioriza escrita online. Se offline:

- consulta permanece disponível;
- UI pode registrar rascunho local de fechamento;
- conclusão que altera estado oficial deve aguardar conexão, salvo ADR futuro de fila offline.

## Service worker

Deve ser registrado explicitamente, versionado e testado. Manifest, ícones e caminhos de cache precisam existir. Atualização não pode prender o usuário em asset incompatível.
