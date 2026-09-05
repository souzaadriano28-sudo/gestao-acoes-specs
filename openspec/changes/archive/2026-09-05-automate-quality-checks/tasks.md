## 1. Backend Quality Gate

- [x] 1.1 Criar `gestao-acoes-spring/.github/workflows/quality.yml` com `pull_request` destinado a `main`, `push` apenas em `main`, grupo de concorrência por PR/referência, `contents: read`, timeout de 15 minutos e actions de releases confiáveis fixadas por SHA completo com comentário da versão; verificar no YAML que não há `pull_request_target`, gatilhos sobrepostos ou permissões de escrita.
- [x] 1.2 Configurar Temurin Java 17, cache Maven baseado em `pom.xml` e execução `bash ./mvnw -B verify`; verificar localmente o mesmo comando e confirmar no log do Actions que o Maven Wrapper 3.9.14 foi usado.
- [x] 1.3 Publicar somente em falha os diretórios Surefire/Failsafe disponíveis por 7 dias e sem mascarar o status; verificar com uma execução controlada que uma falha de teste deixa o job vermelho e o relatório informa retenção de 7 dias.

## 2. Frontend Quality Gate

- [x] 2.1 Confirmar o comando não interativo existente sem criar novo script: executar `npm.cmd test -- --watch=false` no Windows local e registrar `npm test -- --watch=false` para Ubuntu; verificar que ambos representam a mesma suíte e que `package.json`/lockfile permanecem inalterados.
- [x] 2.2 Criar `gestao-acoes-ui/.github/workflows/quality.yml` com `pull_request` destinado a `master`, `push` apenas em `master`, concorrência por PR/referência, `contents: read`, timeout de 15 minutos e actions confiáveis fixadas por SHA completo com comentário da versão; verificar no YAML a ausência de `pull_request_target`, segredos e permissões de escrita.
- [x] 2.3 Configurar Node 24.16.0, npm 11.13.0, cache npm baseado somente em `package-lock.json`, `npm ci`, `npm test -- --watch=false` e build como etapas distintas e bloqueantes; verificar em uma execução do Actions as versões, o cache segmentado pelo lockfile e o nome da fase responsável por uma falha controlada.

## 3. Strict OpenSpec Gate

- [x] 3.1 Criar no repositório de specs somente `package.json` e `package-lock.json` mínimos, exclusivamente para fixar `@fission-ai/openspec` em 1.12.0 e o script `openspec validate --all --strict --no-interactive`; verificar que `npm ci --ignore-scripts` e o script local concluem sem resolução global, dependências extras ou alteração do lockfile.
- [x] 3.2 Criar `.github/workflows/quality.yml` no repositório de specs com `pull_request` destinado a `main`, `push` apenas em `main`, concorrência por PR/referência, `contents: read`, timeout de 5 minutos, actions confiáveis fixadas por SHA completo com comentário da versão e cache npm baseado no novo lockfile; verificar no Actions que specs principais e mudanças ativas aparecem e que um delta inválido controlado torna o job vermelho com diagnóstico do alvo.

## 4. Safe Manual E2E

- [x] 4.1 Criar `gestao-acoes-ui/.github/workflows/e2e.yml` somente com `workflow_dispatch`, timeout de 20 minutos e inputs obrigatórios `backend_sha`/`frontend_sha`; verificar que qualquer valor ausente ou diferente de 40 caracteres hexadecimais falha antes de checkout adicional, instalação ou inicialização de processos.
- [x] 4.2 Configurar checkouts dos repositórios públicos em `gestao-acoes-ui/` e `gestao-acoes-spring/` nos SHAs informados, usando somente `GITHUB_TOKEN` com `contents: read`; verificar no resumo os dois SHAs e no YAML a ausência de token personalizado ou secret de checkout.
- [x] 4.3 Ajustar `playwright.config.ts` para usar o Chromium padrão em vez de `channel: 'chrome'` e configurar no runner Windows Java 17, Node 24.16.0, npm 11.13.0, caches de gerenciador e `npx --no-install playwright install chromium`; verificar que a versão vem do `package-lock.json` e nenhum cache inclui `node_modules`, `dist`, browsers, banco ou relatórios.
- [x] 4.4 Adicionar uma guarda anterior ao E2E que confirme perfil Spring `test`, H2 e todos os endpoints externos em `localhost:9090`, mantendo `reuseExistingServer: false`; verificar que uma URL não local controlada interrompe o job antes da jornada e sem solicitar credenciais de provedores.
- [x] 4.5 Executar `npm.cmd run e2e` dentro do timeout e publicar somente em falha `playwright-report`/`test-results` por 7 dias sem mascarar o status; verificar uma execução manual bem-sucedida contra os dois SHAs conhecidos e outra falha controlada com artefatos diagnósticos.

## 5. Cross-Repository Acceptance

- [x] 5.1 Revisar os quatro workflows para garantir nomes estáveis, actions confiáveis por SHA completo com versão comentada, permissões mínimas, timeouts de 5/15/20 minutos, retenção de falhas por 7 dias, caches estreitos e ausência de `.env`, Docker, Flyway ou Liquibase; verificar por busca e pelos três diffs Git independentes.
- [x] 5.2 Executar uma validação aprovada de PR e uma de push na branch principal de cada repositório, confirmando um único gate `quality` por evento e cancelamento restrito à mesma referência; somente depois registrar manualmente esses checks na proteção de `main`/`master` e verificar que nenhum workflow possui permissão para alterar a proteção.
- [x] 5.3 Executar `npm ci --ignore-scripts` e `npm run validate:openspec` no repositório de specs após todos os artefatos, confirmando validação estrita completa e resultados claros antes de considerar a mudança pronta.
