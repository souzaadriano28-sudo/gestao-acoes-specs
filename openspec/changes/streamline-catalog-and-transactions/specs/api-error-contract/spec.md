## ADDED Requirements

### Requirement: AE-03 Erros dos fluxos consultáveis
O contrato SHALL diferenciar CNPJ inválido/duplicado, empresa inativa, CVM ausente/inativa/incompatível/indisponível, CEP inexistente, ticker inexistente, provedor indisponível/limitado, conflito idempotente e resultado desconhecido.

#### Scenario: API indisponível versus identificador inexistente
- **WHEN** uma consulta falha por timeout/503/429 e outra recebe ausência explícita
- **THEN** códigos e mensagens diferem, permitindo tentar depois somente no primeiro caso.
