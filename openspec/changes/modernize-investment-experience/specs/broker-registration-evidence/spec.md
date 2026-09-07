## Purpose

Evitar alegações regulatórias indevidas ao separar dados empresariais de evidência oficial sobre o registro de intermediários no mercado de valores mobiliários.

## ADDED Requirements

### Requirement: BR-01 Cadastro empresarial separado de autorização
O sistema SHALL tratar CNPJ, razão social, nome fantasia, endereço, CNAE e situação cadastral empresarial como dados cadastrais, não como prova de autorização pela CVM ou pelo Banco Central. A aceitação de uma corretora acadêmica por CNAE MUST NOT definir `validadaNaCvm=true` nem exibir selo de instituição autorizada.

#### Scenario: CNAE aceito sem consulta oficial
- **WHEN** CNPJ e CNAE passam nas validações atuais, mas não houve consulta ao cadastro oficial de participantes
- **THEN** a corretora pode ser cadastrada para simulação com evidência regulatória `NOT_CHECKED`, sem alegação de validação CVM.

#### Scenario: Situação cadastral ativa
- **WHEN** a fonte empresarial informa situação ativa
- **THEN** a interface apresenta “situação cadastral ativa” associada à fonte empresarial e não “corretora autorizada”.

### Requirement: BR-02 Evidência oficial rastreável
Quando a verificação regulatória fizer parte da implementação, o backend SHALL consultar ou importar fonte oficial atual de participantes autorizados da CVM/BCB e retornar estado, categoria, fonte, identificador de evidência e instante de verificação. Falha, ausência ou desatualização SHALL produzir estado explícito diferente de autorizado; o frontend MUST NOT completar o resultado por nome, CNAE ou similaridade de CNPJ.

#### Scenario: Participante encontrado
- **WHEN** o CNPJ é encontrado como intermediário vigente na fonte oficial suportada
- **THEN** a API retorna `VERIFIED`, categoria, fonte oficial e instante de verificação.

#### Scenario: Participante não encontrado
- **WHEN** o CNPJ não é encontrado na fonte oficial consultada
- **THEN** a API retorna `NOT_FOUND` com data da consulta e a interface evita concluir que a instituição é irregular ou autorizada.

#### Scenario: Fonte indisponível
- **WHEN** a consulta oficial falha ou os dados excedem o limite de atualidade
- **THEN** a API retorna `UNAVAILABLE` ou `STALE`, preserva o cadastro acadêmico e não reutiliza `VERIFIED` sem indicar antiguidade.

### Requirement: BR-03 Minimização e apresentação de dados
A interface SHALL exibir somente dados de corretora necessários ao cadastro e seleção acadêmica. CNPJ SHALL ser formatado para leitura, identificadores internos não SHALL ocupar a hierarquia principal e dados de contato/endereço opcionais SHALL ser omitidos quando ausentes. Qualquer futuro dado de usuário MUST seguir finalidade, necessidade, segurança e transparência antes de integrar esta experiência.

#### Scenario: Cartão de corretora
- **WHEN** uma corretora possui razão social, nome fantasia, CNPJ, cidade/UF e evidência
- **THEN** esses dados são apresentados em hierarquia clara com fonte/estado da evidência, sem expor campos vazios ou promover o id interno.

#### Scenario: Dado opcional ausente
- **WHEN** telefone, email ou complemento não existem
- **THEN** a interface omite as linhas correspondentes em vez de inventar conteúdo.
