# Premissas e lacunas controladas

## Premissas aprovadas para o bootstrap

- O MVP atende inicialmente um usuário por workspace, mas o domínio não deve impedir múltiplos membros no futuro.
- Arquivos iniciais suportados: texto, Markdown, JSON, PDF textual e DOCX textual.
- OCR de imagens e manuscritos não pertence ao MVP.
- O agente de decomposição pode ser implementado como papéis separados usando o mesmo provedor/modelo.
- A primeira persistência de produção pode usar Netlify Blobs por adapter.
- O domínio definitivo não depende de Netlify, React ou Capacitor.
- O bloco operacional padrão contém três ações atômicas e um LINK calculado.
- O frontend pode mostrar cardinalidades variadas em portfólio, projeto e fases.
- A emissão física é A4 paisagem, duas páginas/faces, escala 100%.

## Lacunas que exigem decisão antes de comercialização

- Provedor de autenticação.
- Política comercial de retenção de arquivos originais.
- Domínio definitivo do QR router.
- Política de expiração e revogação de tokens de QR.
- Limites de upload por plano comercial.
- Modelo e provedor de LLM em produção.
- Região de processamento e requisitos contratuais de privacidade.
- Necessidade de colaboração multiusuário em tempo real.
- Política de backup e recuperação.
- Licença final do código.

## Regra

Nenhuma lacuna pode ser preenchida silenciosamente. Toda decisão deve gerar ADR ou atualização explícita deste arquivo.
