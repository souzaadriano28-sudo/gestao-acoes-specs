## 1. Contratos e integrações

- [ ] 1.1 Congelar inventário dos endpoints mínimos de corretoras, ações e carteira e verificar contract tests antes/depois.
- [ ] 1.2 Definir categorias CVM compatíveis e validade do snapshot com orientação docente/produto e verificar decisão versionada com exemplos.
- [ ] 1.3 Isolar BrasilAPI, ViaCEP, CVM, busca/cotação e preço histórico em ports/adapters e verificar domínio testável sem rede.
- [ ] 1.4 Padronizar timeout, limite, cancelamento e erros not-found/unavailable/limited/invalid e verificar stubs 404/429/503/timeout.

## 2. Cadastro de corretora

- [x] 2.1 Implementar consulta de CNPJ com formato, duplicidade e BrasilAPI e verificar inválido, duplicado, ausente e empresa inativa.
- [x] 2.2 Implementar consulta CVM por CNPJ como gate ativo/categoria e verificar ausente, inativa, incompatível e inconclusiva.
- [x] 2.3 Rebaixar CNAEs 6612601/6612602/6431900 a verificação complementar e verificar que nenhum aprova cadastro sem CVM.
- [x] 2.4 Implementar sugestão não automática do CEP retornado e verificar escolhas “Usar este CEP” e digitação alternativa.
- [x] 2.5 Implementar consulta ViaCEP revisável e invalidação após alteração e verificar CEP inexistente/alterado.
- [x] 2.6 Implementar máquina consultar→validar→revisar→confirmar preservando POST `/api/corretoras` e verificar nenhuma persistência parcial.
- [x] 2.7 Bloquear novas operações após perda de autorização sem apagar histórico e verificar refresh regulatório em fixture.

## 3. Cadastro de ação

- [ ] 3.1 Implementar busca/autocomplete por ticker ou empresa em Brasil/EUA e verificar debounce, resultado e nenhum resultado.
- [ ] 3.2 Preencher ticker, bolsa, país, moeda e Mercado visível ao selecionar e verificar metadados dos dois mercados.
- [ ] 3.3 Implementar fallback manual ticker+mercado com consulta obrigatória e verificar regras canônicas/duplicidade.
- [ ] 3.4 Mostrar nome, mercado, moeda, cotação e horário antes de confirmar no POST `/api/acoes` e verificar resposta inválida bloqueante.
- [ ] 3.5 Implementar timeout/cancelamento/retry/duplo envio no ativo americano e verificar reprodução do 503 sem spinner infinito ou criação.

## 4. Operações corretas

- [ ] 4.1 Criar changesets para data, preço efetivo, moeda, total, idempotência e correção/estorno e verificar H2/PostgreSQL update/rollback.
- [ ] 4.2 Migrar operações atuais preservando preço/data/moeda e verificar reconciliação do preço médio e posição.
- [ ] 4.3 Estender `/api/carteira/comprar` e `/vender` com os novos campos e verificar ativo obrigatoriamente já cadastrado.
- [ ] 4.4 Implementar sugestão histórica separada e preço pago editável e verificar indisponibilidade sem valor inventado.
- [ ] 4.5 Calcular total/revisão antes do envio e verificar moeda, precisão e arredondamento com fixtures manuais.
- [ ] 4.6 Implementar idempotência/consulta de resultado e verificar clique duplo, retry idêntico, conflito e resultado desconhecido.
- [ ] 4.7 Implementar venda concorrente, correção e estorno auditável e verificar saldo não negativo, original preservado e replay.

## 5. Garantia e apresentação

- [ ] 5.1 Executar unitários de CNPJ, CEP, ticker, CVM, preço médio e erros e verificar todos os cenários de borda.
- [ ] 5.2 Executar integração com WireMock/fixtures para cinco provedores e verificar falhas sem rede real ou persistência parcial.
- [ ] 5.3 Executar E2E completo de corretora, ação brasileira/americana, compra e venda e verificar três integrações reais visíveis em ambiente de apresentação.
- [ ] 5.4 Executar testes de concorrência, idempotência, autorização horizontal e contratos mínimos e verificar pipeline verde.
- [ ] 5.5 Construir Docker com H2 testado separadamente e PostgreSQL no Compose e verificar três healthchecks e smoke dos endpoints preservados.
