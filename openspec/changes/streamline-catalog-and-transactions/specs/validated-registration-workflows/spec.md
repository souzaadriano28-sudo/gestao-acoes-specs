## Purpose

Preservar os cadastros acadêmicos obrigatórios enquanto torna consultas externas, revisão e lançamentos explícitos, bloqueantes e recuperáveis.

## ADDED Requirements

### Requirement: VR-01 Corretora validada em etapas
O fluxo SHALL exigir CNPJ digitado, consulta BrasilAPI, validação CVM ativa/categoria compatível, escolha e consulta de CEP e revisão final nesta ordem. Cada alteração de CNPJ ou CEP SHALL invalidar resultados dependentes anteriores.

#### Scenario: Jornada válida
- **WHEN** CNPJ válido pertence a empresa ativa e intermediário CVM ativo/compatível, e o CEP escolhido existe
- **THEN** razão social, nome fantasia, situações e endereço revisável são mostrados antes de habilitar a confirmação.

#### Scenario: CVM indisponível
- **WHEN** o cadastro oficial CVM está indisponível ou inconclusivo
- **THEN** o cadastro fica temporariamente bloqueado, oferece nova tentativa e não oferece “cadastrar mesmo assim”.

#### Scenario: CEP sugerido
- **WHEN** BrasilAPI retorna CEP
- **THEN** o CEP aparece como sugestão não aplicada até o usuário escolher “Usar este CEP” ou digitar outro e consultar ViaCEP.

### Requirement: VR-02 Ativo consultado e confirmado
O fluxo SHALL preservar cadastro explícito, pesquisar ticker/nome para Brasil/EUA e preencher ticker, mercado visível, bolsa e moeda ao selecionar. Fallback manual de ticker+mercado SHALL exigir consulta correspondente e confirmação de resposta válida.

#### Scenario: Sugestão escolhida
- **WHEN** usuário seleciona resultado do autocomplete
- **THEN** vê ticker, empresa, bolsa, país, moeda, cotação e horário antes de confirmar o cadastro.

#### Scenario: Entrada manual
- **WHEN** ativo não aparece e usuário informa ticker e mercado manualmente
- **THEN** somente resposta válida do provedor compatível habilita confirmação.

#### Scenario: Provedor americano lento
- **WHEN** a consulta americana excede o timeout
- **THEN** a espera termina, nenhuma ação é criada e a interface permite cancelar ou tentar novamente sem duplo envio.

### Requirement: VR-03 Lançamento financeiro explícito
Compra e venda simuladas SHALL selecionar ativo já cadastrado, data, quantidade, preço unitário visível/editável, moeda e corretora, calculando total antes da confirmação. Sugestão histórica confiável SHALL ser opcional; o preço confirmado pelo usuário SHALL prevalecer. Nenhum ativo SHALL ser criado pela operação.

#### Scenario: Revisão de compra
- **WHEN** os campos são válidos
- **THEN** a revisão mostra data, ativo, quantidade, preço unitário, moeda, corretora e total antes do envio.

#### Scenario: Ativo não cadastrado
- **WHEN** operação referencia ativo não pertencente ao catálogo cadastrado do usuário
- **THEN** o envio é recusado e orienta cadastro explícito, sem criação silenciosa.

### Requirement: VR-04 Falhas externas diferenciadas
CNPJ inválido, CEP inexistente, ticker inexistente, limite excedido e API indisponível SHALL produzir estados distintos, compreensíveis e sem sucesso falso.

#### Scenario: Limite do provedor
- **WHEN** integração retorna rate limit
- **THEN** o sistema informa indisponibilidade temporária e momento/ação segura de nova tentativa sem classificar o identificador como inexistente.
