# language: pt
Funcionalidade: Emissão semanal dobrável em A4 retrato

  @AT-030
  Cenário: Gerar uma única folha A4 retrato
    Dado um plano ACTIVE com sprint semanal válido
    Quando o usuário cria a emissão física
    Então o formato é A4_PORTRAIT_FOLDED_WEEKLY_V2
    E a saída possui exatamente uma página A4 retrato
    E a impressão usa apenas um lado

  @AT-031
  Cenário: Respeitar a geometria física
    Quando o renderer cria a página
    Então as zonas verticais medem 40, 100, 40, 100 e 17 milímetros
    E a soma das zonas é 297 milímetros
    E a Face 2 está rotacionada em 180 graus
    E nenhum conteúdo obrigatório ocupa área mecânica

  @AT-032
  Cenário: Não imprimir estado volátil
    Quando a emissão é gerada
    Então ela não contém percentual concluído
    E não contém estado atual
    E não contém dia atual destacado
    E não contém ação atual impressa

  @AT-033
  Cenário: Imprimir contrato semanal estático
    Então a Face 1 contém resultado dominante e definição de concluído
    E contém exatamente cinco blocos semanais
    E informa 5 blocos, 15 ações e 5 LINKS planejados

  @AT-034
  Cenário: Imprimir execução de cinco dias
    Então a Face 2 contém SEG, TER, QUA, QUI e SEX nesta ordem
    E cada dia contém exatamente três ações
    E cada dia contém exatamente um LINK

  @AT-035
  Cenário: Reusar o mesmo QR nas duas faces
    Então face1.qr_token_id é igual a face2.qr_token_id
    E o token é do tipo OPEN_CURRENT_ACTION
    E a estratégia é CURRENT_ACTION

  @AT-036
  Cenário: QR resolve a ação corrente sem mudar o código impresso
    Dado o mesmo token semanal
    Quando a primeira ação é concluída no aplicativo
    E o QR é resolvido novamente
    Então o backend retorna a próxima ação elegível
    E o token impresso permanece igual

  @AT-037
  Cenário: QR avança para LINK e fechamento
    Dado um bloco com três ações concluídas
    Quando o QR é resolvido
    Então o alvo é o LINK do bloco
    Quando o LINK é concluído
    Então a próxima resolução abre o fechamento do dia

  @AT-038
  Cenário: GET não altera estado
    Quando o usuário abre /q/{token}
    Então nenhum evento de domínio mutável é criado
    E a interface solicita confirmação antes de qualquer POST

  @AT-039
  Cenário: Falhar em overflow
    Dado conteúdo acima do orçamento definido
    Quando o projection builder tenta emitir
    Então a emissão falha com erro de conteúdo identificável
    E nenhum texto é cortado silenciosamente

  @AT-040
  Cenário: QR continua legível após impressão
    Dado QR de pelo menos 25 milímetros com quiet zone
    Quando a folha é impressa em 100 por cento e escaneada
    Então o token é decodificado corretamente em três dispositivos de teste
