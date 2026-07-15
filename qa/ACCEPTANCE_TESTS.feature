# language: pt
Funcionalidade: Construção e execução do DESK-OS / TAL de Fractal

  @AT-001
  Cenário: Aceitar um PDF textual válido
    Dado um workspace autorizado
    Quando o usuário envia um PDF textual dentro do limite
    Então uma ingestão é criada
    E o checksum da fonte é registrado
    E nenhuma macro ou script é executado

  @AT-005
  Cenário: Classificar um portfólio
    Dado uma entrada com múltiplos projetos independentes
    Quando a classificação termina
    Então o tipo é "portfolio"
    E a decisão possui referências de evidência

  @AT-008
  Cenário: Rejeitar árvore com ciclo
    Dado um resultado de modelo em que A é pai de B e B é pai de A
    Quando o validador determinístico executa
    Então o plano fica "BLOCKED"
    E nenhum plano ativo é criado

  @AT-011
  Cenário: Plano gerado não pode ser executado
    Dado um plano em estado "GENERATED"
    Quando o usuário tenta concluir uma ação
    Então a API retorna "PLAN_NOT_ACTIVE"

  @AT-014
  Cenário: Aprovar e ativar plano
    Dado um plano válido em revisão
    Quando o usuário aprova e ativa com versão esperada correta
    Então o plano fica "ACTIVE"
    E um evento "plan.activated" é registrado

  @AT-015
  Cenário: Navegar em projeto único
    Dado um projeto ativo com filhos
    Quando o usuário abre um nó
    Então a interface mostra somente a próxima escala
    E o breadcrumb preserva o caminho

  @AT-016
  Cenário: Navegar em portfólio com cardinalidade dinâmica
    Dado um portfólio com cinco projetos
    Quando a raiz é exibida
    Então os cinco projetos são acessíveis
    E o domínio não exige grade 3x3

  @AT-020
  Cenário: A interface funciona por teclado
    Dado o navegador fractal aberto
    Quando o usuário navega usando Tab, Enter e Espaço
    Então consegue abrir nós, voltar e operar ações
    E o foco é visível

  @AT-021
  Cenário: Completar ação com versionamento
    Dado uma ação ativa e stream na versão 4
    Quando o usuário conclui com expected_version 4
    Então um evento é anexado na versão 5
    E o snapshot retorna ação DONE

  @AT-022
  Cenário: Detectar conflito de versão
    Dado um stream na versão 5
    Quando chega comando com expected_version 4
    Então a API retorna 409 VERSION_CONFLICT
    E nenhum evento é anexado

  @AT-024
  Cenário: Evidência não é inferida
    Dado uma ação concluída sem evidência
    Então o estado mostra DONE
    E evidence_count é 0
    E a interface não afirma "evidência salva"

  @AT-027
  Cenário: Selecionar próxima ação
    Dado um bloco com uma ação concluída, uma em andamento e uma pendente
    Quando FocusView abre
    Então a ação em andamento é a próxima ação dominante

  @AT-030
  Cenário: Gerar duas faces
    Dado um plano ativo e um bloco operacional válido
    Quando o usuário cria um print snapshot
    Então o snapshot contém Face 1 e Face 2
    E o formato é A4_LANDSCAPE_TWO_FACE_V1

  @AT-031
  Cenário: Face 1 mostra visão seletiva
    Dado um portfólio com oito projetos
    Quando a Face 1 é composta
    Então no máximo cinco cards são mostrados
    E existe indicador de projetos excedentes

  @AT-033
  Cenário: Face 2 exige três ações
    Dado um bloco ativo sem exatamente três ações
    Quando o usuário tenta emitir
    Então a emissão é bloqueada com orientação de reconfiguração

  @AT-035
  Cenário: Impressão não corta conteúdo silenciosamente
    Dado um título que excede o budget
    Quando o renderer valida o layout
    Então informa overflow
    E não usa truncamento silencioso

  @AT-037
  Cenário: QR de contexto abre a mesma visão
    Dado um QR VIEW_CONTEXT válido
    Quando ele é escaneado
    Então a aplicação abre o contexto registrado
    E nenhuma mutação ocorre

  @AT-039
  Cenário: QR mutável exige confirmação
    Dado um QR COMPLETE_ACTION válido
    Quando ele é resolvido
    Então a UI mostra a ação e consequência
    E nenhuma conclusão ocorre antes da confirmação

  @AT-041
  Cenário: Comando QR é idempotente
    Dado um comando já executado com uma idempotency key
    Quando a mesma requisição é repetida
    Então o resultado original é retornado
    E não existe segundo evento de conclusão

  @AT-043
  Cenário: QR de hoje e QR de gate têm resolvedores diferentes
    Dado uma ação de hoje e um gate atrasado
    Quando resolveTodayAction é chamado
    Então retorna a ação de hoje
    Quando resolveNearestGate é chamado
    Então retorna o gate atrasado

  @AT-046
  Cenário: Ler último snapshot offline
    Dado que a PWA sincronizou anteriormente
    E a rede está indisponível
    Quando o usuário abre o app
    Então o último snapshot pode ser consultado
    E a UI indica modo offline

  @AT-051
  Esquema do Cenário: Decisão Recycle cria evento
    Dado um bloco fechado
    Quando o usuário escolhe <decisao>
    Então um evento recycle.decided é registrado com <decisao>

    Exemplos:
      | decisao     |
      | CONTINUE    |
      | REDUCE      |
      | SPLIT       |
      | RECONFIGURE |
