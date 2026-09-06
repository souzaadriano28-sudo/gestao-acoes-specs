## ADDED Requirements

### Requirement: AI-05 Experiência integrada verificável
Depois de `add-secure-admin-authentication` estar concluída, a aplicação integrada SHALL expor as cinco rotas protegidas planejadas, consumir os novos read models sem quebrar os endpoints existentes e preservar os estados definidos em IU, PR, SO e BR. A verificação SHALL cobrir testes unitários de componentes/serviços/formatação, testes de acessibilidade automatizados e manuais, E2E em desktop, tablet e celular e a pilha com exatamente os containers `frontend`, `backend` e `postgres`, usando sessão autenticada, provedores simulados e sem rede financeira externa.

#### Scenario: Jornada desktop pelos três containers
- **WHEN** os três serviços saudáveis executam a jornada determinística de cadastro, compra, dashboard, posições, movimentações e venda em viewport desktop
- **THEN** rotas, contratos, estados, valores, metadados de fonte e aviso acadêmico correspondem às specs sem chamadas a provedores reais.

#### Scenario: Jornada celular pelos três containers
- **WHEN** a mesma pilha executa a jornada em viewport de celular
- **THEN** navegação, tabelas adaptadas, formulários e mensagens permanecem completos, sem overflow horizontal e com alvos de toque válidos.

#### Scenario: Jornada tablet pelos três containers
- **WHEN** a mesma pilha executa a jornada autenticada em 768×1024
- **THEN** rail/drawer, cartões, tabelas, fontes e estados permanecem legíveis, sem sobreposição, corte de foco ou formulário de operação dominando o Dashboard.

#### Scenario: Falhas controladas
- **WHEN** os stubs produzem rate limit, indisponibilidade, cotação inválida, câmbio ausente, conflito concorrente e resultado desconhecido
- **THEN** cada estado é apresentado conforme o contrato, sem zero falso, reenvio de mutação ou atribuição inventada de fonte.

#### Scenario: Gates antes de entrega
- **WHEN** a mudança é candidata a entrega
- **THEN** build e testes não interativos de frontend e backend, testes PostgreSQL de concorrência, E2E containerizado nos dois viewports, auditoria WCAG e validação OpenSpec estrita passam sem testes ignorados para ocultar falhas.
