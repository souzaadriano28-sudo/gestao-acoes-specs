## Context

Em 2026-09-05, `npm audit --json --package-lock-only` no repositório `gestao-acoes-ui` confirmou 27 entradas vulneráveis: 1 crítica, 21 altas, 2 moderadas e 3 baixas. `npm audit --omit=dev` reduziu a linha de produção a seis entradas, todas altas e diretas: `@angular/common`, `@angular/compiler`, `@angular/core`, `@angular/forms`, `@angular/platform-browser` e `@angular/router`, atualmente resolvidas em 21.2.15. A auditoria completa acrescenta três dependências diretas de desenvolvimento (`@angular/build` e `@angular/cli` em 21.2.13; `@angular/compiler-cli` em 21.2.15) e dezoito entradas transitivas associadas somente ao grafo de desenvolvimento.

As transitivas observadas são `@babel/core`, `@hono/node-server`, `body-parser`, `brace-expansion`, `browserslist`, `esbuild`, `fast-uri`, `hono`, `immutable`, `ip-address`, `nanoid`, `pacote`, `piscina`, `postcss`, `qs`, `tar`, `undici` e `vite`. A única entrada crítica é `tar`, alcançada por `@angular/cli` através de `pacote` e `node-gyp`. As principais raízes são `@angular/build`, `@angular/cli`, `@angular/compiler-cli`, `vitest` e `jsdom`; uma mesma transitiva pode ter mais de um caminho.

`npm outdated` indicou alvos compatíveis (`wanted`) de 21.2.22 para os pacotes do framework e `@angular/compiler-cli`, e 21.2.23 para `@angular/build` e `@angular/cli`; Angular 22 é a linha `latest`, mas constitui upgrade major e não faz parte desta remediação. O resultado é uma fotografia temporal: a implementação deverá recalcular os alvos e advisories antes de editar o lockfile.

O frontend usa Node 24.16.0 e npm 11.13.0 nos workflows, Angular unit-test builder com Vitest, build de produção e Playwright. O E2E existente inicia Angular e Spring reais, usa H2 no perfil `test` e redireciona provedores externos ao stub local em 9090. Os workflows `quality.yml` e `e2e.yml` instalam pelo lockfile com `npm ci`.

## Goals / Non-Goals

**Goals:**

- Eliminar todas as vulnerabilidades corrigíveis por atualizações compatíveis da série atual e reduzir a zero as vulnerabilidades de produção conhecidas.
- Tratar separadamente produção direta, desenvolvimento direto e transitivas, mantendo a origem e o resultado de cada grupo auditáveis.
- Preservar compatibilidade funcional e de toolchain por meio de atualização em ondas pequenas, lockfile determinístico e gates completos.
- Tornar qualquer risco residual explícito, justificado, temporário e revisável.

**Non-Goals:**

- Usar `npm audit fix --force`, migrar para Angular 22 ou realizar upgrades major oportunistas.
- Atualizar dependências não vulneráveis como Prettier, TypeScript, Vitest ou jsdom apenas porque há uma versão major mais nova.
- Alterar comportamento funcional, contratos HTTP, estrutura de dados, `.env`, Docker, Flyway, Liquibase ou infraestrutura de deploy.
- Substituir Angular ou Spring reais por mocks no E2E; somente provedores financeiros permanecem simulados localmente.

## Decisions

### 1. A linha de base será reproduzível e classificada por alcance

Antes da primeira edição, a implementação registrará versões de Node/npm, hash de `package.json` e `package-lock.json`, data, comando e totais de `npm audit --json --package-lock-only` e `npm audit --omit=dev --json --package-lock-only`. A diferença entre os dois relatórios identifica o grafo exclusivo de desenvolvimento; `isDirect`, o manifesto e `npm explain` distinguem dependências diretas e transitivas.

O número 27 representa entradas de pacotes vulneráveis do relatório npm, não necessariamente 27 advisories distintos. O registro comparativo manterá os dois conceitos separados para evitar alegações incorretas de cobertura.

### 2. Pacotes Angular serão atualizados em duas ondas coordenadas e compatíveis

A primeira onda elevará juntos os seis pacotes diretos de produção e `@angular/compiler-cli` para um patch corrigido da série 21.2.x, alinhando as versões do framework e elevando o piso declarado no manifesto para impedir reinstalação de patches vulneráveis. O alvo observado é 21.2.22. A antecipação de `@angular/compiler-cli` é uma exceção técnica mínima: a versão 21.2.15 declara peer exato em `@angular/compiler@21.2.15`, e a versão 21.2.22 declara peer exato em `@angular/compiler@21.2.22`; npm 11.13.0 recusou com `ERESOLVE` todas as tentativas de atualizar apenas o conjunto de produção. Nenhum outro pacote direto de desenvolvimento entra nesta onda.

Depois de `npm ci`, auditoria de produção, testes unitários e build aprovados, a segunda onda elevará somente `@angular/build` e `@angular/cli` de modo coordenado dentro de 21.2.x. Os alvos observados são 21.2.23. A versão do framework e a do ferramental não precisam ter o mesmo patch quando os próprios pacotes publicados usam cadências diferentes, mas os peer dependencies deverão permanecer satisfeitos.

Alternativa rejeitada: atualizar todos os pacotes para `latest`, pois hoje isso promove Angular 22 e mistura remediação com migração incompatível.

### 3. Transitivas serão corrigidas pela raiz do caminho antes de qualquer override

Após cada onda direta, o lockfile será recalculado com npm 11.13.0 e inspecionado com `npm explain`. Atualizar os pais diretos deverá permitir patches corrigidos de transitivas ligadas a `@angular/build`, `@angular/cli`, `@angular/compiler-cli`, `vitest` e `jsdom`. Não serão adicionadas dependências transitivas ao manifesto como se fossem diretas.

Um `overrides` só poderá ser usado se a vulnerabilidade persistir, houver versão corrigida compatível com todas as faixas consumidoras, `npm ls` não apontar dependência inválida e a decisão for documentada por pacote. Overrides que forcem peer dependency incompatível ou upgrade major são proibidos nesta mudança.

Alternativa rejeitada: editar manualmente apenas o lockfile ou executar `npm audit fix --force`, pois essas abordagens podem produzir resolução não reproduzível ou mudança major oculta.

### 4. O critério de saída combina melhoria de segurança e ausência de regressão

A meta é auditoria completa com zero vulnerabilidades e auditoria de produção com zero. Se o ecossistema não oferecer correção compatível no momento da implementação, a mudança poderá concluir apenas quando todas as entradas residuais forem exclusivamente de desenvolvimento, não representarem aumento de quantidade ou severidade, e estiverem registradas com advisory, versão, caminhos de `npm explain`, motivo da incompatibilidade, exposição no projeto, mitigação, responsável e data de revisão.

Nenhum residual crítico ou alto de produção será aceito. Uma nova vulnerabilidade descoberta entre a proposta e a implementação passa a integrar a linha final e não pode ser ignorada para preservar artificialmente o número 27.

### 5. A validação será executada do lockfile limpo até a integração real

Após as edições, `npm ci` deverá comprovar consistência do manifesto e lockfile. Em seguida serão executados a auditoria comparativa, `npm test -- --watch=false` e `npm run build`. O E2E será executado por `npm run e2e` com os três serviços efêmeros existentes: stub em 9090, Spring real em 8080 e Angular real em 4200. O teste não poderá reutilizar processos existentes nem consultar provedores financeiros externos.

Os workflows de frontend serão revisados estaticamente para confirmar Node 24.16.0, npm 11.13.0, `npm ci`, testes, build, Chromium compatível e SHAs imutáveis no E2E. Os comandos equivalentes serão executados localmente. A validação remota efetiva dos workflows será registrada quando revisões de frontend e backend existirem no GitHub e houver autorização para acioná-las; este planejamento não cria branch, commit ou push.

### 6. A evidência de auditoria será pequena, versionada e acionável

O frontend receberá `docs/security/npm-audit-remediation.md` com a linha de base e o resultado final agregados, versões diretas antes/depois, grupos transitivos e riscos residuais. Relatórios JSON completos, `node_modules`, logs e artefatos de teste não serão versionados. O documento incluirá comandos suficientes para reprodução sem copiar conteúdo volátil ou excessivo do serviço de advisories.

## Risks / Trade-offs

- [Novos advisories alteram a contagem durante a implementação] → registrar data e ambiente em cada auditoria, comparar por identificador e tratar novos achados explicitamente.
- [Patches Angular ficam desalinhados ou violam peers] → atualizar por ondas coordenadas, executar `npm ls` e bloquear dependências inválidas antes dos testes.
- [Uma transitiva não recebe patch pela atualização do pai] → provar os caminhos com `npm explain`, avaliar override compatível individual e registrar qualquer necessidade de major como residual.
- [Override mascara incompatibilidade futura] → preferir resolução natural, limitar override à versão corrigida mínima e exigir testes, build, E2E e justificativa no registro.
- [Auditoria npm reporta ferramentas não distribuídas ao usuário] → manter a separação produção/desenvolvimento sem descartar risco de supply chain do ambiente de build.
- [Atualização do build altera bundle ou execução de testes] → comparar testes e build após cada onda, não apenas no final.
- [E2E deixa processos ou usa rede externa] → verificar portas antes/depois, manter `reuseExistingServer: false`, perfil `test`, H2 e URLs do stub local.
- [Workflow remoto não pode ser executado antes de existir revisão publicada] → concluir a validação local e estática, deixando a execução remota como gate explícito dependente de autorização, nunca como sucesso presumido.

## Migration Plan

1. Capturar a linha de base e criar o registro de evidência sem alterar dependências.
2. Atualizar os seis pacotes diretos de produção e `@angular/compiler-cli` para o mesmo patch Angular 21.2.x; regenerar o lockfile e passar auditoria de produção, testes e build.
3. Atualizar somente `@angular/build` e `@angular/cli` dentro de 21.2.x; resolver transitivas por seus pais e validar peers/deduplicação.
4. Avaliar isoladamente qualquer residual, aplicar apenas override compatível quando comprovadamente necessário e documentar riscos sem correção compatível.
5. Executar instalação limpa, auditorias finais, testes unitários, build e E2E com Angular/Spring reais e provedores locais.
6. Validar os workflows local e estaticamente; após autorização e publicação das revisões, executar os workflows reais com SHAs imutáveis.
7. Em rollback, restaurar conjuntamente `package.json` e `package-lock.json` ao par anterior. Nenhum rollback de banco, ambiente ou infraestrutura é necessário.

## Open Questions

- A contagem de 27 é temporal e corresponde a pacotes vulneráveis, enquanto os advisories subjacentes são mais numerosos; a implementação deve reportar ambos sem assumir equivalência.
- A exceção de `@angular/compiler-cli` na primeira onda foi autorizada para satisfazer seu peer exato; qualquer outra dependência direta necessária deverá causar nova pausa antes de ampliar o escopo.
- Ainda não é possível afirmar se a atualização coordenada dos pais eliminará as 18 transitivas sem override; essa decisão depende do grafo regenerado e será tomada pacote a pacote pelos critérios acima.
- A execução real dos workflows no GitHub depende de commits remotos imutáveis e de autorização posterior para branch/commit/push; até lá, somente validação local e estática pode ser concluída.
