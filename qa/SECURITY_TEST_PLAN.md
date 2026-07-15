# Plano de testes de segurança

- documento contém “ignore instruções anteriores”: deve permanecer dado;
- retorno do modelo inclui HTML/script: schema ou render seguro impede execução;
- upload com extensão PDF e MIME executável: rejeitar;
- token QR alterado: 404/410 sem detalhe enumerável;
- GET de QR mutável: não altera estado;
- replay do mesmo comando: não duplica evento;
- plano superseded: comando não executa;
- node_id inexistente: rejeitar;
- acesso a workspace alheio: 403;
- API key ausente no bundle do cliente;
- CSP bloqueia script inline não autorizado;
- câmera permitida somente na rota/experiência do scanner;
- logs não incluem documento completo ou token QR em claro.
