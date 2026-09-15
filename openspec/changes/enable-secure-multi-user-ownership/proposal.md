## Why

O Atlas usa uma conta administrativa única e recursos financeiros globais. Cadastro multiusuário só pode ser aberto depois que autenticação, propriedade e migração impedirem acesso horizontal e preservarem os dados atuais.

## What Changes

- Criar cadastro local com nome, e-mail e senha, login profissional, sessão server-side, cookie HttpOnly e CSRF.
- Criar perfil mínimo, troca de senha e desativação de conta; recuperação por e-mail fica fora do MVP.
- Vincular corretoras, ativos cadastrados, operações, posições e carteira ao proprietário autenticado.
- Negar acesso direto a IDs de outro usuário e impedir vazamento em listas, buscas, caches e erros.
- Migrar o administrador e todos os dados atuais para uma conta proprietária legado com reconciliação e rollback.
- Validar o isolamento com pelo menos dois usuários em testes unitários, integração, autorização horizontal e E2E.
- Manter Google OAuth/OIDC como prioridade secundária: somente depois do aceite do cadastro local e isolamento, com configuração exclusivamente por variáveis de ambiente e sem segredos no frontend/Git/logs.
- **BREAKING**: remover a premissa de recursos globais e exigir proprietário derivado da sessão em toda API financeira.
- Dependência: mudança fundacional; `streamline-catalog-and-transactions` e `add-essential-portfolio-insights` dependem dela.

## Capabilities

### New Capabilities

- `multi-user-ownership`: contas locais, ciclo mínimo de conta, propriedade, migração legado e isolamento horizontal.

### Modified Capabilities

- `secure-admin-authentication`: substituir autenticação singleton por cadastro/login multiusuário, preservando sessão, cookie e CSRF seguros.
- `transaction-integrity`: escopar operações e posições pelo proprietário autenticado.
- `portfolio-read-model`: escopar todas as leituras da carteira pelo proprietário.
- `investment-workspace-ui`: adicionar cadastro, perfil mínimo, troca de senha e desativação.
- `application-integration`: cobrir migração, dois usuários, OAuth secundário, Docker e segurança ponta a ponta.
- `database-schema-migrations`: preservar H2/PostgreSQL e registrar compatibilidade MySQL executável como decisão pendente.

## Impact

Liquibase, entidades/repositórios/serviços Spring, Spring Security, contratos `/auth` e `/me`, queries e caches, guards/telas Angular e suites de teste. Risco alto de vazamento ou migração incorreta; exige backfill ensaiado, contagens reconciliadas e testes negativos sistemáticos.
