# Runtime containerizado

Esta raiz integra os repositórios irmãos `gestao-acoes-ui` e `gestao-acoes-spring`. O `compose.yaml` constrói e inicia exatamente três serviços: frontend Angular/Nginx sem privilégios, backend Spring Boot/Java 17 sem privilégios e PostgreSQL 17 com volume nomeado.

As bases estão fixadas por versão e digest para Linux amd64: Node 24.8.0 Alpine 3.22, Nginx unprivileged 1.29.1 Alpine 3.22, Eclipse Temurin JDK/JRE 17.0.16+8 Alpine e PostgreSQL 17.6 Alpine 3.22. Atualizações exigem novo pull, revisão do digest, rebuild e repetição dos gates.

## Configuração segura

O Compose exige `DB_PASSWORD`, `BRAPI_TOKEN`, `TWELVEDATA_API_KEY`, `ADMIN_INITIAL_USERNAME` e `ADMIN_INITIAL_PASSWORD`. O arquivo `.env.example` contém somente valores deliberadamente não funcionais. Não salve um `.env` real no Git, em logs, em issues ou na saída persistida de `docker compose config`; o Spring não carrega `.env` quando executado fora do Compose. Consulte também a [documentação operacional de autenticação do backend](https://github.com/souzaadriano28-sudo/gestao-acoes-spring/blob/main/docs/authentication-operations.md).

PowerShell:

```powershell
$env:DB_PASSWORD = '<obter-do-cofre-local>'
$env:BRAPI_TOKEN = '<obter-do-cofre-local>'
$env:TWELVEDATA_API_KEY = '<obter-do-cofre-local>'
$env:ADMIN_INITIAL_USERNAME = '<obter-do-cofre-local>'
$env:ADMIN_INITIAL_PASSWORD = '<obter-do-cofre-local>'
docker compose config --quiet
docker compose up -d --build
```

Shell POSIX:

```sh
DB_PASSWORD='<obter-do-cofre-local>' \
BRAPI_TOKEN='<obter-do-cofre-local>' \
TWELVEDATA_API_KEY='<obter-do-cofre-local>' \
ADMIN_INITIAL_USERNAME='<obter-do-cofre-local>' \
ADMIN_INITIAL_PASSWORD='<obter-do-cofre-local>' \
docker compose up -d --build
```

O frontend é publicado somente em `127.0.0.1:${FRONTEND_PORT:-4200}`. Nginx serve a SPA, responde em `/health` e encaminha `/api/*` ao backend pela rede do Compose, removendo apenas `/api`. Backend e PostgreSQL não são publicados no host no arquivo principal. Para diagnóstico local explícito, adicione `-f compose.diagnostics.yaml`; as portas continuam vinculadas ao loopback e podem ser alteradas por `BACKEND_PORT` e `POSTGRES_PORT`.

## Saúde, persistência e diagnóstico

Use `docker compose ps` para os três healthchecks, `docker compose exec backend wget -qO- http://127.0.0.1:8080/actuator/health/readiness` para saúde agregada e `docker compose exec postgres psql -U gestao_acoes -d gestao_acoes -c 'select id, author, filename, exectype from databasechangelog order by orderexecuted;'` para o histórico Liquibase. Não publique a configuração renderizada porque ela contém os segredos interpolados.

`docker compose down` remove somente containers e rede; o volume permanece e será reutilizado no próximo `up`. Alterar `.env` não rotaciona a senha já armazenada no PostgreSQL: faça a rotação no banco e no cofre de forma coordenada. `docker compose down --volumes` destrói dados e só pode ser usado em uma pilha descartável, após confirmar o projeto Compose exato e, quando houver dados relevantes, testar um backup.

## E2E containerizado

Inicie o stub local aceitando conexões dos containers, configure `INTEGRATIONS_*_URL` para `host.docker.internal:9090`, suba a pilha com um nome de projeto isolado e execute Playwright com `E2E_CONTAINERIZED=true` e `E2E_BASE_URL` apontando ao frontend. O teste não chama provedores financeiros reais. Ao terminar, use `down` sem `--volumes` até concluir a prova de persistência; remova somente o volume cujo nome de projeto foi criado para o ensaio.

Os procedimentos de migration, baseline e rollback continuam em `gestao-acoes-spring/docs/database-migrations.md`.
