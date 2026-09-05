## 1. Baseline and Classification

- [x] 1.1 Registrar em `gestao-acoes-ui/docs/security/npm-audit-remediation.md` a data, versões de Node/npm, hashes de `package.json`/`package-lock.json` e os comandos reproduzíveis, verificando que a coleta inicial não altera esses arquivos.
- [x] 1.2 Executar as auditorias completa e `--omit=dev` em JSON, registrar totais por severidade e confirmar a separação histórica de 6 dependências diretas de produção, 3 diretas de desenvolvimento e 18 transitivas de desenvolvimento; distinguir contagem de pacotes da quantidade de advisories.
- [x] 1.3 Mapear cada transitiva com `npm explain`, agrupar os caminhos pelas raízes diretas `@angular/build`, `@angular/cli`, `@angular/compiler-cli`, `vitest` e `jsdom`, e recalcular versões `current`, `wanted` e `latest` antes de escolher os patches.

## 2. Direct Production Dependencies

- [x] 2.1 Atualizar coordenadamente `@angular/common`, `@angular/compiler`, `@angular/core`, `@angular/forms`, `@angular/platform-browser`, `@angular/router` e o companion `@angular/compiler-cli` para pisos corrigidos da série 21.2.x, sem Angular 22; verificar no diff que `@angular/build` e `@angular/cli` permanecem inalterados e que somente o manifesto e a resolução esperada do lockfile mudaram.
- [x] 2.2 Executar `npm ci`, `npm ls`, a auditoria `--omit=dev`, testes unitários e build após a onda de produção; exigir zero vulnerabilidades de produção, peers válidos e ausência de alteração adicional no lockfile.

## 3. Direct Development and Transitive Dependencies

- [x] 3.1 Atualizar coordenadamente `@angular/build` e `@angular/cli` para patches corrigidos da série 21.2.x, mantendo o `@angular/compiler-cli` já alinhado na primeira onda e sem atualizar majors de ferramentas não vulneráveis; verificar peers e compatibilidade com Node 24.16.0/npm 11.13.0.
- [x] 3.2 Regenerar deterministicamente o lockfile pela resolução normal do npm e confirmar que as 18 transitivas vulneráveis avançaram para versões corrigidas através de seus pais, sem promovê-las artificialmente a dependências diretas.
- [x] 3.3 Executar `npm ls` e revisar deduplicação, dependências inválidas, peers e os caminhos finais de `npm explain`; corrigir qualquer inconsistência antes de aceitar o novo lockfile.
- [x] 3.4 Para cada transitiva ainda vulnerável, atualizar primeiro todos os pais compatíveis e só então avaliar um `overrides` mínimo; verificar faixa de todos os consumidores, ausência de major/peer forçado e registrar justificativa individual.
- [x] 3.5 Recusar `npm audit fix --force`, dependência direta artificial, override incompatível ou remoção de ferramenta/teste como mecanismo de redução da auditoria; verificar comandos executados e o diff final.

## 4. Comparative Security Acceptance

- [x] 4.1 Remover apenas artefatos instalados reproduzíveis conforme o fluxo normal do projeto, executar uma instalação limpa com `npm ci` e verificar que `package.json` e `package-lock.json` permanecem inalterados após a instalação.
- [x] 4.2 Executar auditorias finais completa e `--omit=dev`, comparar total, severidade, pacote e advisory com a linha de base e registrar a expectativa de zero ou cada residual permitido sem ocultar novos achados.
- [x] 4.3 Se houver residual exclusivo de desenvolvimento sem correção compatível, registrar advisory, versão, caminhos, motivo da incompatibilidade, exposição, mitigação, responsável e data de revisão; falhar a aceitação para qualquer residual de produção ou aumento de quantidade/severidade.

## 5. Frontend and Cross-Repository Regression

- [x] 5.1 Executar `npm test -- --watch=false` com a árvore limpa e registrar quantidade e resultado dos testes, verificando que nenhum teste foi removido, ignorado ou afrouxado.
- [x] 5.2 Executar `npm run build` na configuração de produção e registrar o resultado e os budgets, sem versionar `dist` ou outros artefatos gerados.
- [x] 5.3 Confirmar previamente que 4200, 8080 e 9090 estão livres e que Playwright mantém `reuseExistingServer: false`, perfil Spring `test`, H2 e todos os provedores apontados ao stub em localhost:9090.
- [x] 5.4 Executar `npm run e2e` com Angular e Spring reais e o stub local, registrar resultado e tempos, confirmar ausência de chamadas a provedores financeiros externos e verificar que os três processos efêmeros foram encerrados ao final.

## 6. Workflow Validation

- [x] 6.1 Revisar estaticamente `gestao-acoes-ui/.github/workflows/quality.yml` e `e2e.yml` para confirmar Node 24.16.0, npm 11.13.0, cache pelo lockfile, `npm ci`, testes, build, Chromium compatível, SHAs imutáveis, permissões mínimas e ausência de resolução forçada.
- [x] 6.2 Executar localmente os comandos equivalentes aos dois workflows com o lockfile final e registrar a correspondência entre etapas locais e remotas.
- [x] 6.3 Quando houver autorização posterior para publicar revisões, executar o workflow de qualidade e o E2E manual com SHAs completos de frontend/backend e registrar URLs, SHAs e conclusões; manter esta tarefa pendente enquanto branch, commit ou push não estiver autorizado.

  Evidência remota: Manual E2E [execução 33981562909](https://github.com/souzaadriano28-sudo/gestao-acoes-ui/actions/runs/33981562909), concluída com sucesso em 2min42s usando frontend `4385ddec600d7cbb7e78a2e5549c0d39ba74830d` e backend `d18a3b30ab9ed26044640dac102ab37587b6bece`.

## 7. Documentation and Scope Review

- [x] 7.1 Finalizar `npm-audit-remediation.md` com versões antes/depois, totais comparativos, cadeias transitivas, overrides justificados, riscos residuais e evidências dos testes/build/E2E/workflows; não versionar relatórios JSON completos, logs, `node_modules`, `dist` ou browsers.
- [x] 7.2 Revisar os diffs dos três repositórios e confirmar que a implementação se limita ao manifesto, lockfile e registro de segurança do frontend, salvo ajuste mínimo de workflow comprovadamente necessário, e que não adiciona `.env`, Docker, Flyway ou Liquibase.
