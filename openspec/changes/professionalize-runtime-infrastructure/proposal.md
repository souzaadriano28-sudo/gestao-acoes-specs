## Why

O backend ainda combina configuração externa parcial com valores locais fixos, delega criação e alteração do schema ao Hibernate e não possui uma topologia reproduzível para executar aplicação e PostgreSQL. Isso torna segredos, evolução de bancos existentes e paridade de runtime mais frágeis justamente onde o domínio exige integridade transacional e concorrente.

## What Changes

- Fase 1 — externalizar perfil, datasource, credenciais, endpoints de provedores e origem CORS por variáveis de ambiente; versionar somente um modelo sem segredos e proteger todos os arquivos `.env` locais no Git e no contexto de build.
- Fase 2 — tornar Liquibase a autoridade exclusiva do schema de `acao`, `corretora`, `transacao` e `posicao_carteira`; portar o estado real das entidades, constraints e scripts SQL existentes para changelogs ordenados, com Hibernate em `validate`, rollback e estratégia explícita para bancos vazios e bancos preexistentes.
- Fase 3 — entregar uma composição completa de três containers: frontend Angular compilado em imagem multi-stage e servido por Nginx sem privilégios, backend Spring Boot em imagem multi-stage Java 17 e PostgreSQL 17 persistente; conectar os serviços por rede interna, healthchecks e ordem de inicialização, com proxy `/api`, fallback de SPA e configuração sem segredos versionados.
- Preservar contratos HTTP, regras monetárias, atomicidade, locks de concorrência, integrações externas, E2E Angular/Spring, testes H2 e PostgreSQL e os workflows existentes.
- Exigir testes de migration em banco vazio, baseline controlada de banco existente, idempotência, rollback, persistência do volume e uma jornada completa em containers antes da aceitação.

## Capabilities

### New Capabilities

- `database-schema-migrations`: versionamento, baseline, evolução, rollback e validação do schema financeiro em H2 e PostgreSQL.
- `containerized-runtime`: build seguro da aplicação e execução reproduzível com PostgreSQL persistente e serviços saudáveis.

### Modified Capabilities

- `application-integration`: ampliar o contrato de credenciais externas para toda a configuração de runtime, proteção de arquivos locais e comportamento fail-fast por perfil.

## Impact

- Repositórios afetados na implementação: raiz/OpenSpec, `gestao-acoes-spring` e `gestao-acoes-ui`.
- Arquivos previstos no backend: `pom.xml`, propriedades Spring, validação/configuração tipada, `.gitignore`, `.env.example`, changelogs Liquibase, migração dos scripts em `db/stabilization`, testes, documentação, `.dockerignore` e `Dockerfile`.
- Arquivos previstos no frontend e na composição: configuração de URLs relativas e proxy local Angular, `.dockerignore`, `Dockerfile`, configuração Nginx sem privilégios com fallback SPA/proxy `/api`, documentação e `compose.yaml` de três serviços.
- Dependência nova: `liquibase-core`, gerenciada pelo BOM do Spring Boot 4.0.6. A imagem de runtime continua em Java 17 e o banco alvo continua PostgreSQL.
- Não há mudança intencional nos endpoints, payloads, cálculos, identificadores, integrações ou semântica concorrente existentes.
