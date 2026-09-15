## ADDED Requirements

### Requirement: PR-06 Leituras isoladas por proprietário
Resumo, posições e movimentações SHALL conter exclusivamente dados da carteira autenticada, inclusive filtros, paginação, totais e respostas parciais.

#### Scenario: Carteiras simultâneas
- **WHEN** dois usuários consultam o dashboard e o histórico ao mesmo tempo
- **THEN** cada resposta e total são calculados somente com os dados de seu proprietário.
