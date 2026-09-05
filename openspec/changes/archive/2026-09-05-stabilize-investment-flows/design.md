## Context

Ver `proposal.md` para a motivação. O planejamento abrange dois repositórios sob a mesma raiz OpenSpec: `gestao-acoes-spring` e `gestao-acoes-ui`. A descoberta foi estática; não houve execução da aplicação ou das suítes nesta etapa.

Evidências relevantes:
- `gestao-acoes-ui/src/app/app.config.ts` registra router e listeners, mas não o transporte HTTP usado pelos serviços. `app.spec.ts` importa App em vez de AppComponent; testes de ação também referenciam símbolos antigos.
- `CarteiraResource` não aplica validação ao TransacaoRequestDTO, que possui ticker, mercado, qtd e corretoraId, sem preço informado pelo cliente.
- `CarteiraService` usa cotação externa, Double, quantidade Integer e @Transactional, mas não protege concorrência; PosicaoCarteira não tem unicidade composta.
- `AcaoService` valida BRASIL/AMERICANO, enquanto estratégias aceitam também NACIONAL/INTERNACIONAL. A moeda americana é assumida no adaptador, e a brasileira possui fallback.
- A normalização de CNPJ ocorre apenas no adaptador da BrasilAPI. Mappers de criação propagam IDs do DTO.
- Dois advices tratam RuntimeException com envelopes diferentes. Credenciais estão em constantes e propriedades; não devem ser reproduzidas em documentos.
- O perfil padrão usa H2 em memória; dev usa PostgreSQL e ddl-auto=update. Não existem migrações versionadas ou testes de negócio.

## Goals / Non-Goals

**Goals:** concentrar invariantes no backend; manter contratos válidos; tornar erros previsíveis; corrigir inicialização e recuperação da interface; comprovar atomicidade e concorrência na base PostgreSQL.

**Non-Goals:** não alterar o modelo para usuário/carteira, introduzir preço manual ou custo operacional, revisar valores monetários fora de preços, médias e totais já existentes, substituir provedores ou remover o mercado americano. A taxa fixa de câmbio continua explícita como limitação; estabilização não equivale a certificação dos cálculos de uma carteira real.

## Decisions

### 1. Validar na fronteira e proteger o serviço

Aplicar Bean Validation ao DTO e @Valid em compra/venda. Configurar desserialização estrita: texto, fração, `10.0` e número não representável em campos inteiros retornam 400; inteiro representável que viola a regra retorna 422. Validar invariantes também no serviço para chamadas que não passam pelo controller. A ordem é tipos, formato/campos, referências, regras dependentes, integração e persistência. DTOs de criação não poderão atualizar registros por ID: rejeitar id não nulo e não propagá-lo aos mappers de insert.

Alternativa rejeitada: confiar apenas no formulário Angular, pois chamadas diretas continuariam vulneráveis. A validação local permanece para feedback imediato, incluindo quantidade inteira.

### 2. Uma representacao canonica

Centralizar normalização e validação no backend, antes de buscas ou seleção de estratégia. Ticker usa trim e uppercase com locale estável; mercado usa aliases documentados e valores persistidos BRASIL/AMERICANO. No corpo, validar primeiro CNPJ como 14 dígitos ou máscara convencional após trim; só então remover a pontuação. Na URL, aceitar somente 14 dígitos. Em ambos, validar dígitos verificadores e rejeitar sequências repetidas antes de buscar dados.

Aplicar a mesma política a cadastros, consultas e operações. Usar unicidade no banco como garantia final para cadastros concorrentes, traduzindo colisão conhecida em 409. Identificar legado não canônico antes de impor restrições. Não incluir um novo alias BRASILEIRO apenas porque aparece em comentários: ele não é suportado atualmente pelas estratégias.

Alternativa rejeitada: normalizar somente no frontend ou nos clientes externos, pois não protege persistência e duplicidades.

### 3. Preco externo permanece, com validacao uniforme

Manter a obtenção de preço pelo backend, sem adicionar campo ao contrato de transação. Validar resposta de cotação antes de cadastro, atualização, operação ou soma patrimonial: preço presente, finito e positivo; moeda coerente. O serviço verifica o mercado da requisição contra o cadastro e seleciona estratégia pelo cadastro.

No adaptador Twelve Data que só recebe preço, preservar USD como moeda do contrato do mercado americano; não alegar que houve verificação independente de moeda pelo provedor. Na Brapi exigir moeda utilizável da resposta, evitando fallback que encubra dado inválido. Se um adaptador retornar moeda divergente, rejeitá-la em todos os consumidores.

Usar aritmética decimal nos preços, médias e totais já existentes. Preço unitário e médio usam precisão 19, escala 8 e HALF_UP; o preço externo é arredondado e revalidado antes de persistir. A média usa multiplicações exatas sobre valores persistidos e uma única divisão final em escala 8 HALF_UP. O patrimônio soma componentes sem arredondá-los a duas casas e arredonda apenas o total para escala 2 HALF_UP. O JSON mantém valores numéricos. Detectar overflow da quantidade e valores fora da precisão configurada antes de gravar. Uma revisão monetária de outros domínios permanece fora do escopo.

Alternativa rejeitada: acrescentar preço manual, que mudaria o significado do fluxo atual e ampliaria a solicitação.

### 4. Atomicidade e concorrencia por corretora

Preservar transação de banco envolvendo histórico e posição. Serializar alterações da carteira por bloqueio pessimista da linha da corretora, que já existe mesmo na primeira compra; todos os caminhos de compra/venda precisam obter o mesmo bloqueio antes de ler/alterar posição. Adicionar restrição única (acao_id, corretora_id), quantidade positiva nas posições/transações e preço positivo nas colunas pertinentes como defesa adicional, após saneamento explícito do legado.

A cotação e validações externas devem ocorrer antes da região transacional com bloqueio. Depois de adquirir o bloqueio, reler a posição e revalidar saldo/limites antes de gravar; a cotação obtida para aquela requisição permanece seu preço. Usar separação de serviço ou fronteira transacional que evite self-invocation sem proxy. Não retornar sucesso antes de confirmar a transação. Timeout de lock/conflito conhecido resulta em 409 CONCURRENT_OPERATION; saldo insuficiente reavaliado após o lock é regra de negócio e resulta em 422 INSUFFICIENT_POSITION; falha inesperada resulta em 500 e rollback.

Alternativas: bloquear só posição não protege a primeira compra; versão otimista com retries é possível, mas exige tratamento adicional de criação concorrente. Bloqueio por corretora é mais simples para o volume atual, embora serialize também ativos diferentes dessa corretora.

Não haverá retry automático de compra/venda no frontend. Compra e venda compartilham um bloqueio do formulário, inclusive para alternância do tipo. Se nenhuma resposta chegar após o envio, o estado é resultado desconhecido: preservar dados, não declarar sucesso/falha e orientar atualização das posições antes de nova tentativa. Isso reduz risco, mas não garante idempotência após perda de resposta.

### 5. Um unico contrato de erro

Consolidar os advices em um ponto de tratamento com exceções classificadas; RuntimeException genérica deve representar erro inesperado, não automaticamente 400. O envelope mantém timestamp, status, error, message e path, acrescentando code e fieldErrors. Aplicar o mapeamento AE-01: 400 para JSON/tipo incorreto, 422 para regra inválida, 404 para recurso ausente, 409 para duplicidade ou conflito concorrente, além das integrações e falhas previstas. Preservar 405/415 no mesmo envelope. Não expor mensagem bruta de Feign ou URL completa.

No Angular, centralizar tipagem e extração segura do envelope nos serviços/utilitário compartilhado. Exibir mensagens em todos os carregamentos e mutações atuais; controlar estados inicial, carregando, sucesso, recusado, resultado desconhecido e erro de atualização. Uma mutação confirmada seguida por falha de leitura mantém a confirmação e mostra aviso separado, com nova tentativa apenas da leitura. Falha inicial não vira lista vazia ou patrimônio zero; falha posterior mantém dados antigos sinalizados.

Alternativa rejeitada: manter handlers sobrepostos e tratar todas as falhas com strings diferentes em cada componente.

### 6. Bootstrap e segredos por configuracao

Registrar provideHttpClient na configuração raiz usada por bootstrapApplication. Nos testes, combinar o transporte com o backend HTTP de teste na ordem adequada e incluir teste usando os providers reais da aplicação para que uma configuração exclusiva de teste não esconda o defeito.

Usar propriedades backend existentes api.brapi.token e api.twelvedata.key referenciando BRAPI_TOKEN e TWELVEDATA_API_KEY, sem valor real padrão. Externalizar senha do PostgreSQL por DB_PASSWORD, obrigatória no perfil dev. Validar presença de credenciais de cotação na inicialização real; testes substituem integrações e usam valores fictícios explícitos. Revisar código, properties, documentação e coleção Postman sem copiar segredos para fixtures, exemplos ou logs. Documentar a substituição das credenciais anteriormente expostas pelo responsável, sem reescrever histórico Git.

Alternativa rejeitada: constantes de teste reutilizadas como fallback real, pois escondem configuração ausente e mantêm exposição.

### 7. Estrategia de verificacao e aceite

| Camada | Evidência exigida |
|---|---|
| Serviço backend | TI-01 a TI-05, preços/moedas inválidos, precisão decimal, médias ponderadas e limites |
| HTTP backend | status/envelope AE-01, JSON/frações inválidas, aliases e IDs em criação |
| Persistência | rollback confirmado por nova transação de leitura; unicidade; compras, vendas e duplicidades concorrentes com barreiras em PostgreSQL isolado, timeout limitado e resultados exatos |
| Angular | bootstrap real, contratos de cada serviço, campos inválidos, pendência, mensagens e falhas de leitura |
| Integração entre repositórios | navegador contra backend de teste com provedores stubados: corretora, PETR4 e AAPL, cotação, compra, posições, patrimônio, venda e erro |
| Configuração | inicialização sem segredos falha de forma segura; valores externos chegam aos clientes; varredura do conteúdo versionado atual sem revelar valores |

Comandos esperados na implementação: backend `mvnw.cmd verify`; frontend `npm ci`, `npm run build` e `npm test -- --watch=false`. Adicionar comando explícito para integração PostgreSQL e jornada de navegador, documentando os pré-requisitos e usando dados isolados. Nenhuma suíte pode consumir APIs financeiras reais. Dependências de teste adicionais devem se limitar à execução desses cenários.

## Risks / Trade-offs

- Dados legados colidem após normalização -> relatório prévio e interrupção sem exclusão/merge automático; preservar vínculos e backup.
- Lock por corretora reduz paralelismo -> região crítica curta, sem rede, timeout tratado e teste no PostgreSQL.
- Migração de Double para decimal pode encontrar legado fora da precisão -> diagnóstico anterior à alteração e interrupção sem arredondamento silencioso de dados legados.
- A cotação recebida pode estar desatualizada -> não chamar o fluxo de execução real de ordem; histórico de mercado permanece fora do escopo.
- HTTP de erros muda -> frontend e backend entregues coordenadamente e contrato testado; sucesso permanece compatível.
- Segredos ainda existem no histórico -> substituição/revogação operacional antes da disponibilização; remoção do conteúdo atual não equivale a revogação.
- Reenvio após resposta perdida pode duplicar operação -> não fazer retry automático; documentar ausência de idempotência persistente.

## Migration Plan

1. Antes da implementação, registrar estado Git dos dois repositórios e preservar alterações locais existentes.
2. Preparar backup do PostgreSQL e procedimento versionado e transacional de verificação/normalização de dados. Detectar CNPJs/tickers equivalentes, aliases, posições duplicadas, quantidades/preços inválidos ou fora da precisão 19/8 e referências inconsistentes. Interromper se houver conflito; não inferir consolidação financeira nem arredondar legado silenciosamente.
3. Aplicar normalização, migração decimal e restrições somente após verificação limpa. H2 de teste deve refletir as mesmas restrições relevantes. Não confiar apenas em ddl-auto=update para alterar dados legados.
4. Configurar credenciais novas no ambiente e confirmar que o conteúdo atual dos repositórios não contém os valores antigos. O responsável executa revogação/substituição no provedor.
5. Entregar versões coordenadas dos dois repositórios e executar jornadas BRASIL/BRL e AMERICANO/USD com dados isolados.
6. Em falha, interromper gravações e restaurar o par de versões compatível. Reverter esquema/dados pelo procedimento documentado ou backup verificado; nunca remover restrições com tráfego ativo nem descartar operações confirmadas após o backup sem conciliação. A proposta não executa deploy, migração ou alteração de credenciais.
