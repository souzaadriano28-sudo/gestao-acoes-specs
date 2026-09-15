## Purpose

Permitir contas locais independentes e garantir que cada pessoa acesse exclusivamente sua própria carteira e seus recursos financeiros.

## ADDED Requirements

### Requirement: MU-01 Cadastro e conta local
O sistema SHALL permitir cadastro com nome, e-mail canônico e senha, exigir e-mail único e política de senha, e criar uma carteira padrão para a nova conta. SHALL oferecer perfil mínimo, troca de senha e desativação; recuperação por e-mail MUST NOT ser exibida neste MVP.

#### Scenario: Cadastro válido
- **WHEN** uma pessoa informa nome, e-mail novo e senha válida
- **THEN** recebe conta e carteira próprias sem dados de qualquer outra pessoa.

#### Scenario: Conta desativada
- **WHEN** a pessoa confirma a desativação
- **THEN** suas sessões são encerradas, novo login é bloqueado e os dados ficam preservados conforme a política do MVP.

### Requirement: MU-02 Propriedade completa
Corretoras, ativos cadastrados, operações, posições e leituras de carteira SHALL pertencer ao proprietário autenticado. O proprietário SHALL vir da sessão e MUST NOT ser aceito do corpo, query ou header controlado pelo cliente.

#### Scenario: Dois usuários com dados semelhantes
- **WHEN** duas contas cadastram ticker ou CNPJ iguais
- **THEN** cada uma vê seus próprios vínculos, operações, posições e carteira sem colisão ou compartilhamento implícito.

### Requirement: MU-03 Autorização horizontal
Toda consulta e mutação privada SHALL validar propriedade, inclusive acesso direto por ID, filtros, paginação e cache. Recurso alheio SHALL produzir resposta não enumerável e nenhuma alteração.

#### Scenario: ID de outro usuário
- **WHEN** o usuário A chama diretamente uma API com o ID pertencente ao usuário B
- **THEN** nenhum dado de B é revelado ou alterado e a resposta não confirma a existência do recurso.

### Requirement: MU-04 Migração do legado
O administrador e todos os dados atuais SHALL migrar para uma conta proprietária legado sem perda, duplicação ou troca de valores, com preflight, reconciliação e rollback operacional.

#### Scenario: Reconciliação do banco atual
- **WHEN** a migração é ensaiada sobre cópia do banco atual
- **THEN** contagens, relações, quantidades e valores antes/depois coincidem e nenhum recurso fica sem proprietário.

### Requirement: MU-05 Google secundário e sem segredo
Google OAuth/OIDC SHALL permanecer desabilitado até cadastro local e isolamento serem aceitos. Quando habilitado, Client ID e Client Secret SHALL existir somente no ambiente do backend; associação SHALL usar identidade validada e MUST NOT ocorrer apenas por coincidência de e-mail.

#### Scenario: Configuração Google ausente
- **WHEN** as variáveis Google não estão configuradas
- **THEN** cadastro e login locais funcionam e a opção Google não é apresentada como disponível.

#### Scenario: Segredo protegido
- **WHEN** frontend, Git, imagem e logs são inspecionados
- **THEN** nenhum Client Secret, token ou credencial OAuth está presente.
