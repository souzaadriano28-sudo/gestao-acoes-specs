## Purpose

Definir verificações contínuas, reproduzíveis e diagnosticáveis que protejam as branches principais dos repositórios de backend, frontend e especificações e os pull requests destinados a elas.

## ADDED Requirements

### Requirement: Validação sem duplicidade
Cada um dos três repositórios SHALL executar uma única validação obrigatória para cada atualização de pull request destinado à sua branch principal e para cada push que já tenha chegado à branch principal. Pushes em branches de trabalho não SHALL iniciar uma segunda validação equivalente. Uma execução mais nova da mesma referência SHALL cancelar somente a execução obsoleta correspondente, sem cancelar validações de outras branches ou pull requests.

#### Scenario: Push na branch principal
- **WHEN** um commit chega a `main` nos repositórios de specs ou backend, ou a `master` no frontend
- **THEN** o repositório inicia uma validação obrigatória exatamente uma vez para esse evento.

#### Scenario: Push em branch de trabalho
- **WHEN** um commit é enviado a uma branch que não é a principal
- **THEN** o evento de push não inicia a validação obrigatória e a futura atualização do pull request fornece o único gate correspondente.

#### Scenario: Atualização de pull request
- **WHEN** um pull request destinado a `main` em specs/backend ou a `master` no frontend é aberto ou recebe um novo commit
- **THEN** o repositório inicia uma validação obrigatória exatamente uma vez para a revisão atual e cancela apenas uma revisão anterior ainda em execução do mesmo pull request.

### Requirement: Qualidade do backend
A validação do backend SHALL usar Java 17 e o Maven Wrapper versionado no próprio repositório para compilar e executar a suíte automatizada, sem depender de uma instalação global do Maven.

#### Scenario: Backend válido
- **WHEN** a validação do backend recebe uma revisão cuja compilação e testes passam com Java 17
- **THEN** a verificação obrigatória termina com sucesso usando o Maven Wrapper.

#### Scenario: Falha de compilação ou teste
- **WHEN** a compilação ou qualquer teste do backend falha
- **THEN** a verificação obrigatória termina com falha e identifica a etapa e os relatórios de teste correspondentes.

### Requirement: Qualidade do frontend
A validação obrigatória do frontend SHALL usar Node 24.16.0, instalar as dependências exclusivamente a partir do lockfile com `npm ci`, executar `npm test -- --watch=false` no Ubuntu da CI e produzir o build de produção. A execução local equivalente no Windows SHALL usar `npm.cmd test -- --watch=false`. A falha de qualquer uma dessas fases SHALL impedir o sucesso da validação.

#### Scenario: Frontend válido
- **WHEN** instalação, testes e build concluem sem erro para uma revisão do frontend
- **THEN** a verificação obrigatória termina com sucesso sem alterar o lockfile.

#### Scenario: Lockfile ou fase inválida
- **WHEN** `npm ci`, testes ou build falha
- **THEN** a verificação obrigatória termina com falha e evidencia qual fase falhou.

### Requirement: E2E executado somente de forma segura
O E2E do frontend MUST permanecer separado da validação obrigatória e ser acionado somente por `workflow_dispatch` nesta versão. Sua execução SHALL exigir `backend_sha` e `frontend_sha` como commits completos e imutáveis, SHALL usar Node 24.16.0 e o Chromium da versão do Playwright bloqueada em `package-lock.json`, SHALL acessar os repositórios públicos apenas com `GITHUB_TOKEN`, e SHALL usar somente serviços locais, perfil Spring `test`, H2 e provedores simulados. A execução não SHALL consultar provedores financeiros externos, reutilizar processos preexistentes ou aceitar token personalizado.

#### Scenario: Execução E2E autorizada
- **WHEN** o E2E é acionado explicitamente com commits completos e acessíveis de backend e frontend
- **THEN** essas revisões são obtidas com `GITHUB_TOKEN`, Chromium compatível é instalado pelo Playwright, os serviços efêmeros são iniciados e o resultado identifica os dois SHAs testados.

#### Scenario: Revisão ausente ou mutável
- **WHEN** o acionamento E2E não informa commits completos e acessíveis de backend e frontend
- **THEN** a execução falha antes de iniciar aplicações ou navegador com um diagnóstico da precondição inválida.

#### Scenario: Tentativa de acesso externo
- **WHEN** o ambiente E2E não pode comprovar que todos os endpoints de provedores apontam para o stub local
- **THEN** a jornada falha antes de executar operações da aplicação e nenhuma credencial real é solicitada.

### Requirement: Validade estrita das especificações
A validação do repositório de especificações SHALL usar `package.json` e `package-lock.json` mínimos exclusivamente para fixar OpenSpec 1.12.0 e SHALL validar em modo estrito as especificações principais e todas as mudanças ativas suportadas pelo CLI. Conteúdo inválido SHALL impedir o sucesso da verificação.

#### Scenario: OpenSpec válido
- **WHEN** as especificações principais e mudanças ativas satisfazem a validação estrita
- **THEN** a verificação obrigatória do repositório de especificações termina com sucesso e informa os alvos validados.

#### Scenario: OpenSpec inválido
- **WHEN** qualquer alvo OpenSpec coberto contém erro de estrutura ou requisito
- **THEN** a verificação obrigatória termina com falha e identifica o alvo e o diagnóstico do validador.

### Requirement: Execução mínima, cache seguro e diagnóstico
As automações SHALL conceder apenas permissão de leitura do conteúdo por padrão e SHALL fixar cada action por SHA confiável com comentário indicando sua versão. O job de specs SHALL ter timeout de 5 minutos, os jobs obrigatórios de backend e frontend de 15 minutos e o E2E de 20 minutos. Caches SHALL conter apenas artefatos reutilizáveis dos gerenciadores de dependências, ser particionados por sistema, ferramenta e arquivo de dependências e não SHALL conter build, relatórios, dados da aplicação ou segredos. Relatórios disponíveis quando houver falha SHALL ser preservados por exatamente 7 dias e sem incluir credenciais.

#### Scenario: Pull request não confiável
- **WHEN** a validação processa código de um pull request sem confiança prévia
- **THEN** ela não recebe permissão de escrita nem segredo, não executa código com contexto privilegiado e só restaura cache compatível com seus arquivos de dependências.

#### Scenario: Cache incompatível
- **WHEN** o sistema, a versão da ferramenta ou o arquivo de dependências difere da entrada armazenada
- **THEN** a automação não trata o cache incompatível como válido e resolve as dependências a partir das fontes declaradas.

#### Scenario: Etapa com falha
- **WHEN** uma compilação, teste, build, E2E ou validação OpenSpec falha
- **THEN** o job termina com estado de falha, mantém o log da etapa claramente nomeada e publica por 7 dias os relatórios disponíveis mesmo que uma etapa anterior tenha falhado.

#### Scenario: Primeira execução aprovada
- **WHEN** um workflow conclui sua primeira execução aprovada
- **THEN** seu check fica apto a ser configurado manualmente como obrigatório na proteção da branch principal, sem mutação automática dessa proteção pelo workflow.

### Requirement: Falha controlada temporária
Esta exigência temporária SHALL tornar a validação estrita vermelha.
