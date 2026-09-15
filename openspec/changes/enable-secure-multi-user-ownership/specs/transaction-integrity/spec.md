## ADDED Requirements

### Requirement: TI-07 Operações e posições pertencem ao usuário
Compras, vendas, histórico e posições SHALL ser executados e consultados somente na carteira do usuário autenticado; referências a ativo ou corretora de outro proprietário MUST NOT ser aceitas.

#### Scenario: Referência cruzada
- **WHEN** uma operação do usuário A usa ID de ativo ou corretora do usuário B
- **THEN** a operação é recusada sem revelar o recurso e nenhuma transação ou posição é alterada.
