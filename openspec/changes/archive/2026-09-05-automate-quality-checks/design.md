## Context

Ver `proposal.md` para a motivação e `specs/automated-quality-checks/spec.md` para o contrato. A raiz contém três repositórios Git independentes: specs em `gestao-acoes` (`main`), backend em `gestao-acoes-spring` (`main`) e frontend em `gestao-acoes-ui` (`master`). Nenhum possui `.github/workflows` atualmente.

O backend já declara Java 17, possui Maven Wrapper 3.3.4 e testes Surefire/integração. O frontend possui lockfile npm, scripts `test`, `build` e `e2e`, Angular unit-test builder e Playwright. O E2E atual é headless e determinístico quanto aos provedores, pois inicia um stub local, força o perfil Spring `test` com H2 e redireciona os três endpoints externos para localhost. Entretanto, ele assume Windows (`mvnw.cmd`), `channel: 'chrome'` e um checkout irmão do backend. Para usar o Chromium associado ao Playwright bloqueado no lockfile, a configuração retirará o canal externo. Como os repositórios públicos evoluem separadamente, executar esse E2E automaticamente em todo PR contra revisões móveis não seria reproduzível.

O repositório de specs não possui manifesto Node; a versão 1.12.0 do CLI oferece `validate --all --strict --no-interactive`. A descoberta e este desenho não executam ou alteram as suítes.

## Goals / Non-Goals

**Goals:**

- Criar gates rápidos e reproduzíveis para backend, frontend e specs, com privilégios mínimos, dependências fixadas, timeout e diagnóstico útil.
- Tornar o E2E executável de forma controlada sem serviços financeiros reais e sem acoplar o resultado de um PR a uma revisão móvel de outro repositório.
- Usar o lockfile ou descritor nativo de cada ecossistema como fronteira do cache.

**Non-Goals:**

- Introduzir ambiente de deploy, `.env`, contêiner, Flyway, Liquibase ou alteração funcional da aplicação.
- Fazer E2E obrigatório em push/PR enquanto frontend e backend não compartilharem uma revisão coordenada.
- Cachear diretórios de build, browsers, bancos, relatórios ou diretórios de trabalho completos.

## Decisions

### 1. Um workflow obrigatório por repositório e eventos sem sobreposição

Cada repositório receberá um único workflow `quality.yml`, acionado por `pull_request` somente quando o destino for sua branch principal e por `push` somente depois que o commit chegar a essa branch (`main` em specs/backend, `master` no frontend). Assim, pushes em branches de trabalho com PR não executam simultaneamente gates equivalentes; o evento de PR cobre a contribuição e o push cobre a integração direta ou o merge na branch principal.

Cada workflow usará um grupo de concorrência composto pelo nome do workflow e número do PR ou referência Git, com `cancel-in-progress: true`. `pull_request_target` não será usado. Permissões serão declaradas no nível do workflow como `contents: read`.

Alternativa rejeitada: disparar `push` para toda branch e também `pull_request`, pois um commit em branch com PR aberto gera duas validações equivalentes. Um workflow coordenador no repositório de specs também foi rejeitado porque criaria credenciais e acoplamento desnecessários entre os três históricos.

### 2. Backend em Ubuntu com Java 17 e o wrapper existente

O backend usará runner Ubuntu, timeout de 15 minutos, checkout fixado por SHA confiável com comentário da versão e distribuição Temurin do Java 17 por `setup-java`, igualmente fixada, com cache Maven apontando para `pom.xml`. A validação executará `bash ./mvnw -B verify`; invocar o script por Bash contorna o modo Git atual não executável sem depender de Maven global. `verify` reúne compilação e testes no ciclo padrão. Relatórios existentes em `target/surefire-reports` e `target/failsafe-reports` serão enviados apenas em falha, com retenção de 7 dias e ausência tolerada.

Alternativa rejeitada: `mvn` global, pois ignora a versão fixada pelo wrapper. Alterar apenas a permissão do wrapper é uma melhoria possível, mas não é requisito para o workflow.

### 3. Frontend obrigatório rápido e estritamente baseado no lockfile

O gate obrigatório do frontend usará Ubuntu, timeout de 15 minutos, Node 24.16.0 por `setup-node` fixada por SHA e cache npm limitado a `package-lock.json`. Executará `npm ci`, `npm test -- --watch=false` e `npm run build`. No Windows local, a verificação equivalente será `npm.cmd test -- --watch=false`; não será necessário criar um novo script npm. As fases terão nomes separados e não usarão `continue-on-error`, para que o primeiro erro determine a falha.

Alternativa rejeitada: cachear `node_modules` ou `dist`; ambos misturam saídas mutáveis com dependências e podem mascarar inconsistências que `npm ci` deve detectar.

### 4. E2E manual, efêmero e vinculado a commit imutável

O frontend receberá um workflow separado `e2e.yml` somente com `workflow_dispatch` e timeout de 20 minutos. Os inputs obrigatórios `backend_sha` e `frontend_sha` aceitarão exclusivamente 40 caracteres hexadecimais. O workflow fará checkout dos repositórios públicos fixos em `gestao-acoes-ui/` e `gestao-acoes-spring/` nos SHAs informados, preservando o layout irmão esperado pelo Playwright. Ambos usarão somente o `GITHUB_TOKEN` com `contents: read`; nenhum token personalizado ou secret de checkout será criado.

A execução usará Windows, Java 17, Node 24.16.0 e `npm ci`. `playwright.config.ts` deixará de escolher o canal externo `chrome`, e `npx --no-install playwright install chromium` instalará o Chromium correspondente à versão exata de `@playwright/test` já bloqueada em `package-lock.json`, sem fallback para resolução remota. Browsers não serão armazenados em cache.

Antes do navegador, uma etapa verificará o formato dos dois SHAs e as variáveis do Playwright: perfil `test`, H2 e os três endpoints de provedores em `localhost:9090`. `reuseExistingServer: false`, runner efêmero e timeouts já existentes impedem o reaproveitamento de processos. O job registrará os SHAs de frontend/backend no resumo e publicará `playwright-report` e `test-results` em falha, com retenção de 7 dias.

Essa avaliação conclui que o E2E atual é seguro quanto a dados e integrações externas, mas não é adequado como gate automático de PR nesta primeira versão. O acionamento manual com os dois SHAs resolve a reprodutibilidade sem fingir cobertura contínua.

Alternativas rejeitadas: usar branches móveis, que tornam o resultado não reproduzível; usar Docker, explicitamente fora do escopo; usar token personalizado entre repositórios públicos; ou executar E2E automaticamente em PR nesta versão.

### 5. Specs com CLI local e versão exata

O repositório de specs ganhará somente `package.json` e `package-lock.json` mínimos, exclusivamente para fixar `@fission-ai/openspec` exatamente na versão 1.12.0 e expor um script que execute `openspec validate --all --strict --no-interactive`. O workflow terá timeout de 5 minutos, usará `npm ci --ignore-scripts`, cache npm baseado no lockfile e o binário local; não usará `npx` com resolução remota implícita. A saída do validador permanecerá no log e no resumo do job.

Alternativa rejeitada: instalar o CLI globalmente ou usar tag móvel, pois isso reduz a reprodutibilidade e pode mudar a validação sem alteração no repositório.

### 6. Actions, caches e relatórios com fronteiras estreitas

Todas as actions externas serão selecionadas de releases oficiais confiáveis e fixadas pelo SHA completo do commit publicado, com comentário ao lado indicando a versão legível. Os caches integrados de `setup-java` e `setup-node` serão usados sem chaves de restauração genéricas: SO, gerenciador e hash do descritor/lockfile determinam a compatibilidade. Nenhum workflow escreverá cache ou artefato com segredo, configuração local, banco ou saída de aplicação.

Etapas e jobs terão nomes orientados ao resultado. Uploads de relatório usarão condição de falha sem mascarar o status anterior, `if-no-files-found: ignore` e `retention-days: 7`. Um resumo final listará comandos e revisões executadas; a ausência de relatório não transformará falha em sucesso.

## Risks / Trade-offs

- [Pushes em branches sem PR não executam o gate remoto] → validar no PR e na branch principal evita duplicidade; documentar o fluxo e manter os mesmos comandos disponíveis localmente.
- [Um dos repositórios públicos deixa de ser acessível pelo `GITHUB_TOKEN`] → falhar no checkout antes de iniciar serviços; qualquer mudança de credencial exige nova decisão de segurança.
- [Runner Windows ou Chromium muda] → fixar actions, Node e Playwright; instalar explicitamente o Chromium do lockfile em cada execução.
- [Cache contaminado ou obsoleto] → cachear apenas lojas de pacote, segmentadas por lockfile, e deixar `npm ci`/Maven verificar os artefatos.
- [Relatórios podem conter dados sensíveis] → E2E usa apenas fixtures e credenciais fictícias; limitar retenção e revisar caminhos antes do upload.
- [A versão fixada do OpenSpec envelhece] → atualizá-la por PR explícito junto do lockfile e validar a própria mudança em modo estrito.

## Migration Plan

1. Adicionar e validar primeiro o workflow do backend, mantendo o comando local equivalente pelo Maven Wrapper.
2. Adicionar o script CI não interativo e o workflow obrigatório do frontend; confirmar `npm ci`, testes e build em ambiente limpo.
3. Adicionar manifesto/lockfile do OpenSpec e o workflow estrito no repositório de specs.
4. Ajustar o Playwright para o Chromium bloqueado, adicionar o workflow manual de E2E com os dois SHAs e realizar uma execução conhecida usando apenas `GITHUB_TOKEN`.
5. Após a primeira execução aprovada de cada workflow, configurar manualmente os nomes estáveis como checks obrigatórios nas branches principais. Nenhum workflow alterará proteção de branch.
6. Em rollback, remover o requisito do check na proteção de branch antes de reverter o workflow correspondente; nenhum dado ou esquema de aplicação precisa ser migrado.
