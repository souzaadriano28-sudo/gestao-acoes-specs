## Purpose

Garantir que o schema financeiro seja criado, evoluído e auditado de forma determinística em PostgreSQL e H2, preservando dados e invariantes de carteira.

## ADDED Requirements

### Requirement: Schema financeiro versionado e completo
O schema versionado SHALL representar `acao`, `corretora`, `transacao` e `posicao_carteira` com tipos, identidade, nulabilidade, precisão decimal, chaves estrangeiras, unicidade e checks equivalentes ao modelo persistente vigente. Ticker e CNPJ canônicos SHALL permanecer únicos; cada posição SHALL permanecer única por ação e corretora; quantidades, cotações e preços SHALL preservar as restrições positivas e a precisão `numeric(19,8)`.

#### Scenario: Banco vazio
- **WHEN** a aplicação inicia sobre um banco suportado sem objetos da aplicação
- **THEN** todas as quatro tabelas, relacionamentos, constraints e objetos de controle de migration são criados na ordem correta antes da validação ORM.

#### Scenario: Invariante estrutural divergente
- **WHEN** uma coluna, constraint, tipo ou relacionamento existente não corresponde ao schema versionado
- **THEN** a inicialização ou o preflight falha de forma diagnóstica sem voltar a criação ou atualização automática pelo ORM.

### Requirement: Autoridade unica e historico imutavel
Uma ferramenta de migration SHALL ser a única autoridade para criar e evoluir o schema em desenvolvimento, containers e testes de integração; o ORM SHALL operar em modo `validate`. Cada alteração SHALL possuir identificação única, ordem determinística e checksum, e uma migration já compartilhada ou executada MUST NOT ser editada; correções SHALL ser novos passos incrementais.

#### Scenario: Segunda inicializacao
- **WHEN** a aplicação reinicia no mesmo banco após todas as migrations terem sido aplicadas
- **THEN** nenhuma migration é reaplicada, nenhum dado é duplicado ou apagado e a validação ORM passa.

#### Scenario: Checksum alterado
- **WHEN** o conteúdo de uma migration executada diverge do checksum registrado
- **THEN** a inicialização falha e exige uma migration corretiva nova, sem limpar ou recalcular checksums silenciosamente.

#### Scenario: Inicializacao concorrente
- **WHEN** duas instâncias tentam migrar o mesmo banco simultaneamente
- **THEN** o mecanismo de lock serializa a evolução e nenhuma instância observa schema parcialmente aplicado.

### Requirement: Adocao segura de bancos PostgreSQL existentes
A adoção de um banco existente SHALL exigir backup testado, preflight sem alteração persistente, inventário de divergências e escolha explícita entre recriação descartável ou baseline preservando dados. Uma baseline SHALL ser permitida somente quando o schema real for comprovadamente equivalente ao changelog inicial. Os scripts existentes de preflight e normalização SHALL ter sua intenção, ordem e cobertura preservadas em uma trilha versionada, sem execução dupla.

#### Scenario: Colisao ou dado legado invalido
- **WHEN** o preflight encontra tickers/CNPJs canonicamente duplicados, posições duplicadas, mercado desconhecido ou valor fora das restrições financeiras
- **THEN** a migração é interrompida antes de normalizar ou registrar baseline e relata os registros que exigem decisão manual.

#### Scenario: Estrutura existente equivalente
- **WHEN** backup e comparação comprovam que um banco existente possui o schema inicial e os dados satisfazem o preflight
- **THEN** um procedimento administrativo explícito pode registrar a baseline sem recriar tabelas nem perder identificadores, histórico de transações ou posições.

#### Scenario: Estrutura existente divergente
- **WHEN** o banco contém objetos ou definições incompatíveis com o changelog inicial
- **THEN** a baseline é recusada até que a divergência seja reconciliada e verificada, sem usar sincronização de changelog para ocultar o erro.

### Requirement: Rollback deliberado e recuperavel
Cada evolução reversível SHALL declarar rollback e ser testada. Transformações de dados ou constraints cuja reversão automática possa perder informação SHALL documentar o limite, exigir backup restaurável e possuir procedimento de recuperação verificado antes da aplicação em banco persistente.

#### Scenario: Alteracao reversivel
- **WHEN** uma migration estrutural reversível é aplicada em ambiente descartável e seu rollback é solicitado
- **THEN** o schema retorna ao estado anterior e pode ser migrado novamente com sucesso.

#### Scenario: Normalizacao destrutiva
- **WHEN** uma normalização perde a representação textual original ou endurece constraints
- **THEN** a documentação não promete rollback automático enganoso e a recuperação depende de restauração de backup previamente testada.

### Requirement: Paridade verificavel entre H2 e PostgreSQL
O changelog principal SHALL ser exercitado pelos testes H2 e PostgreSQL, e o comportamento específico de PostgreSQL SHALL ser isolado sem reduzir as invariantes comuns. As suítes existentes de unidade, contrato, transação e concorrência SHALL continuar executando sem `create`, `create-drop` ou `update` como fonte do schema.

#### Scenario: Suite H2
- **WHEN** a suíte rápida inicia um H2 vazio no perfil de teste
- **THEN** o changelog compatível cria o schema, o ORM o valida e todos os testes existentes passam sem chamar provedores externos.

#### Scenario: Suite PostgreSQL
- **WHEN** os testes de integração iniciam PostgreSQL isolado
- **THEN** as mesmas migrations aplicáveis criam o schema e permanecem verdes os cenários de lock, concorrência, rollback transacional, unicidade e normalização.

