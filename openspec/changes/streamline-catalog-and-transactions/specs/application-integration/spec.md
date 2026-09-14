## ADDED Requirements

### Requirement: AI-07 Provedores isolados e demonstração real
BrasilAPI, ViaCEP, cadastro CVM e provedores de ativos SHALL ser acessados por ports/adapters substituíveis, com timeout e testes determinísticos. A apresentação SHALL demonstrar pelo menos três integrações externas reais e visíveis sem expor credenciais.

#### Scenario: Adapter indisponível
- **WHEN** qualquer adapter simulado retorna timeout, 429, 503 ou payload inválido
- **THEN** o domínio recebe falha tipada, não persiste parcialmente e a UI mostra o estado correspondente.

#### Scenario: Paridade de runtime
- **WHEN** suites rodam em H2, PostgreSQL e Compose
- **THEN** os contratos mínimos de corretoras, ações, compra, venda e leitura permanecem compatíveis.
