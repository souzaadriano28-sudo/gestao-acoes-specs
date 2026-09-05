## Purpose

Definir a remediação compatível, rastreável e verificável das vulnerabilidades npm do frontend sem introduzir upgrades major forçados nem regressões na integração real com o backend.

## ADDED Requirements

### Requirement: Linha de base classificada e reproduzível
A remediação SHALL registrar antes das alterações a versão de Node e npm, a data, os hashes de `package.json` e `package-lock.json`, os comandos de auditoria e os resultados completos e de produção agregados por severidade. Cada entrada SHALL ser classificada como dependência direta de produção, direta de desenvolvimento ou transitiva, e cada transitiva SHALL identificar pelo menos um caminho até uma dependência direta.

#### Scenario: Auditoria inicial reproduzida
- **WHEN** a implementação inicia com o manifesto e o lockfile originais
- **THEN** o registro identifica a linha de base de 27 pacotes vulneráveis, separa os 6 diretos de produção, os 3 diretos de desenvolvimento e os 18 transitivos de desenvolvimento e distingue pacotes de advisories.

#### Scenario: Linha de base diverge com novos advisories
- **WHEN** o serviço npm retorna uma contagem ou conjunto diferente da fotografia da proposta
- **THEN** a implementação registra a nova data e a divergência por severidade e identificador, sem descartar achados novos para manter a contagem histórica.

### Requirement: Dependências diretas de produção corrigidas dentro da linha compatível
Os seis pacotes Angular diretos de produção SHALL ser atualizados coordenadamente para versões corrigidas da série 21.2.x, com pisos declarados que não permitam reinstalar os patches vulneráveis conhecidos. `@angular/compiler-cli` SHALL acompanhar `@angular/compiler` na primeira onda exclusivamente para satisfazer seu peer exato na mesma versão. A auditoria com dependências de desenvolvimento omitidas SHALL terminar sem vulnerabilidades conhecidas. Nenhum pacote SHALL ser promovido para Angular 22 nesta mudança.

#### Scenario: Patch compatível disponível
- **WHEN** versões corrigidas da série 21.2.x estão publicadas e satisfazem os peers do projeto
- **THEN** manifesto e lockfile resolvem o conjunto Angular de produção e `@angular/compiler-cli` nessas versões, `npm ls` não relata dependência inválida e a auditoria de produção totaliza zero.

#### Scenario: Peer exato do compilador
- **WHEN** `@angular/compiler` avança para um novo patch 21.2.x e `@angular/compiler-cli` exige exatamente o mesmo patch como peer
- **THEN** `@angular/compiler-cli` avança na primeira onda somente até o patch correspondente, enquanto `@angular/build` e `@angular/cli` permanecem inalterados para a segunda onda.

#### Scenario: Correção exige major incompatível
- **WHEN** uma vulnerabilidade direta de produção não possui correção na série Angular 21 compatível
- **THEN** a implementação não usa `--force`, não promove silenciosamente para Angular 22 e não pode ser aceita enquanto o risco alto ou crítico de produção permanecer.

### Requirement: Dependências diretas de desenvolvimento corrigidas gradualmente
`@angular/build` e `@angular/cli` SHALL ser atualizados como uma segunda onda para patches corrigidos da série 21.2.x, somente depois que a primeira onda, incluindo o companion `@angular/compiler-cli`, passar auditoria, testes e build. Dependências diretas não vulneráveis não SHALL receber upgrade major oportunista.

#### Scenario: Primeira onda aprovada
- **WHEN** produção está sem vulnerabilidades e testes e build passam
- **THEN** `@angular/build` e `@angular/cli` são atualizados dentro de 21.2.x com peers satisfeitos e alterações separáveis no histórico de evidência.

#### Scenario: Ferramenta não relacionada possui nova major
- **WHEN** npm informa versão major mais recente de uma dependência direta não vulnerável
- **THEN** essa atualização permanece fora do escopo, salvo se for comprovadamente necessária para remover uma vulnerabilidade transitiva e for documentada como decisão incompatível pendente.

### Requirement: Transitivas corrigidas pela cadeia de origem
Dependências transitivas vulneráveis SHALL ser remediadas primeiro por atualizações compatíveis das dependências diretas que as introduzem e pela resolução normal do npm. A implementação MUST NOT declarar uma transitiva como dependência direta apenas para silenciar a auditoria e MUST NOT executar `npm audit fix --force`. Um override SHALL ser permitido apenas quando a versão corrigida satisfizer todos os consumidores, `npm ls` permanecer válido e a justificativa for registrada.

#### Scenario: Pai compatível libera patch transitivo
- **WHEN** uma atualização direta compatível amplia ou atualiza a resolução de uma transitiva vulnerável
- **THEN** o lockfile seleciona a versão corrigida e `npm explain` mantém um caminho coerente até o pai direto.

#### Scenario: Override compatível é necessário
- **WHEN** a resolução natural mantém uma transitiva vulnerável apesar de todos os pais compatíveis estarem atualizados
- **THEN** um override mínimo pode ser usado somente com faixas consumidoras satisfeitas, ausência de entradas inválidas em `npm ls`, testes completos aprovados e justificativa individual no registro.

#### Scenario: Somente correção incompatível existe
- **WHEN** a única versão corrigida exige quebra de peer, upgrade major ou troca de ferramenta
- **THEN** nenhuma força ou override incompatível é aplicado e o risco residual é registrado para mudança futura.

### Requirement: Auditoria final comparável e riscos residuais explícitos
A implementação SHALL executar auditorias completa e somente de produção após uma instalação limpa e comparar seus resultados com a linha de base por total, severidade, pacote e advisory. A meta SHALL ser zero vulnerabilidades. Qualquer residual aceito SHALL existir apenas no grafo de desenvolvimento, não aumentar quantidade ou severidade e possuir advisory, versão, caminho, justificativa de incompatibilidade, análise de exposição, mitigação, responsável e data de revisão.

#### Scenario: Remediação completa
- **WHEN** todas as versões corrigidas são compatíveis
- **THEN** as duas auditorias totalizam zero e o registro demonstra a redução a partir de 27 sem exceções abertas.

#### Scenario: Residual de desenvolvimento inevitável
- **WHEN** uma vulnerabilidade exclusiva de desenvolvimento não tem correção compatível
- **THEN** a comparação a mantém visível com todos os campos obrigatórios, explica por que um upgrade incompatível foi recusado e não declara remediação total.

#### Scenario: Novo risco ou regressão de severidade
- **WHEN** a auditoria final contém vulnerabilidade nova, mais severa ou de produção
- **THEN** a remediação falha e não pode ser considerada concluída.

### Requirement: Regressão unitária e build de produção
O frontend SHALL ser instalado a partir do lockfile atualizado com `npm ci`, SHALL passar `npm test -- --watch=false` e SHALL produzir o build de produção com `npm run build`. Testes não SHALL ser removidos, ignorados ou afrouxados para acomodar a atualização.

#### Scenario: Lockfile e frontend válidos
- **WHEN** a árvore atualizada é instalada em ambiente limpo
- **THEN** `npm ci`, todos os testes unitários e o build terminam com sucesso sem alterar manifesto ou lockfile.

#### Scenario: Regressão causada pela atualização
- **WHEN** instalação, teste ou build falha após uma onda de atualização
- **THEN** a onda não avança até que a incompatibilidade seja corrigida sem reduzir a cobertura ou mascarar a falha.

### Requirement: E2E com aplicações reais e provedores isolados
A remediação SHALL passar a jornada Playwright existente com Angular real em 4200 e Spring real em 8080. Somente os provedores externos SHALL ser substituídos pelo stub local em 9090; o backend SHALL usar perfil `test` e H2, e processos preexistentes não SHALL ser reutilizados.

#### Scenario: Integração atualizada válida
- **WHEN** `npm run e2e` é executado com as portas livres e as dependências atualizadas
- **THEN** Playwright inicia os três serviços efêmeros, percorre a jornada real entre frontend e backend e termina com sucesso sem acessar provedores financeiros externos.

#### Scenario: Porta ocupada ou configuração externa
- **WHEN** uma porta necessária já está ocupada ou um endpoint de provedor não aponta para localhost:9090
- **THEN** a validação falha antes da jornada, identifica a precondição e não reutiliza nem encerra processo alheio.

### Requirement: Workflows coerentes e escopo protegido
Os workflows de qualidade e E2E do frontend SHALL continuar usando Node 24.16.0, npm 11.13.0, `npm ci` e o lockfile atualizado; qualidade SHALL executar testes e build, e E2E SHALL usar commits completos de frontend/backend e o Chromium compatível com Playwright. A remediação MUST NOT introduzir `.env`, Docker, Flyway ou Liquibase. Uma execução remota só SHALL ser declarada validada quando houver evidência de uma execução real, não apenas inspeção do YAML.

#### Scenario: Validação local e estática
- **WHEN** os workflows e comandos equivalentes são revisados após a remediação
- **THEN** versões, cache, instalação, testes, build, E2E e isolamento permanecem coerentes com o manifesto e o lockfile, sem artefatos fora do escopo.

#### Scenario: Execução remota autorizada
- **WHEN** revisões imutáveis de frontend e backend estão disponíveis no GitHub e o acionamento foi autorizado
- **THEN** os workflows de qualidade e E2E concluem com sucesso e o registro contém URLs, SHAs e conclusões reais.

#### Scenario: Execução remota ainda indisponível
- **WHEN** branch, commit ou push ainda não foi autorizado
- **THEN** a execução remota permanece uma pendência explícita e não é representada como validada.
