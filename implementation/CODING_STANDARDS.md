# Padrões de código

- TypeScript `strict: true`.
- Funções de domínio puras sempre que possível.
- Erros tipados; não lançar strings.
- `unknown` em fronteiras; validar antes de usar.
- Não usar `any` sem justificativa registrada.
- IDs como branded types.
- Datas como ISO 8601 UTC na API; timezone somente na apresentação.
- Eventos imutáveis.
- Sem import profundo entre packages.
- Componentes de UI sem regra de negócio.
- Conteúdo de usuário renderizado como texto.
- Testes nomeiam comportamento, não implementação.
- Comentários explicam motivo, não repetem o código.
- Toda operação externa possui timeout, retry limitado e cancellation quando possível.
