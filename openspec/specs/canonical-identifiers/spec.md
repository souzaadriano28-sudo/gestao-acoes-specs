# Canonical Identifiers Specification

## Purpose

Garantir identificação uniforme de corretoras e ações em cadastros, consultas e operações, preservando os mercados brasileiro e americano existentes.

## Requirements
### Requirement: CI-01 CNPJ canonico
No corpo JSON de cadastro, o sistema SHALL aceitar, após remover somente espaços externos, CNPJ em exatamente 14 dígitos ou na máscara convencional `NN.NNN.NNN/NNNN-NN`. O formato original SHALL ser validado antes de remover a pontuação da máscara. Na rota de consulta por CNPJ, o segmento SHALL aceitar somente 14 dígitos sem máscara ou espaços. Em ambos os casos, o sistema SHALL validar os dígitos verificadores, rejeitar sequências com todos os dígitos iguais, consultar duplicidade/provedor e persistir a forma canônica de 14 dígitos. Formato ou dígitos verificadores inválidos SHALL retornar 422 VALIDATION_ERROR antes de consultar o provedor.

#### Scenario: Duplicidade entre formas equivalentes
- **WHEN** um CNPJ já registrado sem máscara é reenviado com máscara e espaços externos
- **THEN** retorna 409 DUPLICATE_CNPJ, não consulta provedores e não cria outra corretora.

#### Scenario: CNPJ invalido
- **WHEN** o cadastro recebe CNPJ com letras, pontuação fora da máscara convencional, quantidade incorreta, dígitos verificadores inválidos ou todos os dígitos iguais
- **THEN** retorna 422 com erro no campo cnpj sem consultar o provedor.

#### Scenario: Consulta por URL sem mascara
- **WHEN** um CNPJ válido existente é consultado na URL com exatamente 14 dígitos
- **THEN** a API identifica a corretora e retorna CNPJ canônico sem máscara.

#### Scenario: Consulta por URL mascarada ou invalida
- **WHEN** a rota de consulta recebe, com os caracteres devidamente codificados para transporte, CNPJ mascarado, com espaços, letras, tamanho diferente ou dígitos verificadores inválidos
- **THEN** retorna 422 VALIDATION_ERROR sem consultar o repositório ou provedor.

### Requirement: CI-02 Ticker e mercado canonicos
O sistema SHALL aplicar trim e maiúsculas independentes de locale aos tickers e mercados. SHALL mapear NACIONAL e BRASIL para BRASIL; INTERNACIONAL e AMERICANO para AMERICANO. Todos os aliases SHALL passar pelas mesmas validações de sintaxe e moeda. Outros mercados SHALL retornar 422. O padrão brasileiro atual de quatro letras e um ou dois dígitos e o americano de uma a cinco letras SHALL ser preservados.

#### Scenario: Alias brasileiro
- **WHEN** o cadastro recebe ticker " petr4 " e mercado " nacional "
- **THEN** valida como BRASIL, consulta o ticker PETR4 e persiste/retorna PETR4 e BRASIL.

#### Scenario: Alias americano
- **WHEN** o cadastro recebe ticker " aapl " e mercado " internacional "
- **THEN** valida como AMERICANO, consulta AAPL e persiste/retorna AAPL e AMERICANO.

#### Scenario: Alias nao contorna validacao
- **WHEN** um ticker inválido para o mercado é enviado com qualquer alias aceito
- **THEN** retorna 422 antes da consulta externa.

#### Scenario: Consulta e operacao normalizadas
- **WHEN** consulta por ticker ou operação usa espaços externos e minúsculas para um ativo existente
- **THEN** encontra o mesmo ativo sem criar duplicidade, respeitando as demais validações.

### Requirement: CI-03 Identidade protegida e legado preservado
O sistema SHALL rejeitar novos cadastros com ID fornecido pelo cliente, retornar 409 para duplicidade canônica de ticker/CNPJ e preservar registros existentes diante de colisões descobertas na normalização. A preparação de dados legados SHALL detectar colisões e valores inválidos antes de aplicar normalização ou restrições, interrompendo o procedimento sem mesclar ou apagar registros automaticamente.

#### Scenario: Cadastro com ID
- **WHEN** um POST de ação ou corretora contém id não nulo
- **THEN** retorna 422 e nenhum cadastro existente é sobrescrito.

#### Scenario: Ticker equivalente
- **WHEN** PETR4 já existe e um cadastro envia " petr4 "
- **THEN** retorna 409 DUPLICATE_TICKER antes de consultar cotações.

#### Scenario: Colisao em dados legados
- **WHEN** dois registros legados convergem para o mesmo identificador canônico ou já existem posições duplicadas
- **THEN** a preparação relata os registros conflitantes e bloqueia a alteração até resolução explícita, preservando histórico e vínculos.

#### Scenario: Normalizacao de legado sem conflito
- **WHEN** registros legados têm identificadores válidos e distintos que podem ser normalizados sem colisão
- **THEN** a preparação preserva seus IDs e todos os vínculos de posições/transações, atualiza somente os valores canônicos e conclui antes de aplicar as restrições.

#### Scenario: Cadastros equivalentes simultaneos
- **WHEN** com banco operacional, duas requisições simultâneas tentam cadastrar formas equivalentes do mesmo CNPJ ou ticker e o teste as libera por barreira
- **THEN** exatamente uma retorna 201, a outra retorna 409 com DUPLICATE_CNPJ ou DUPLICATE_TICKER, e existe somente um registro canônico.
