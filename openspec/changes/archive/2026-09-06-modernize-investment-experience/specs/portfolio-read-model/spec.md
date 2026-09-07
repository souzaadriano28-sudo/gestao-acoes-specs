## Purpose

Fornecer leituras financeiras coerentes e rastreáveis para o frontend, centralizando cálculos, moedas, cotações e disponibilidade no backend como fonte de verdade.

## ADDED Requirements

### Requirement: PR-01 Resumo de carteira calculado no backend
O backend SHALL expor um read model de dashboard com `asOf`, moeda de apresentação e disponibilidade individual das métricas. Patrimônio em moeda de apresentação, custo, resultado absoluto e percentual SHALL ser calculados no backend com `BigDecimal`, política de arredondamento documentada e taxa cambial rastreável. Métricas que não podem ser calculadas com os dados persistidos SHALL ser marcadas como indisponíveis e MUST NOT receber zero substituto.

#### Scenario: Resumo multimoeda completo
- **WHEN** existem posições BRL e USD e há cotação e câmbio válidos com origem e instante
- **THEN** o backend retorna totais convertidos em BRL, base de cálculo coerente, disponibilidade `AVAILABLE` e metadados das fontes utilizadas.

#### Scenario: Câmbio indisponível
- **WHEN** existe posição USD e não há taxa cambial válida
- **THEN** o total consolidado dependente de conversão é `UNAVAILABLE`, sem aplicar câmbio fixo, último valor oculto ou conversão no frontend.

#### Scenario: Carteira vazia
- **WHEN** não existe posição
- **THEN** o resumo retorna contagens e patrimônio confirmados como zero, distinguindo-os de falha de leitura.

### Requirement: PR-02 Posições enriquecidas e consistentes
O backend SHALL retornar cada posição com identificadores estáveis de ativo e corretora, ticker, mercado, corretora, quantidade inteira positiva, preço médio e moeda nativa, cotação corrente, valor de mercado, custo e resultado quando disponíveis, além da disponibilidade e proveniência dessas grandezas. Uma posição corresponde exclusivamente a um par ativo-corretora; agregações por ticker SHALL ser oferecidas separadamente e não substituirão a granularidade de custódia simulada.

#### Scenario: Posição disponível
- **WHEN** uma posição possui cotação corrente válida
- **THEN** preço médio, cotação, custo, valor de mercado e resultado usam a moeda nativa e são retornados já calculados pelo backend.

#### Scenario: Cotação de uma posição falha
- **WHEN** a cotação corrente de uma posição está indisponível
- **THEN** quantidade e preço médio persistidos continuam disponíveis, enquanto valor corrente e resultado dessa posição são marcados indisponíveis e o resumo não finge completude.

#### Scenario: Mesmo ativo em duas corretoras
- **WHEN** o mesmo ativo existe em duas corretoras
- **THEN** a leitura retorna duas posições identificáveis e qualquer total agregado explicita a agregação.

### Requirement: PR-03 Movimentações paginadas
O backend SHALL expor movimentações persistidas em ordem decrescente de data/hora, com paginação determinística e filtros opcionais por tipo, ticker, corretora e período. Cada item SHALL conter id, tipo COMPRA/VENDA, ativo, mercado, corretora, quantidade, preço unitário, moeda e data/hora; dados históricos de fonte de cotação ausentes MUST NOT ser inferidos retroativamente.

#### Scenario: Página de histórico
- **WHEN** existem mais movimentações que o tamanho da página
- **THEN** a resposta informa itens, página, tamanho, total e ordenação estável por data/hora e id.

#### Scenario: Filtro sem resultado
- **WHEN** filtros válidos não encontram movimentações
- **THEN** retorna página vazia confirmada, não 404 e não erro de indisponibilidade.

#### Scenario: Metadado histórico inexistente
- **WHEN** uma transação antiga não armazenou a fonte da cotação
- **THEN** o campo correspondente é ausente ou `UNAVAILABLE` e não recebe o provedor atual do ativo.

### Requirement: PR-04 Proveniência de cotação e câmbio
Toda nova cotação persistida ou usada em resumo/operação SHALL carregar tipo de fonte, identificador público do provedor, instante de referência, instante de obtenção e moeda. Toda conversão SHALL carregar par de moedas, taxa decimal, fonte, instante de referência e instante de obtenção. A API SHALL distinguir dado atual, desatualizado e indisponível por regra configurada e MUST NOT chamar PTAX de cotação em tempo real.

#### Scenario: Cotação retornada
- **WHEN** o provedor retorna preço e metadados válidos
- **THEN** o backend persiste/retorna preço, moeda, fonte e instantes sem expor token ou URL secreta.

#### Scenario: Dado antigo
- **WHEN** o instante excede o limite de atualidade configurado
- **THEN** a resposta preserva o último valor como `STALE`, informa sua referência e não o rotula como atual.

#### Scenario: Uso de PTAX
- **WHEN** a taxa de referência do Banco Central é usada para consolidação acadêmica
- **THEN** a resposta identifica PTAX, data de referência e natureza de referência, sem descrevê-la como preço executável ou intradiário em tempo real.

### Requirement: PR-05 Compatibilidade e falha parcial explícita
Os endpoints legados SHALL permanecer compatíveis durante a migração. Novos read models SHALL usar o envelope de erro vigente para falha total e disponibilidade por seção para falhas parciais previstas, sem retornar patrimônio parcial como se fosse total. O frontend MUST NOT precisar correlacionar listas independentes para produzir valores financeiros.

#### Scenario: Cliente legado
- **WHEN** um cliente usa os endpoints existentes de saldo e posições
- **THEN** os formatos vigentes continuam válidos até depreciação explícita posterior.

#### Scenario: Falha parcial declarada
- **WHEN** cadastro e posições são legíveis, mas uma integração de cotação falha
- **THEN** o read model identifica as seções afetadas, mantém dados persistidos úteis e marca qualquer total incompleto como indisponível.
