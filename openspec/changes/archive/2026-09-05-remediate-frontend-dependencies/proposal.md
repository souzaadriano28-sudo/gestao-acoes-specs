## Why

O frontend possui uma linha de base confirmada de 27 pacotes vulneráveis no relatório npm: 1 crítico, 21 altos, 2 moderados e 3 baixos. A exposição inclui seis dependências Angular diretas de produção, três dependências Angular diretas de desenvolvimento e dezoito dependências transitivas do ferramental. A correção precisa preservar Angular 21, o lockfile reproduzível e os gates já existentes, sem recorrer a atualização forçada ou esconder riscos residuais.

## What Changes

- Registrar uma auditoria npm comparativa, com comandos, versões do ambiente, totais por severidade e separação entre produção direta, desenvolvimento direto e transitivas.
- Atualizar coordenadamente as dependências Angular diretas de produção dentro da série 21.2.x e incluir `@angular/compiler-cli` na primeira onda exclusivamente porque seu peer exato deve acompanhar `@angular/compiler`, estabelecendo versões mínimas corrigidas e evitando desalinhamento entre pacotes do framework.
- Atualizar `@angular/build` e `@angular/cli` em uma segunda onda dentro da série 21.2.x, sem promover Angular 22 nem outros upgrades major não relacionados.
- Remediar dependências transitivas preferencialmente pela atualização compatível de seus pais diretos e pela regeneração determinística do lockfile; overrides só poderão ser considerados individualmente quando compatíveis e justificados.
- Proibir `npm audit fix --force` e impedir que uma queda artificial de severidade, a remoção de testes ou a omissão de dependências seja aceita como correção.
- Exigir `npm ci`, auditoria final de produção e completa, testes unitários, build de produção e E2E com Angular e Spring reais usando apenas os provedores locais simulados já configurados.
- Validar que os workflows de qualidade e E2E continuam coerentes com o manifesto e o lockfile atualizados e, quando houver revisões remotas autorizadas, registrar suas execuções reais.
- Criar um registro explícito para qualquer vulnerabilidade residual cuja correção exija mudança incompatível, incluindo advisory, caminho, exposição, decisão, mitigação, responsável e prazo de revisão.
- Manter fora do escopo `.env`, Docker, Flyway, Liquibase, mudanças funcionais da aplicação, branches, commits e pushes nesta etapa de planejamento.

## Capabilities

### New Capabilities

- `frontend-dependency-security`: remediação rastreável e compatível de vulnerabilidades npm do frontend, com evidência comparativa e regressão completa entre frontend e backend.

### Modified Capabilities

Nenhuma. Os workflows e contratos funcionais existentes serão validados, mas não são alterados por definição nesta proposta; eventual necessidade comprovada de mudar um workflow deverá ser limitada à compatibilidade com a remediação e registrada durante a implementação.

## Impact

A implementação afetará `package.json` e `package-lock.json` do repositório `gestao-acoes-ui` e adicionará um registro versionado de auditoria nesse repositório. Espera-se elevar na primeira onda os seis pacotes Angular de produção e `@angular/compiler-cli`, atualmente resolvidos em 21.2.15, para uma versão corrigida e compatível da série 21.2.x. `@angular/compiler-cli` é a única dependência direta de desenvolvimento antecipada, devido ao peer exato com `@angular/compiler`; `@angular/build` e `@angular/cli`, atualmente em 21.2.13, permanecem reservados para a segunda onda. O grafo transitivo deverá mudar como consequência controlada dessas atualizações.

Os comandos de teste existentes permanecem a referência: `npm test -- --watch=false`, `npm run build` e `npm run e2e`. O E2E continuará iniciando o frontend real em 4200, o Spring real em 8080 e o stub local em 9090, com perfil Spring `test`, H2 e integrações redirecionadas para localhost. Não há mudança prevista em API, banco, modelos, credenciais, deploy ou migração de dados.
