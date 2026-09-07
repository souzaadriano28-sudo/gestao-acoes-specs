## MODIFIED Requirements

### Requirement: TI-03 Cotacao utilizavel
Cadastro/atualização de ativo SHALL aceitar somente resposta presente, preço decimal finito positivo e moeda compatível, distinguindo inexistência de indisponibilidade. Em operação, cotação histórica é apenas sugestão: o preço persistido SHALL ser o valor efetivamente pago e confirmado pelo usuário, positivo e na moeda do ativo.

#### Scenario: Preco invalido do provedor
- **WHEN** consulta de ativo recebe resposta ausente/malformada ou preço ausente, não numérico, zero, negativo, NaN ou infinito
- **THEN** retorna integração inválida/indisponível, preserva dados e não habilita o cadastro.

#### Scenario: Moeda divergente
- **WHEN** provedor declara moeda incompatível com mercado/ativo
- **THEN** a resposta é rejeitada sem cadastrar ou calcular com essa cotação.

#### Scenario: Moeda ausente
- **WHEN** resposta não informa moeda
- **THEN** ela é rejeitada sem aplicar valor padrão.

#### Scenario: Ativo ausente no provedor
- **WHEN** provedor informa explicitamente que ticker não existe
- **THEN** retorna `UPSTREAM_NOT_FOUND`, distinto de indisponibilidade, sem criar ativo ou operação.

## ADDED Requirements

### Requirement: TI-08 Ledger idempotente e corrigível
Operação SHALL guardar proprietário, data, ativo, corretora, quantidade, preço efetivo, moeda, total, chave de idempotência e relação de correção/estorno. Repetição idêntica SHALL retornar o mesmo resultado; payload divergente na mesma chave SHALL conflitar. Correção/estorno MUST preservar o original e reconstruir a posição.

#### Scenario: Clique ou retry duplicado
- **WHEN** a mesma chave e payload são confirmados duas vezes
- **THEN** existe uma única operação econômica e o resultado é reconciliável pela chave.

#### Scenario: Correção auditável
- **WHEN** usuário corrige preço ou data de operação
- **THEN** original e correção permanecem no histórico e posição/preço médio são recalculados deterministicamente.

#### Scenario: Venda concorrente
- **WHEN** duas vendas simultâneas disputam saldo insuficiente para ambas
- **THEN** somente a quantidade disponível é vendida e nenhuma posição fica negativa.
