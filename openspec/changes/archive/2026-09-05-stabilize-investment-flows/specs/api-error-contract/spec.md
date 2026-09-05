## Purpose

Oferecer um contrato previsível de erros para os endpoints atuais e mensagens recuperáveis no frontend, sem exposição de detalhes internos ou credenciais.

## ADDED Requirements

### Requirement: AE-01 Envelope e classificacao de erros
Todos os erros dos endpoints atuais SHALL usar JSON com timestamp UTC, status igual ao HTTP, code estável, error resumido, message legível, path sem query string e fieldErrors como lista de objetos field/message, vazia quando não aplicável. Detalhes internos, corpo bruto de provedores, URLs com segredos e stack traces não SHALL aparecer nas respostas.

O mapeamento SHALL ser: 400 MALFORMED_REQUEST para JSON inválido, tipo JSON incorreto, número não representável e parâmetros de rota que não podem ser convertidos; 422 VALIDATION_ERROR para formato/campo ou regra de negócio inválida; 422 MARKET_MISMATCH, NUMERIC_LIMIT_EXCEEDED ou INSUFFICIENT_POSITION para regras específicas; 404 RESOURCE_NOT_FOUND para referência local inexistente; 409 DUPLICATE_CNPJ ou DUPLICATE_TICKER para duplicidade e 409 CONCURRENT_OPERATION para conflito transitório; 502 INVALID_QUOTE para cotação inválida; 429 UPSTREAM_RATE_LIMIT para limite externo; 404 UPSTREAM_NOT_FOUND para dado externo explicitamente inexistente; 503 UPSTREAM_UNAVAILABLE para timeout, falha de conexão e demais falhas externas; 500 INTERNAL_ERROR para falha inesperada. Método HTTP não permitido e tipo de conteúdo não aceito SHALL preservar respectivamente 405 e 415, usando o mesmo envelope e códigos METHOD_NOT_ALLOWED e UNSUPPORTED_MEDIA_TYPE.

A ordem de avaliação SHALL ser: sintaxe e tipos da requisição; validação de formato/campos; existência das referências locais; regras que dependem dos registros; chamada e validação da integração; persistência. Quando mais de uma falha é conhecida na mesma etapa, todos os erros de campo SHALL ser retornados; falhas de etapas posteriores não SHALL ser avaliadas.

#### Scenario: Multiplos campos invalidos
- **WHEN** uma requisição contém dois campos com violações de validação
- **THEN** retorna 422 com ambos em fieldErrors e todos os campos do envelope, mantendo message como texto.

#### Scenario: Provedor indisponivel ou limitado
- **WHEN** um provedor retorna 429 ou ocorre timeout
- **THEN** a API retorna respectivamente 429 UPSTREAM_RATE_LIMIT ou 503 UPSTREAM_UNAVAILABLE, com mensagem segura sem prometer prazo de restabelecimento não conhecido.

#### Scenario: Falha inesperada
- **WHEN** ocorre erro interno não classificado
- **THEN** retorna 500 INTERNAL_ERROR com mensagem genérica, sem divulgar exceção ou credenciais.

#### Scenario: Metodo ou tipo de conteudo incorreto
- **WHEN** um endpoint existente recebe método HTTP não permitido ou conteúdo não suportado
- **THEN** retorna respectivamente 405 METHOD_NOT_ALLOWED ou 415 UNSUPPORTED_MEDIA_TYPE no envelope comum.

#### Scenario: Prioridade de validacao
- **WHEN** uma requisição tem mercado desconhecido e corretora inexistente
- **THEN** retorna 422 VALIDATION_ERROR para o mercado e não consulta a corretora nem provedores.

### Requirement: AE-02 Erros utilizaveis no frontend
O frontend SHALL exibir message e associar cada fieldError ao campo correspondente, mantendo visível erro sem campo correspondente. Em erro de rede ou resposta fora do contrato SHALL apresentar mensagem local segura. Falhas de leitura SHALL ser distinguíveis de listas vazias e patrimônio zero. O estado da mutação original e o estado da atualização posterior SHALL ser apresentados separadamente.

#### Scenario: Operacao recusada
- **WHEN** uma compra ou venda recebe resposta HTTP de erro antes de qualquer resposta de sucesso
- **THEN** a interface mostra a mensagem, preserva os valores digitados para correção e não informa operação concluída.

#### Scenario: Erro associado ao campo
- **WHEN** o envelope contém fieldError para qtd e outro erro sem campo correspondente conhecido pela tela
- **THEN** a interface associa o primeiro ao controle de quantidade e mantém o segundo visível no resumo geral.

#### Scenario: Operacao confirmada e atualizacao falha
- **WHEN** compra ou venda retorna sucesso e uma leitura posterior de posição ou patrimônio falha
- **THEN** a interface informa que a operação foi confirmada, mostra separadamente que os dados não puderam ser atualizados, mantém os últimos dados como desatualizados e oferece nova tentativa da leitura sem reenviar a operação.

#### Scenario: Resultado desconhecido por falha de comunicacao
- **WHEN** ocorre falha de comunicação depois que uma compra ou venda foi enviada e nenhuma resposta HTTP permite saber se foi confirmada
- **THEN** a interface não classifica a operação como concluída nem recusada, informa resultado desconhecido, preserva os dados digitados, não reenvia automaticamente e orienta atualizar posições antes de uma nova tentativa manual.

#### Scenario: Erro de rede
- **WHEN** uma leitura da API está inacessível ou devolve corpo inesperado
- **THEN** a interface mostra mensagem compreensível, sem renderizar objeto bruto ou depender do console.

#### Scenario: Falha ao carregar patrimonio
- **WHEN** a primeira leitura do patrimônio falha
- **THEN** a interface exibe indisponibilidade, sem apresentar o valor inicial zero como patrimônio confirmado.

#### Scenario: Falha ao atualizar dados existentes
- **WHEN** uma leitura falha depois de dados terem sido exibidos
- **THEN** a interface mantém os últimos dados identificados como não atualizados e permite nova tentativa.
