## Context

O backend Spring possui autenticação administrativa por sessão/CSRF, entidades financeiras globais e Liquibase com H2/PostgreSQL. O frontend já usa cookie de sessão via Nginx. Ver proposal e specs para o comportamento novo.

## Goals / Non-Goals

**Goals:** introduzir propriedade com a menor mudança estrutural segura, reutilizar proteções existentes e migrar o banco atual de forma verificável.

**Non-Goals:** múltiplas carteiras, recuperação por e-mail, papéis, compartilhamento, MFA e exclusão física no MVP.

## Decisions

### Uma carteira implícita por usuário

Criar `user_account` e uma `portfolio` padrão; recursos privados recebem `owner_id` ou `portfolio_id` conforme sua agregação. Para reduzir escopo, não haverá seletor de carteiras. Alternativa de apenas adicionar `user_id` a tudo foi rejeitada porque mistura identidade e agregado financeiro; múltiplas carteiras continuam backlog.

Ativos cadastrados e corretoras serão vínculos privados no MVP, mesmo quando representem a mesma entidade externa. Isso simplifica isolamento e preserva os endpoints atuais; normalização global pode ser evolução posterior.

### Propriedade derivada da sessão

Controllers não aceitam proprietário. Services recebem um contexto autenticado e repositories não expõem consultas privadas sem escopo. Foreign keys/uniques incluem propriedade onde uma referência cruzada seria possível; cache inclui proprietário. PostgreSQL RLS não entra no MVP por complexidade com pool/H2, mas testes horizontais cobrem toda superfície.

### Conta local primeiro

Reutilizar Spring Security, sessão server-side, rotação de ID, cookie HttpOnly/SameSite, CSRF e rate limit atuais. A conta usa nome, e-mail canônico e hash adaptativo. Perfil contém somente nome/e-mail; troca de senha exige senha atual; desativação revoga sessões e preserva o histórico. Não haverá exclusão física nem recuperação de senha.

Google é uma etapa isolada e secundária, ativada por flag depois dos gates locais. Authorization Code/OIDC roda no backend; Client ID/Secret apenas em variáveis. Usar issuer/audience/state/nonce e `sub`, sem associação automática apenas por e-mail. Alternativa de SDK/token no frontend foi rejeitada por ampliar exposição e duplicar sessão.

### Migração Liquibase expand/backfill/contract

1. Criar tabelas/colunas anuláveis e índices.
2. Criar conta e carteira legado preservando hash do admin.
3. Preencher propriedade em corretora, ação, transação e posição.
4. Reconciliar contagens, FKs, quantidades, preços e totais.
5. Tornar propriedade obrigatória e remover a regra singleton após aceite.

Backup/restore é o rollback para a contração; antes dela, a versão anterior permanece utilizável. Changesets e testes continuam compatíveis com H2 e PostgreSQL.

### Compatibilidade MySQL como decisão pendente

O README histórico menciona “PostgreSQL / MySQL”, mas o runtime e a validação atuais estão concretamente em H2/PostgreSQL. Até revisar o enunciado original, MySQL não integra aceite nem estimativa. Se compatibilidade executável for exigida, serão adicionados driver/perfil, ajustes Liquibase e suíte dedicada, estimados separadamente em 12–20 horas.

## Risks / Trade-offs

- [Query/cache sem proprietário] → APIs de repository escopadas, constraints e matriz negativa com dois usuários.
- [Backfill atribui dado errado] → único proprietário legado, preflight, relatório e restore drill.
- [Google aumenta prazo] → gate secundário, flag desligada e login local independente.
- [Desativação versus retenção] → preservar dados no MVP e decidir exclusão em mudança futura.

## Migration Plan

Ensaiar em cópia sanitizada, capturar inventário antes/depois, executar H2 e PostgreSQL, implantar schema expandido, migrar legado, liberar versão escopada e somente então contrair. Rollback antes da contração reverte aplicação; após ela restaura backup ensaiado.
