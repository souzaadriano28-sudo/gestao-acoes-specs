## Why

Os repositórios de backend, frontend e especificações dependem hoje de validações manuais, o que permite que regressões e documentos OpenSpec inválidos sejam integrados sem um sinal consistente. Automatizar verificações reproduzíveis em pushes e pull requests fornece uma barreira de qualidade rápida, segura e com falhas diagnosticáveis.

## What Changes

- Adicionar GitHub Actions no backend para compilar e testar com Java 17 por meio do Maven Wrapper versionado.
- Adicionar GitHub Actions no frontend com Node 24.16.0 para instalar exatamente o lockfile com `npm ci`, executar `npm test -- --watch=false` no Ubuntu da CI e gerar o build de produção; o equivalente local no Windows será `npm.cmd test -- --watch=false`.
- Disponibilizar o E2E do frontend somente por `workflow_dispatch`, com `backend_sha` e `frontend_sha` imutáveis, Chromium correspondente ao Playwright bloqueado no lockfile, serviços simulados e acesso aos repositórios públicos apenas pelo `GITHUB_TOKEN`.
- Adicionar GitHub Actions no repositório de especificações, permitindo `package.json` e `package-lock.json` mínimos exclusivamente para fixar OpenSpec 1.12.0 e validar todo o conteúdo em modo estrito.
- Evitar validações duplicadas executando `pull_request` direcionado à branch principal e `push` somente depois que o commit chegar à branch principal, com concorrência que cancela apenas execuções obsoletas da mesma referência.
- Usar caches nativos dos gerenciadores, limitados por sistema, ferramenta e lockfile, sem armazenar saídas de build, credenciais ou dados mutáveis da aplicação.
- Fixar actions por SHA confiável com comentário da versão, limitar jobs a 5 minutos para specs, 15 para backend/frontend e 20 para E2E, e preservar relatórios de falha por 7 dias.
- Manter fora do escopo arquivos `.env`, Docker e ferramentas de migração Flyway ou Liquibase.

## Capabilities

### New Capabilities

- `automated-quality-checks`: validação contínua, isolada e diagnosticável dos repositórios de backend, frontend e especificações.

### Modified Capabilities

Nenhuma. As capacidades funcionais existentes continuam com os mesmos requisitos; esta mudança introduz a automação que os verifica.

## Impact

Serão afetadas as configurações de GitHub Actions nos três repositórios, a configuração Playwright para selecionar o Chromium bloqueado e, no repositório de especificações, somente os metadados npm mínimos necessários para fixar OpenSpec 1.12.0. O `package.json` e o lockfile atuais do frontend não precisam mudar. O código funcional da aplicação, suas APIs e seus modelos de dados não mudam. A execução E2E depende dos SHAs informados, Java 17, Node 24.16.0, Chromium local e serviços simulados, sem token personalizado, segredos de aplicação ou integrações financeiras externas. A proteção de branches será configurada manualmente somente após a primeira execução aprovada dos workflows.
