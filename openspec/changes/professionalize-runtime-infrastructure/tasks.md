## 1. Baseline and Safety Inventory

- [x] 1.1 Registrar branches/commits limpos dos três repositórios, versões de Java/Maven/Docker/Compose e portas relevantes antes da implementação; verificar que a coleta não altera arquivos.
- [x] 1.2 Inventariar as quatro entidades e comparar schema gerado em H2 e PostgreSQL com constraints e scripts de estabilização atuais; registrar tabela, coluna, tipo, identidade, nulabilidade, FK, índice, unique e check antes de escrever o changelog.
- [x] 1.3 Executar e registrar a linha de base de `mvnw verify`, teste PostgreSQL de concorrência, frontend unitário/build e E2E Angular/Spring isolado; verificar quantidades, tempos e ausência de testes ignorados.
- [x] 1.4 Executar busca por segredos e configurações fixas nos arquivos versionados e produzir a matriz de variáveis, perfis, obrigatoriedade, defaults seguros e consumidores; verificar que nenhum valor sensível seja copiado para o registro.

## 2. Phase 1 - Environment and Secret Protection

- [x] 2.1 Proteger `.env` e variantes no `.gitignore` do backend, reabrir apenas `.env.example` e criar um modelo com valores vazios ou inequivocamente fictícios; verificar com `git check-ignore`, `git status` e busca por segredos.
- [x] 2.2 Externalizar perfil, datasource, quatro endpoints de integração, BRAPI, TwelveData e origem CORS sem mudar contratos HTTP; verificar por testes de binding e inicialização com valores alternativos.
- [x] 2.3 Centralizar e validar a configuração obrigatória por perfil, rejeitando segredo ausente, vazio ou somente espaços e emitindo apenas o nome da propriedade; verificar casos positivos e negativos automatizados sem revelar valores.
- [x] 2.4 Ajustar perfis H2 e PostgreSQL de teste para valores explicitamente fictícios e endpoints locais/substituídos; verificar que as suítes iniciem sem credenciais reais e não acessem provedores externos.
- [x] 2.5 Documentar uso por PowerShell, shells POSIX, IDE e Compose, deixando explícito que Spring não carrega `.env` sozinho e que alteração do arquivo não rotaciona credenciais persistidas; revisar exemplos para garantir que nenhum segredo funcional esteja presente.
- [x] 2.6 Executar o gate da fase 1 com backend, frontend e E2E existentes e verificar que configuração externa não mudou regras, contratos, concorrência nem isolamento.

## 3. Phase 2 - Liquibase and Financial Schema

- [x] 3.1 Adicionar `liquibase-core` sob o gerenciamento de versão do Spring Boot e criar master/changelogs ordenados; verificar a árvore Maven, a localização configurada e a validação sintática dos changelogs.
- [x] 3.2 Implementar o changelog inicial das tabelas `acao`, `corretora`, `transacao` e `posicao_carteira` a partir do inventário aprovado; comparar automaticamente e revisar manualmente todas as definições e nomes de constraints.
- [x] 3.3 Configurar Liquibase como único escritor e Hibernate `ddl-auto=validate` em desenvolvimento, H2 e PostgreSQL-test; reservar a configuração de containers para a fase 3 e verificar que nenhuma configuração ativa usa `create`, `create-drop` ou `update`.
- [x] 3.4 Criar testes H2 de banco vazio, validação ORM e segunda inicialização idempotente; verificar tabelas de controle, quantidade/ordem de changesets e ausência de reaplicação.
- [x] 3.5 Criar testes PostgreSQL equivalentes para banco vazio e reinicialização, preservando os testes de locks e concorrência; verificar migrations, schema, histórico e resultados financeiros exatos.
- [x] 3.6 Testar checksum imutável, lock de migration e divergência de schema, comprovando falha diagnóstica sem `clear-checksums`, remoção cega de lock ou mutação pelo Hibernate.
- [x] 3.7 Migrar os scripts `V001__preflight.sql` e `V002__normalize_and_constrain.sql` para uma trilha administrativa de adoção com nomes não ambíguos, preservando cobertura e ordem sem incluí-los no fluxo de banco vazio; verificar casos de bloqueio e sucesso contra PostgreSQL descartável.
- [x] 3.8 Documentar e automatizar o quanto for seguro do runbook de banco existente: backup/restore testado, preflight, decisão sobre conflitos, normalização única, comparação exata e `changelog-sync`; verificar que uma estrutura divergente não possa ser marcada como baseline.
- [x] 3.9 Declarar e testar rollback para mudanças reversíveis e para o schema inicial apenas em banco descartável; documentar restauração de backup para normalizações lossy e verificar aplicação novamente após rollback.
- [x] 3.10 Executar o gate da fase 2 com todas as suítes H2/PostgreSQL, concorrência e E2E, confirmando Hibernate `validate`, dados/IDs preservados e zero regressão funcional.

## 4. Phase 3 - Containerized Runtime

- [x] 4.1 Confirmar arquitetura e versões suportadas, selecionar imagens explícitas de Node/Angular, Nginx sem privilégios, Java 17 e PostgreSQL 17 e registrar digests revisados; verificar Docker Engine/Compose e a compatibilidade da plataforma.
- [x] 4.2 Criar `.dockerignore` no frontend e backend para excluir VCS, IDEs, builds, relatórios e todos os arquivos `.env`, preservando somente entradas necessárias; inspecionar ambos os contextos e comprovar ausência de segredos.
- [x] 4.3 Tornar `/api` o contrato relativo do frontend e adicionar proxy Angular local; verificar unit tests/build e chamadas pelo `ng serve` sem URL absoluta nem mudança de código por ambiente.
- [x] 4.4 Criar Dockerfile multi-stage do frontend e configuração Nginx sem privilégios com fallback SPA, proxy `/api` e saúde própria; construir e inspecionar conteúdo, usuário, porta, precedência das rotas e respostas.
- [x] 4.5 Adicionar saúde agregada mínima do backend sem detalhes sensíveis; verificar estados pronto/não pronto com PostgreSQL disponível e indisponível.
- [x] 4.6 Criar Dockerfile multi-stage do backend usando Java 17 e Maven Wrapper, cache de dependências, artefato final mínimo e usuário não-root; construir e inspecionar camadas, conteúdo, UID/GID e processo de entrada.
- [x] 4.7 Criar `compose.yaml` com `frontend`, `backend` e `postgres` 17, rede interna, volume nomeado, exposição mínima/loopback, healthchecks e dependências por saúde; validar serviços e configuração sem persistir a saída resolvida.
- [x] 4.8 Verificar fail-fast do Compose para segredos ausentes, credenciais inválidas, banco não saudável e colisão de porta; confirmar que imagens, logs e relatórios não expõem segredos.
- [x] 4.9 Executar uma pilha isolada com volume novo, aguardar os três healthchecks, verificar Liquibase/Hibernate, frontend, navegação SPA, proxy `/api` e endpoints do backend sem acessar provedores financeiros reais.
- [x] 4.10 Persistir registros representativos das quatro entidades, executar `down` sem volumes, reiniciar e comprovar dados, IDs, invariantes e histórico de migrations preservados.
- [x] 4.11 Ensaiar reset somente no volume descartável criado nesta execução, verificar aviso de perda e reconstrução integral por migrations, sem remover ou recomendar remoção de volumes preexistentes.
- [x] 4.12 Executar o E2E Playwright contra o frontend containerizado e o backend/PostgreSQL da composição, com dependências externas isoladas, verificando a jornada completa e ausência de tráfego a provedores reais.

## 5. Final Regression, Documentation, and Scope Review

- [x] 5.1 Executar `mvnw verify` e o teste PostgreSQL dedicado no backend final, registrando total e resultado e confirmando que nenhum teste foi removido, ignorado ou afrouxado.
- [x] 5.2 Executar instalação limpa, auditoria npm, testes unitários e build do frontend sem alterar seu manifesto/lockfile; registrar resultados e hashes antes/depois.
- [x] 5.3 Executar E2E com Angular, Spring e PostgreSQL 17 reais na pilha containerizada e dependências externas isoladas, verificando portas/recursos antes e depois, nenhum provedor externo e todos os contratos da jornada de investimentos.
- [x] 5.4 Revisar workflows dos três repositórios e executar comandos locais equivalentes; preservar permissões, SHAs, caches, timeouts e gates existentes, deixando qualquer ampliação remota de Docker pendente sem evidência de capacidade.
- [x] 5.5 Finalizar README e runbooks de configuração, migration, rollback, baseline, container, persistência, rotação de credenciais e troubleshooting; verificar comandos em ambiente descartável e registrar riscos/limitações reais.
- [x] 5.6 Revisar os diffs dos três repositórios, executar busca final por segredos e artefatos, confirmar que regras de negócio e contratos HTTP permanecem inalterados e validar `professionalize-runtime-infrastructure` e todo o OpenSpec em modo estrito.
