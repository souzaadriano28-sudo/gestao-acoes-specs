## 1. Modelo e migração

- [ ] 1.1 Confirmar no enunciado se MySQL precisa de compatibilidade executável e verificar decisão registrada; se exigido, reestimar antes de implementar.
- [ ] 1.2 Criar changesets Liquibase de conta, carteira e propriedade anulável e verificar update/rollback em H2 e PostgreSQL.
- [ ] 1.3 Implementar preflight e backfill do admin/dados atuais e verificar contagens, relações, quantidades e valores em cópia sanitizada.
- [ ] 1.4 Adicionar constraints/índices de propriedade e verificar que nenhuma referência cruzada ou órfã é aceita.
- [ ] 1.5 Ensaiar backup, restore e contração do schema e verificar relatório operacional aprovado.

## 2. Conta local segura

- [ ] 2.1 Implementar cadastro nome/e-mail/senha e carteira padrão e verificar duplicidade, normalização e política de senha em testes.
- [ ] 2.2 Adaptar login para e-mail mantendo respostas não enumeráveis e verificar hash, rate limit e rotação de sessão.
- [ ] 2.3 Preservar cookie HttpOnly/SameSite e CSRF em todas as mutações e verificar 401/403, fixation e logout.
- [ ] 2.4 Implementar perfil mínimo e troca de senha e verificar senha atual, novo hash e política de sessões.
- [ ] 2.5 Implementar desativação com revogação de sessões e verificar login bloqueado e dados preservados.

## 3. Isolamento no backend

- [ ] 3.1 Centralizar proprietário derivado da sessão e verificar rejeição de owner enviado pelo cliente.
- [ ] 3.2 Escopar corretoras e ações cadastradas e verificar dois usuários com CNPJ/ticker equivalentes sem vazamento.
- [ ] 3.3 Escopar compras, vendas, histórico e posições e verificar referências de outro usuário recusadas.
- [ ] 3.4 Escopar dashboard, totais, filtros, paginação e caches e verificar respostas calculadas só com o proprietário.
- [ ] 3.5 Executar matriz direta de autorização horizontal em todos os endpoints privados e verificar nenhuma enumeração/leitura/mutação cruzada.

## 4. Interface de conta

- [ ] 4.1 Criar telas profissionais de cadastro e login e verificar teclado, erros, pending e reflow 320/390/768/1440.
- [ ] 4.2 Criar perfil, troca de senha e desativação confirmada e verificar E2E completo sem recuperação por e-mail.
- [ ] 4.3 Atualizar guards/interceptors para sessão e CSRF multiusuário e verificar retorno interno seguro e expiração.

## 5. Google secundário e garantia

- [ ] 5.1 Após aceite local, implementar Google OIDC atrás de configuração/flag de ambiente e verificar state, nonce, issuer, audience e ausência de autoassociação por e-mail.
- [ ] 5.2 Varrer Git, frontend, imagem e logs por credenciais/tokens e verificar zero segredo Google ou senha exposta.
- [ ] 5.3 Executar suites unitária, H2, PostgreSQL, migração, concorrência, autorização e E2E com dois usuários e verificar pipeline verde.
- [ ] 5.4 Construir os três serviços com Docker e verificar healthchecks, login local, isolamento e migração antes do rollout.
