## Purpose

Disponibilizar um runtime reproduzível e seguro para a API de investimentos e PostgreSQL, com inicialização ordenada, persistência e diagnóstico operacional.

## ADDED Requirements

### Requirement: Imagem de aplicacao minima e nao privilegiada
A imagem da aplicação SHALL ser produzida em múltiplas etapas com Java 17, executar o artefato Spring Boot em uma camada de runtime sem ferramentas de compilação e usar identidade não-root. O contexto de build MUST NOT incluir Git, saídas locais, relatórios, configurações de IDE ou arquivos de segredo.

#### Scenario: Build reproduzivel
- **WHEN** a imagem é construída a partir de uma revisão limpa
- **THEN** o JAR é gerado com a versão Java suportada, a imagem final contém somente o runtime necessário e uma segunda construção pode reutilizar camadas de dependências inalteradas.

#### Scenario: Inspecao de seguranca
- **WHEN** imagem, usuário efetivo e contexto de build são inspecionados
- **THEN** o processo não executa como root e nenhum `.env`, token, senha, diretório `.git` ou artefato de teste está incorporado.

### Requirement: Composicao com aplicacao e PostgreSQL saudaveis
A composição SHALL declarar a API e PostgreSQL na mesma rede interna, fornecer o hostname do serviço de banco ao datasource, aguardar saúde real do PostgreSQL antes de iniciar a aplicação e avaliar a saúde da própria API. Portas do host SHALL ser parametrizáveis sem mudar a comunicação interna.

#### Scenario: Inicializacao completa
- **WHEN** a composição é iniciada com configuração válida e volume novo
- **THEN** PostgreSQL fica saudável, a aplicação aplica migrations, valida o schema e somente então fica saudável e acessível na porta publicada.

#### Scenario: Banco indisponivel
- **WHEN** PostgreSQL não aceita conexões ou possui credenciais inválidas
- **THEN** ele não fica saudável, a aplicação não é apresentada como pronta e o diagnóstico pode ser obtido sem revelar a senha.

#### Scenario: Porta externa alternativa
- **WHEN** a porta padrão da API ou do PostgreSQL está ocupada no host
- **THEN** o operador escolhe outra porta externa por configuração, mantendo API e banco nas portas internas documentadas.

### Requirement: Dados persistentes e operacoes destrutivas explicitas
Os dados PostgreSQL SHALL residir em volume nomeado e sobreviver à remoção e recriação dos containers. A remoção do volume SHALL exigir comando destrutivo separado, documentado com aviso e condicionado a backup quando houver dados relevantes.

#### Scenario: Recriacao sem perda
- **WHEN** uma ação, corretora, transação e posição foram persistidas e a composição é encerrada sem remover volumes
- **THEN** uma nova inicialização preserva os registros, não reaplica migrations concluídas e mantém as invariantes da carteira.

#### Scenario: Reset deliberado
- **WHEN** o operador solicita explicitamente a remoção de volumes em ambiente descartável
- **THEN** a perda de dados é anunciada e a próxima inicialização reconstrói um banco vazio pelas migrations.

### Requirement: Configuracao containerizada sem segredo versionado
A composição SHALL receber senha do PostgreSQL e credenciais dos provedores externamente, sem padrão secreto, sem copiá-las para a imagem e sem registrá-las em saídas versionadas. Valores não secretos SHALL possuir exemplos seguros e defaults locais apenas quando não reduzirem a proteção.

#### Scenario: Segredo ausente
- **WHEN** uma senha obrigatória ou credencial exigida pelo perfil containerizado não é fornecida
- **THEN** a configuração ou inicialização falha sem adotar senha conhecida e sem iniciar uma API falsamente saudável.

#### Scenario: Configuracao renderizada
- **WHEN** o operador valida a composição antes da execução
- **THEN** a documentação alerta que a saída resolvida pode conter segredos e proíbe seu armazenamento em logs, issues ou commits.

### Requirement: Aceitacao completa em containers
A aceitação SHALL validar sintaxe da composição, build da imagem, healthchecks, histórico de migrations, reinicialização com volume e endpoints locais da API. Ela SHALL preservar as suítes Maven e E2E existentes e MUST NOT substituir seus provedores isolados por chamadas financeiras reais.

#### Scenario: Jornada operacional local
- **WHEN** a pilha é construída e iniciada com valores locais fictícios ou segredos de desenvolvimento fornecidos fora do Git
- **THEN** os dois serviços ficam saudáveis, o schema possui todas as migrations, a API responde localmente e a reinicialização comprova persistência sem alterar contratos de negócio.

#### Scenario: Regressao preservada
- **WHEN** a implementação de runtime é candidata a aceitação
- **THEN** testes H2, integração PostgreSQL, concorrência, frontend unitário/build, E2E Angular/Spring e validações OpenSpec/workflow continuam aprovados.
