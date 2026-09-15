## Purpose

Oferecer três leituras visuais essenciais e auditáveis da carteira, sempre derivadas de operações, posições e cotações reais disponíveis.

## ADDED Requirements

### Requirement: EP-01 Composição por ativo
O sistema SHALL mostrar composição por ativo usando o valor atual de cada posição com cotação válida, na moeda de apresentação, e SHALL informar cobertura parcial sem converter ausência em zero.

#### Scenario: Composição completa
- **WHEN** todas as posições possuem cotações e conversões válidas
- **THEN** gráfico e tabela mostram valor e percentual por ativo e reconciliam com o patrimônio exibido.

#### Scenario: Cotação ausente
- **WHEN** uma posição não possui cotação utilizável
- **THEN** ela é identificada como indisponível, a cobertura é parcial e não recebe valor zero inventado.

### Requirement: EP-02 Capital investido versus valor atual
O sistema SHALL comparar custo remanescente das posições abertas com seu valor atual, sem chamar compras brutas, caixa ou aportes de capital investido. Valores SHALL usar regras decimais documentadas.

#### Scenario: Comparação reconciliada
- **WHEN** posições possuem custo e cotação válidos
- **THEN** gráfico e tabela exibem custo remanescente e valor atual com moeda, fórmula e mesma totalização da carteira.

### Requirement: EP-03 Ganho ou perda por posição
O sistema SHALL calcular ganho/perda não realizado por posição como valor atual menos custo remanescente, exibindo valor e percentual somente quando o denominador for válido.

#### Scenario: Resultado negativo
- **WHEN** o valor atual é menor que o custo remanescente
- **THEN** gráfico e tabela exibem perda com sinal, unidade e cor não usada como único indicador.

### Requirement: EP-04 Equivalência e estados
Cada gráfico SHALL possuir tabela acessível com os mesmos dados, título, unidade, moeda e atualização. Estados vazio, parcial, desatualizado e indisponível SHALL ser distintos. Dividendos, impostos, saldo, benchmark, TWR, XIRR e histórico inferido MUST NOT aparecer.

#### Scenario: Navegação sem gráfico
- **WHEN** pessoa usa leitor de tela ou prefere a tabela
- **THEN** acessa todos os valores e estados necessários sem depender de cor, hover ou geometria.

#### Scenario: Carteira vazia
- **WHEN** não existem posições
- **THEN** as três análises mostram estado vazio orientado, sem séries ou percentuais inventados.
