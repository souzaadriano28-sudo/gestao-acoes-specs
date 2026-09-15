## ADDED Requirements

### Requirement: AI-06 Jornada multiusuário integrada
A pilha completa SHALL provar cadastro/login local, isolamento horizontal e migração em H2 e PostgreSQL, com pelo menos duas contas e os três containers saudáveis. Google, quando habilitado, SHALL usar apenas configuração de ambiente.

#### Scenario: Dois usuários no E2E
- **WHEN** o E2E cria usuários A e B, cadastra dados distintos e tenta trocar IDs nas APIs
- **THEN** jornadas próprias funcionam, acessos cruzados falham e nenhum dado é compartilhado.

#### Scenario: Containers sem OAuth
- **WHEN** Compose inicia sem configuração Google
- **THEN** frontend, backend e PostgreSQL ficam saudáveis e o login local funciona.
