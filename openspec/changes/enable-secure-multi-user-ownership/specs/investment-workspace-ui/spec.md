## ADDED Requirements

### Requirement: IU-12 Conta local mínima
A interface SHALL oferecer cadastro, login, perfil mínimo, troca de senha e desativação com estados claros, acessibilidade e confirmação para ação sensível. Recuperação por e-mail MUST NOT ser exibida.

#### Scenario: Troca de senha
- **WHEN** usuário autenticado informa senha atual e nova senha válidas
- **THEN** a alteração é confirmada e sessões afetadas seguem a política apresentada.

#### Scenario: Desativação confirmada
- **WHEN** usuário confirma desativação em linguagem inequívoca
- **THEN** a sessão termina e a tela informa o estado da conta sem expor dados.
