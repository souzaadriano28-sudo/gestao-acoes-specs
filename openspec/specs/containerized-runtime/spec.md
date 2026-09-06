# Containerized Runtime Specification

## Purpose

Disponibilizar um runtime reproduzível e seguro para o frontend Angular, a API Spring Boot e PostgreSQL 17, com roteamento interno, inicialização ordenada, persistência e diagnóstico operacional.

## Requirements

### Requirement: Imagens de aplicacao minimas e nao privilegiadas
As imagens de frontend e backend SHALL ser produzidas em múltiplas etapas. O frontend SHALL compilar Angular separadamente e servir somente os artefatos de produção por Nginx com identidade não-root. O backend SHALL usar Java 17, executar o artefato Spring Boot em uma camada de runtime sem ferramentas de compilação e usar identidade não-root. Os contextos de build MUST NOT incluir Git, saídas locais, relatórios, configurações de IDE ou arquivos de segredo.

#### Scenario: Build reproduzivel
- **WHEN** a imagem é construída a partir de uma revisão limpa
- **THEN** os artefatos Angular e o JAR são gerados nas versões suportadas, cada imagem final contém somente seu runtime necessário e uma segunda construção pode reutilizar camadas de dependências inalteradas.

#### Scenario: Inspecao de seguranca
- **WHEN** imagens, usuários efetivos e contextos de build são inspecionados
- **THEN** nenhum processo executa como root e nenhum `.env`, token, senha, diretório `.git` ou artefato de teste está incorporado.

### Requirement: Entrada web unica com SPA e proxy de API
O frontend SHALL usar URLs relativas sob `/api` tanto no runtime containerizado quanto no desenvolvimento local. Nginx SHALL retornar a aplicação Angular para rotas de cliente, encaminhar `/api` ao backend pela rede interna e oferecer saúde própria sem expor detalhes sensíveis. O servidor de desenvolvimento Angular SHALL encaminhar o mesmo prefixo relativo para o backend local.

#### Scenario: Navegacao SPA
- **WHEN** o usuário abre diretamente uma rota válida da aplicação que não corresponde a um arquivo estático
- **THEN** Nginx retorna `index.html`, Angular assume a navegação e arquivos realmente ausentes não substituem respostas da API.

#### Scenario: Proxy de API no container
- **WHEN** o navegador chama um endpoint relativo sob `/api` pelo endereço publicado do frontend
- **THEN** Nginx remove somente o prefixo de entrada `/api` e encaminha ao contrato HTTP existente do backend pela rede interna, preservando método, sufixo do caminho e resposta sem exigir URL absoluta ou CORS entre portas do host.

#### Scenario: Proxy de API local
- **WHEN** Angular é executado pelo servidor de desenvolvimento e o browser chama `/api`
- **THEN** a configuração de proxy local encaminha a solicitação ao backend local sem alterar o código ou recompilar para outro endereço.

### Requirement: Composicao com tres servicos saudaveis
A composição SHALL declarar frontend, backend e PostgreSQL 17 na mesma rede interna, fornecer os hostnames de serviço às conexões internas, aguardar saúde real do PostgreSQL antes do backend e saúde real do backend antes do frontend, e avaliar a saúde dos três serviços. Portas do host SHALL ser parametrizáveis sem mudar a comunicação interna.

#### Scenario: Inicializacao completa
- **WHEN** a composição é iniciada com configuração válida e volume novo
- **THEN** PostgreSQL fica saudável, o backend aplica migrations e valida o schema, e somente então frontend, backend e banco ficam saudáveis e o frontend fica acessível na porta publicada.

#### Scenario: Banco indisponivel
- **WHEN** PostgreSQL não aceita conexões ou possui credenciais inválidas
- **THEN** ele não fica saudável, backend e frontend não são apresentados como prontos e o diagnóstico pode ser obtido sem revelar a senha.

#### Scenario: Exposicao minima e porta externa alternativa
- **WHEN** a porta padrão do frontend ou uma porta diagnóstica opcional está ocupada no host
- **THEN** o operador escolhe outra porta externa por configuração, mantendo as portas e conexões internas documentadas; backend e PostgreSQL não exigem publicação no host para o uso normal pelo navegador.

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
A aceitação SHALL validar sintaxe da composição, build das três imagens, healthchecks, histórico de migrations, reinicialização com volume, navegação SPA, proxy `/api` e endpoints do backend. Ela SHALL preservar as suítes Maven e frontend, executar E2E contra o ambiente containerizado e MUST NOT substituir provedores isolados por chamadas financeiras reais.

#### Scenario: Jornada operacional local
- **WHEN** a pilha é construída e iniciada com valores locais fictícios ou segredos de desenvolvimento fornecidos fora do Git
- **THEN** os três serviços ficam saudáveis, o schema possui todas as migrations, o frontend responde, `/api` alcança o backend pela rede interna e a reinicialização comprova persistência sem alterar contratos de negócio.

#### Scenario: Regressao preservada
- **WHEN** a implementação de runtime é candidata a aceitação
- **THEN** testes H2, integração PostgreSQL, concorrência, frontend unitário/build/auditoria, E2E Angular/Spring contra a pilha containerizada e validações OpenSpec/workflow continuam aprovados.
