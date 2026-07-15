# Contrato de execução local e entrega Netlify

## Objetivo

O Claude Code deve construir o produto integralmente no ambiente local e entregar uma release reproduzível em ZIP. Não deve publicar nem sincronizar o repositório remoto.

## Estado de autorização

| Ação | Autorização |
|---|---|
| Ler e alterar arquivos locais | Autorizado |
| Instalar dependências locais | Autorizado |
| Executar testes e builds | Autorizado |
| Criar commits locais | Autorizado |
| Gerar ZIP e checksums | Autorizado |
| Fazer git push | Não autorizado nesta execução |
| Criar PR | Não autorizado |
| Fazer deploy no Netlify | Não autorizado |
| Alterar serviço externo | Não autorizado |

## Saída contratada

`release/desk-os-netlify-release-v1.1.0.zip`

O ZIP deve ser fonte + build + configuração Netlify, sem segredos e sem `node_modules`.

## Nota sobre Netlify

Como a aplicação usa Functions, a release deve ser implantada preferencialmente por Netlify CLI ou integração Git. Um upload estático por drag-and-drop não representa o backend completo.
