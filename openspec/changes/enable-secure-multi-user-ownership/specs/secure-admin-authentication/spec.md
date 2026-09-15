## MODIFIED Requirements

### Requirement: SA-02 Login e respostas não enumeráveis
O sistema SHALL autenticar e-mail e senha de conta local por comparação segura com hash persistido. Falhas por conta inexistente, senha incorreta, conta desativada ou bloqueio SHALL usar resposta genérica; sucesso SHALL renovar a sessão e retornar somente identidade pública mínima.

#### Scenario: Credencial válida
- **WHEN** uma conta ativa informa e-mail e senha corretos e não está limitada
- **THEN** recebe sessão renovada sem senha, hash ou detalhes internos.

#### Scenario: Credencial inválida
- **WHEN** e-mail ou senha não corresponde
- **THEN** a resposta é genérica, nenhuma sessão autenticada é criada e o log contém somente metadados seguros.

#### Scenario: Campo vazio
- **WHEN** e-mail ou senha está vazio ou excede limites
- **THEN** a requisição é recusada sem ecoar senha ou distinguir existência da conta.

### Requirement: SA-06 Autorização de endpoints e rotas
Somente CSRF, cadastro, login e healthchecks mínimos SHALL ser públicos; OAuth estritamente necessário poderá ser público quando habilitado. Demais endpoints SHALL exigir usuário autenticado e propriedade, com negação por padrão.

#### Scenario: API anônima
- **WHEN** cliente sem sessão chama endpoint de negócio
- **THEN** recebe 401 JSON sem execução do recurso.

#### Scenario: Rota Angular protegida
- **WHEN** pessoa anônima abre rota da carteira
- **THEN** é enviada ao login e retorna apenas a destino interno validado após sucesso.

#### Scenario: Caminho externo como retorno
- **WHEN** o retorno contém URL absoluta, host ou caminho proibido
- **THEN** ele é ignorado e o destino é a Visão geral.

### Requirement: SA-07 Experiência de login e logout acessível
Login e cadastro SHALL ser responsivos, profissionais e acessíveis, com nome/e-mail/senha conforme o fluxo, mostrar/ocultar senha, estado pendente e erros associados. Logout SHALL encerrar a sessão; recuperação por e-mail MUST NOT aparecer.

#### Scenario: Mostrar senha
- **WHEN** a pessoa alterna a visibilidade
- **THEN** valor e foco são preservados e o nome acessível do controle é atualizado.

#### Scenario: Envio pendente
- **WHEN** login ou cadastro aguarda resposta
- **THEN** envio duplicado é bloqueado e o estado é anunciado.

#### Scenario: Erro genérico
- **WHEN** login é recusado ou limitado
- **THEN** a mensagem não enumera contas e o foco é conduzido de forma acessível.

#### Scenario: Reflow móvel
- **WHEN** a tela usa 320 ou 390 CSS px com zoom de 200%
- **THEN** todos os campos e ações funcionam sem rolagem horizontal.

### Requirement: SA-08 Escopo mínimo e observabilidade segura
O MVP SHALL oferecer cadastro local e ciclo mínimo de conta, mas MUST NOT oferecer recuperação por e-mail, MFA, múltiplos papéis ou gestão administrativa de usuários. Google SHALL seguir MU-05. Logs MUST NOT conter senha, hash, cookie, token CSRF, segredo OAuth ou e-mail completo quando a minimização permitir.

#### Scenario: Superfície pública
- **WHEN** rotas públicas são enumeradas
- **THEN** existem apenas CSRF, cadastro/login local, OAuth habilitado e healthchecks necessários, sem recuperação por e-mail.

#### Scenario: Inspeção de logs
- **WHEN** cadastro, login, falha, desativação e logout são exercitados
- **THEN** os logs não contêm credenciais, tokens, cookies ou PII desnecessária.

## REMOVED Requirements

### Requirement: SA-01 Administrador inicial seguro
**Reason**: O singleton administrativo é incompatível com cadastro e propriedade multiusuário.
**Migration**: Converter a conta existente em conta legado proprietária, preservando seu hash e todos os dados antes de retirar o bootstrap singleton.
