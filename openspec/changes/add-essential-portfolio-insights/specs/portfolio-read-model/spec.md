## ADDED Requirements

### Requirement: PR-07 Agregações essenciais por proprietário
O backend SHALL fornecer composição por ativo, custo versus valor e ganho/perda por posição exclusivamente para a carteira autenticada, com valores decimais, moeda, instante de atualização e cobertura.

#### Scenario: Reconciliação das três análises
- **WHEN** o usuário consulta insights e posições no mesmo instante de corte
- **THEN** totais, custo e resultados coincidem entre respostas e não incluem outro proprietário.
