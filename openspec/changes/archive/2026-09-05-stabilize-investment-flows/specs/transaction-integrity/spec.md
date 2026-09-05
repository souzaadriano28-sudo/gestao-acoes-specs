## Purpose

Garantir que compras e vendas existentes mantenham posições e histórico consistentes, inclusive diante de dados inválidos, falhas externas e concorrência.

## ADDED Requirements

### Requirement: TI-01 Entrada de transacao valida
O sistema SHALL exigir ticker e mercado não vazios, corretoraId inteiro positivo e qtd inteira entre 1 e 2147483647 nos endpoints de compra e venda. A validação SHALL ocorrer no backend antes de consultar cotações ou gravar dados. Um valor JSON com tipo incompatível, incluindo texto no lugar de número, número fracionário ou número não representável pelo tipo inteiro, SHALL retornar 400 MALFORMED_REQUEST. Um valor recebido com o tipo correto, mas proibido pela regra de negócio, SHALL retornar 422 VALIDATION_ERROR. Valores não SHALL ser convertidos ou truncados silenciosamente.

#### Scenario: Campos invalidos
- **WHEN** compra ou venda recebe campo obrigatório ausente/nulo, texto em branco, qtd zero/negativa ou corretoraId não positivo
- **THEN** retorna 422 com erros por campo, sem consulta de cotação e sem alteração em transações ou posições.

#### Scenario: Tipo JSON incorreto
- **WHEN** qtd ou corretoraId contém texto, fração ou número fora do intervalo representável pelo tipo inteiro
- **THEN** retorna 400 MALFORMED_REQUEST no envelope comum, sem conversão, truncamento, consulta externa ou gravação.

#### Scenario: Inteiro JSON com parte decimal zero
- **WHEN** qtd ou corretoraId é enviado como número JSON `10.0`
- **THEN** retorna 400 MALFORMED_REQUEST, pois o contrato exige representação JSON inteira.

### Requirement: TI-02 Referencias e mercado coerentes
O sistema SHALL exigir ativo e corretora existentes, comparar o mercado normalizado da requisição com o ativo e usar o mercado do cadastro para selecionar a cotação.

#### Scenario: Referencia ausente
- **WHEN** o ativo ou a corretora informada não existe
- **THEN** retorna 404, sem consulta de cotação e sem gravação.

#### Scenario: Mercado divergente
- **WHEN** uma operação de PETR4 cadastrada em BRASIL informa AMERICANO
- **THEN** retorna 422 com erro de mercado, sem consultar o provedor americano nem modificar dados.

### Requirement: TI-03 Cotacao utilizavel
O sistema SHALL aceitar somente resposta externa presente, com preço decimal analisável, finito, maior que zero e moeda não vazia compatível com o mercado do ativo. Resposta ausente, lista de resultados ausente/vazia, preço ausente ou moeda ausente/vazia SHALL ser cotação inválida. Ativo explicitamente não encontrado pelo provedor SHALL retornar 404 UPSTREAM_NOT_FOUND; resposta presente, porém estrutural ou numericamente inválida, SHALL retornar 502 INVALID_QUOTE. Esta regra SHALL cobrir cadastro de ação, atualização de cotação, compra, venda e patrimônio. O preço da transação SHALL continuar sendo obtido pelo backend; não haverá novo campo de preço manual nesta mudança.

#### Scenario: Preco invalido do provedor
- **WHEN** qualquer fluxo recebe resposta/lista ausente, lista vazia, preço ausente, não numérico, zero, negativo, NaN ou infinito do adaptador
- **THEN** retorna 502 com código INVALID_QUOTE, preserva dados anteriores e não retorna patrimônio parcial ou zero substituto.

#### Scenario: Moeda divergente
- **WHEN** uma cotação brasileira declara USD ou uma cotação americana declara BRL
- **THEN** retorna 502 com código INVALID_QUOTE sem gravar ou calcular resultado com essa cotação.

#### Scenario: Moeda ausente
- **WHEN** uma resposta de cotação não informa moeda ou informa texto vazio
- **THEN** retorna 502 INVALID_QUOTE sem aplicar moeda padrão nem alterar dados.

#### Scenario: Ativo ausente no provedor
- **WHEN** o provedor informa explicitamente que o ticker não existe
- **THEN** retorna 404 UPSTREAM_NOT_FOUND sem criar ativo, transação ou posição.

### Requirement: TI-04 Precisao e arredondamento monetario
O sistema SHALL tratar preço unitário e preço médio como decimais de precisão 19 e escala 8. Preços externos SHALL ser arredondados para 8 casas com HALF_UP antes de persistir e SHALL continuar maiores que zero depois do arredondamento. A média ponderada SHALL usar os preços persistidos, multiplicações exatas e uma única divisão final arredondada para 8 casas com HALF_UP. Totais monetários e patrimônio expostos pela API SHALL ser arredondados para 2 casas com HALF_UP somente após somar todos os componentes na moeda de apresentação. Campos monetários SHALL continuar sendo números JSON.

#### Scenario: Media com dizima
- **WHEN** são compradas 1 unidade a 10,00 e 2 unidades a 10,01
- **THEN** o preço médio persistido e retornado é 10,00666667.

#### Scenario: Patrimonio arredondado uma vez
- **WHEN** os componentes não arredondados do patrimônio somam 100,005 na moeda de apresentação
- **THEN** o patrimônio retornado é o número JSON 100,01, sem arredondar cada componente previamente para 2 casas.

#### Scenario: Preco desaparece ao arredondar
- **WHEN** um preço externo positivo é menor que 0,000000005 e resulta em 0,00000000 na escala definida
- **THEN** retorna 502 INVALID_QUOTE e não grava nem calcula com esse preço.

### Requirement: TI-05 Compra e venda atomicas
O sistema SHALL gravar a transação e a alteração da posição como uma unidade atômica. Compras SHALL usar média ponderada; vendas parciais SHALL manter o preço médio; vendas totais SHALL remover a posição e preservar o histórico. Venda sem posição ou acima da quantidade disponível SHALL retornar 422 com código INSUFFICIENT_POSITION. Resultados aritméticos não finitos e estouro da quantidade acumulada SHALL ser rejeitados com 422, sem gravação.

#### Scenario: Compras sucessivas
- **WHEN** são compradas 10 unidades a 20 e depois 5 a 26 do mesmo ativo na mesma corretora
- **THEN** existem duas transações e uma posição de 15 unidades com preço médio 22.

#### Scenario: Venda parcial e total
- **WHEN** após as duas compras de 10 unidades a 20 e 5 a 26, a posição vende 5 e posteriormente 10
- **THEN** a primeira venda deixa 10 unidades a preço médio 22, a segunda remove a posição e as quatro transações permanecem no histórico.

#### Scenario: Venda sem saldo
- **WHEN** a venda excede a posição ou não há posição para o ativo e corretora existentes
- **THEN** retorna 422 com código INSUFFICIENT_POSITION e nenhum dado é alterado.

#### Scenario: Rollback de falha intermediaria
- **WHEN** uma falha de persistência ocorre após salvar a transação e antes de concluir a posição
- **THEN** nenhuma alteração dessa operação é confirmada, inclusive a transação inicialmente salva.

#### Scenario: Limite acumulado
- **WHEN** uma compra faria a quantidade total exceder 2147483647 ou o cálculo produzir valor não finito
- **THEN** retorna 422 com código NUMERIC_LIMIT_EXCEEDED e preserva posição e histórico.

#### Scenario: Posicoes separadas por corretora
- **WHEN** o mesmo ativo é comprado ou vendido em duas corretoras diferentes
- **THEN** cada operação altera somente a posição da corretora informada e mantém histórico associado à corretora correta.

#### Scenario: Recompra depois de zerar
- **WHEN** uma posição é totalmente vendida e depois o mesmo ativo é comprado novamente na mesma corretora
- **THEN** surge uma nova posição cujo preço médio é somente o preço da nova compra, enquanto o histórico anterior permanece preservado.

### Requirement: TI-06 Consistencia concorrente
O sistema SHALL manter no máximo uma posição por ativo e corretora e impedir perda de atualização ou venda acima do saldo em operações simultâneas. Conflitos transitórios não resolvidos SHALL retornar 409 sem gravação parcial.

#### Scenario: Primeiras compras simultaneas
- **WHEN** com banco e provedor operacionais, um teste em PostgreSQL libera por barreira duas compras de 10 unidades a 20 e 5 unidades a 26 para o mesmo par ainda sem posição e aguarda ambas dentro do limite definido pela suíte
- **THEN** ambas confirmam exatamente uma vez, existem duas transações e uma única posição de 15 unidades com preço médio 22,00000000.

#### Scenario: Vendas disputando saldo
- **WHEN** com banco e provedor operacionais, um teste em PostgreSQL libera por barreira duas vendas de 7 unidades contra uma posição confirmada de 10 e aguarda ambas dentro do limite definido pela suíte
- **THEN** exatamente uma confirma, a outra retorna 422 INSUFFICIENT_POSITION, a posição final é 3 e apenas uma transação de venda é adicionada.

#### Scenario: Timeout de concorrencia
- **WHEN** um teste mantém de forma controlada o bloqueio necessário além do timeout configurado e envia uma operação concorrente
- **THEN** a operação concorrente retorna 409 CONCURRENT_OPERATION dentro do limite do teste, sem transação ou posição parcial.
