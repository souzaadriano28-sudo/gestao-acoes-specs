## Purpose

Definir uma experiência segura e inequívoca para registrar compras e vendas simuladas, preservando as regras transacionais existentes e evitando aparência de home broker.

## ADDED Requirements

### Requirement: SO-01 Operação identificada como simulação
A tela e a confirmação SHALL usar linguagem de “registrar compra simulada” e “registrar venda simulada”, informar que o preço será consultado pelo backend e reiterar que nenhuma ordem será enviada ao mercado. A interface MUST NOT usar estados como executada na B3, liquidada, custodiada ou saldo financeiro disponível.

#### Scenario: Revisão antes do envio
- **WHEN** ativo, corretora e quantidade válidos são informados
- **THEN** a revisão mostra tipo, ticker, mercado, corretora, quantidade, ausência de preço garantido e aviso de simulação antes do envio explícito.

#### Scenario: Sucesso acadêmico
- **WHEN** o backend confirma a operação
- **THEN** a interface informa que o registro simulado foi concluído e atualiza as leituras sem afirmar execução ou liquidação real.

### Requirement: SO-02 Validação alinhada ao domínio
O formulário SHALL exigir ativo já cadastrado, mercado canônico do ativo, corretora existente e quantidade representada como inteiro positivo dentro do limite do backend. Venda SHALL mostrar quantidade disponível para o par ativo-corretora quando fornecida pelo read model, mas a validação definitiva SHALL permanecer no backend. Preço manual, data retroativa, custos e moeda manual MUST NOT ser enviados pelos endpoints atuais.

#### Scenario: Quantidade inválida
- **WHEN** a quantidade está vazia, fracionária, zero, negativa ou acima do inteiro suportado
- **THEN** o envio é bloqueado com erro associado ao campo e nenhum valor é truncado ou convertido silenciosamente.

#### Scenario: Venda acima da posição
- **WHEN** uma venda excede a posição confirmada no backend
- **THEN** a interface apresenta INSUFFICIENT_POSITION, preserva a entrada e não altera localmente a posição.

#### Scenario: Mercado vem do ativo
- **WHEN** um ativo é selecionado
- **THEN** o formulário exibe seu mercado e envia o valor canônico sem permitir combinação divergente escolhida manualmente.

### Requirement: SO-03 Concorrência, duplicidade e resultado desconhecido
O frontend SHALL permitir um único envio pendente por formulário, manter campos bloqueados durante o envio e nunca repetir automaticamente compra ou venda. Respostas 409 CONCURRENT_OPERATION SHALL orientar atualização e nova tentativa manual. Falha de comunicação sem resposta conclusiva SHALL ser apresentada como resultado desconhecido e SHALL oferecer primeiro a atualização de posições e movimentações, não o reenvio direto.

#### Scenario: Duplo acionamento
- **WHEN** a pessoa aciona a confirmação mais de uma vez durante o envio
- **THEN** somente uma requisição é criada e o estado pendente é anunciado.

#### Scenario: Conflito concorrente
- **WHEN** o backend retorna 409 CONCURRENT_OPERATION
- **THEN** o formulário informa conflito temporário e oferece recarregar dados antes de nova tentativa explícita.

#### Scenario: Comunicação interrompida
- **WHEN** não existe resposta HTTP capaz de confirmar ou recusar a operação
- **THEN** a interface não declara sucesso ou falha de negócio, preserva os dados e orienta reconciliar as leituras antes de qualquer reenvio.

### Requirement: SO-04 Regras financeiras obrigatórias preservadas
Operações SHALL continuar usando preço positivo e moeda compatível obtidos pelo backend; compras SHALL atualizar preço médio por média ponderada; vendas parciais SHALL preservar preço médio; venda total SHALL remover a posição; transação e posição SHALL ser atômicas; e o par ativo-corretora SHALL permanecer único mesmo sob concorrência. A modernização visual MUST NOT alterar essas regras.

#### Scenario: Compra sucessiva
- **WHEN** uma posição recebe nova compra confirmada
- **THEN** quantidade e preço médio resultam da regra TI-05 e a movimentação aparece uma única vez no histórico.

#### Scenario: Venda total
- **WHEN** a quantidade vendida equivale à posição
- **THEN** a posição deixa de aparecer e a compra e venda permanecem no histórico.

#### Scenario: Atualização visual otimista
- **WHEN** uma compra ou venda ainda está pendente
- **THEN** o frontend não altera patrimônio, quantidade ou movimentações antes da confirmação e releitura do backend.
