# Jornadas do usuário

## J1 — Criar plano a partir de arquivo

1. Usuário acessa Intake.
2. Arrasta um arquivo.
3. Sistema valida formato e tamanho.
4. Usuário aceita processamento.
5. Extração mostra resumo e possíveis lacunas.
6. Usuário inicia decomposição.
7. Sistema mostra progresso por etapas, sem inventar percentual de modelo.
8. Plano gerado abre em revisão.
9. Usuário corrige, rejeita ou aprova.
10. Plano aprovado torna-se ativo.

## J2 — Navegar em projeto único

1. Raiz mostra visão macro do projeto.
2. Clique/teclado entra em uma fase ou workflow.
3. Breadcrumb preserva contexto.
4. Novo zoom apresenta somente filhos relevantes.
5. Usuário entra no bloco ativo.
6. Modo foco destaca a próxima ação.

## J3 — Navegar em portfólio

1. Raiz mostra projetos priorizados.
2. Usuário escolhe projeto.
3. Visão interna mostra fase, semana ou bloco conforme projeção ativa.
4. A mesma árvore e os mesmos eventos alimentam o progresso agregado.

## J4 — Executar e fechar bloco

1. Usuário inicia a ação atual.
2. Conclui e opcionalmente adiciona evidência.
3. Próxima ação assume foco.
4. Ao completar 3/3, LINK fecha automaticamente.
5. Usuário registra entrega, bloqueio e próxima ação.
6. Escolhe decisão Recycle.
7. Sistema cria evento e, quando necessário, uma proposta de reconfiguração para aprovação.

## J5 — Emitir dashboard físico

1. Usuário escolhe projeto/portfólio, semana e bloco ativo.
2. Sistema valida que o plano está ativo.
3. Preview mostra Face 1 e Face 2.
4. Sistema alerta sobre conteúdo excedente ou QR inválido.
5. Usuário gera snapshot imutável com versão e checksum.
6. Imprime em A4 paisagem, 100%, preferencialmente frente e verso.

## J6 — Usar QR

1. Usuário escaneia com câmera do sistema ou scanner interno.
2. Router resolve token sem revelar payload sensível.
3. Visualização abre diretamente no contexto.
4. Para mutação, sistema mostra ação exata, alvo e consequência.
5. Usuário confirma.
6. Backend valida autenticação, estado ativo, versão e idempotência.
7. Evento é registrado e UI sincroniza.
