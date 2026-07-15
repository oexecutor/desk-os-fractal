# Configuração recomendada do GitHub

## Identidade

- **Repository name:** `desk-os-fractal`
- **Visibility:** `Private`
- **Default branch:** `main`
- **Description:** use o conteúdo de `REPOSITORY_DESCRIPTION.txt`
- **Website:** deixar vazio até o primeiro deploy
- **Template repository:** desativado
- **Issues:** ativado
- **Projects:** ativado
- **Wiki:** desativado
- **Discussions:** desativado inicialmente

## Topics

`ai`, `project-management`, `neuroinclusive`, `productivity`, `pwa`,
`typescript`, `react`, `netlify`, `qr-code`, `event-sourcing`,
`fractal`, `physical-digital`.

## Merge

Ativar:

- squash merging;
- exclusão automática da branch após merge;
- histórico linear.

Desativar inicialmente:

- merge commits;
- auto-merge;
- rebase merging.

## Proteção de `main`

Criar ruleset com:

- bloquear force push e exclusão;
- exigir pull request;
- exigir conversas resolvidas;
- exigir branch atualizada;
- exigir histórico linear;
- exigir status checks quando os workflows existirem.

Checks planejados:

`lint`, `typecheck`, `test`, `contract-validation`, `build`, `netlify-build`.

## Segurança

Ativar quando disponível:

- Dependabot alerts;
- Dependabot security updates;
- Secret scanning;
- Push protection;
- Private vulnerability reporting.

Nunca versionar `.env`, tokens, chaves, credenciais da Netlify, chaves de LLM
ou dados reais de clientes.

## Netlify

Conectar somente depois da release validada.

- Production branch: `main`
- Build, publish e functions: definidos em `netlify.toml`
- Segredos: cadastrar no painel da Netlify
- Fluxo: branch → PR → testes → Deploy Preview → aprovação → merge → produção

## Acesso

No estágio inicial:

- Leonardo como administrador;
- GitHub App com menor privilégio;
- `Contents: Read and write`;
- `Workflows: Read and write` somente quando necessário;
- preferir token fine-grained restrito a este repositório.

## Licença

Recomendação: licença proprietária, `All Rights Reserved`.

O repositório não deve ser tornado público sem revisão jurídica e decisão
expressa sobre abertura do código.
