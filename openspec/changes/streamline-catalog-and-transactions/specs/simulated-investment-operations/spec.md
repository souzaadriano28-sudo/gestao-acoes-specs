## MODIFIED Requirements

### Requirement: SO-01 Operação identificada como simulação
A tela e a confirmação SHALL afirmar que compra/venda são registros simulados, não ordens, e mostrar data, preço efetivo, moeda e total antes do envio.

#### Scenario: Revisão antes do envio
- **WHEN** ativo cadastrado, corretora autorizada, data, quantidade e preço são válidos
- **THEN** a revisão mostra todos os campos, total e aviso de simulação.

#### Scenario: Sucesso acadêmico
- **WHEN** backend confirma a operação
- **THEN** a interface informa que o registro foi concluído sem afirmar execução, liquidação ou custódia real.

### Requirement: SO-02 Validação alinhada ao domínio
O formulário SHALL exigir ativo já cadastrado, mercado/moeda canônicos, corretora vinculada e autorizada, data válida, quantidade inteira positiva e preço positivo editável. Validação definitiva SHALL permanecer no backend.

#### Scenario: Quantidade inválida
- **WHEN** quantidade está vazia, fracionária, zero, negativa ou excede limite
- **THEN** envio é bloqueado sem truncamento ou conversão silenciosa.

#### Scenario: Venda acima da posição
- **WHEN** venda excede posição disponível
- **THEN** backend recusa, interface preserva entrada e não altera posição local.

#### Scenario: Mercado vem do ativo
- **WHEN** ativo cadastrado é selecionado
- **THEN** mercado e moeda aparecem sem escolha divergente.

### Requirement: SO-04 Regras financeiras obrigatórias preservadas
Compras SHALL recalcular preço médio com o preço efetivo; vendas parciais SHALL preservar preço médio; venda total SHALL remover somente a posição ativa; ledger e posição SHALL ser atômicos/idempotentes e o histórico SHALL permanecer completo.

#### Scenario: Compra sucessiva
- **WHEN** posição recebe nova compra
- **THEN** quantidade e preço médio usam os preços efetivos e a operação aparece uma vez.

#### Scenario: Venda total
- **WHEN** quantidade vendida equivale à posição
- **THEN** posição deixa de aparecer e compras/vendas/correções permanecem no histórico.

#### Scenario: Atualização visual otimista
- **WHEN** operação está pendente
- **THEN** frontend não altera carteira antes da confirmação e releitura.
