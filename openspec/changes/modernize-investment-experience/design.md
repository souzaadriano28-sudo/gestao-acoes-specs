## Context

Ver [proposal.md](./proposal.md) para a motivação. O sistema é composto por Angular 21, Spring Boot/Java 17 e PostgreSQL 17, executados como exatamente três serviços Compose. A modernização cruza UI, contratos HTTP, cálculo financeiro, persistência de proveniência, integrações externas e testes. A mudança separada `add-secure-admin-authentication` é predecessora obrigatória e fornecerá sessão, rotas protegidas e logout antes deste trabalho.

### Auditoria do frontend atual

- Rotas: a raiz redireciona para `/carteira`; existem apenas `/carteira`, `/corretoras` e `/acoes`. Não há Dashboard, Operações, rota 404, lazy loading ou indicação de rota ativa.
- Estrutura: `AppComponent` contém título e navegação horizontal; os três componentes standalone acumulam carregamento, apresentação e envio de formulário.
- Serviços: `AcaoService`, `CorretoraService` e `CarteiraService` espelham os endpoints atuais. `parseApiError` preserva `message`, `fieldErrors` e identifica somente erro de rede como resultado desconhecido.
- Estado: booleans locais (`carregando`, `cargaFalhou`, `dadosDesatualizados`, `salvando`, `operacaoPendente`) já evitam duplicação básica. `CarteiraComponent` usa `forkJoin`, então uma única falha impede atualizar todas as quatro leituras.
- Apresentação: quase todo CSS está inline e os arquivos CSS estão vazios; há largura máxima fixa, grid de duas colunas sem breakpoint, listas em cartões e navegação que tende a estourar em telas estreitas.
- Formatação: usa `number` com prefixo de moeda manual e `date` sem política de timezone; não usa `CurrencyPipe`, não formata percentuais e não diferencia semanticamente códigos ISO.
- Acessibilidade: há headings e alguns labels visuais, mas faltam associação sistemática `for/id`, regiões/landmarks completas, link de salto, `aria-current`, live regions, resumo de erros, foco após navegação/erro, foco visível padronizado e evidência de contraste/reflow.
- Testes: existem unitários de serviços/componentes e um E2E do fluxo principal; faltam testes sistemáticos de rotas, responsividade, semântica, teclado e acessibilidade.

### Auditoria dos contratos e dados do backend

| Área | Disponível hoje | Não disponível hoje |
|---|---|---|
| Ações | id, ticker, nome opcional, mercado, moeda, cotação atual e `LocalDateTime` da atualização; cadastro/lista/detalhe/busca/atualização | fonte, instante do provedor, offset/fuso, variação, série histórica, setor, logo, fundamentos |
| Corretoras | id, CNPJ, razão/nome, contato/endereço opcionais, situação cadastral, booleano `validadaNaCvm`, data de cadastro | evidência oficial da CVM/BCB, categoria do participante, fonte e instante da verificação |
| Operações | POST de compra/venda; entidade transação persiste tipo, quantidade, preço, data, ativo e corretora | endpoint de consulta, paginação/filtros, idempotency key, custos, nota, liquidação, origem histórica da cotação |
| Posições | ticker, razão social da corretora, quantidade, preço médio e moeda | ids, mercado, cotação corrente, valor, custo, resultado, timestamps e estados por posição |
| Resumo | `/saldo-total` retorna patrimônio de mercado consolidado em BRL | composição, `asOf`, fonte das cotações, câmbio usado, custo, lucro/prejuízo, rentabilidade, caixa/saldo disponível |
| Câmbio | constante interna USD/BRL 5,30 | taxa atual/referência, fonte, data, política de indisponibilidade e histórico |

### Regras obrigatórias do domínio

1. Identificadores são normalizados; CNPJ deve ser válido e único, ticker é único, mercado canônico é BRASIL ou AMERICANO e a sintaxe depende do mercado.
2. Quantidade e ids são inteiros positivos, sem coerção/truncamento; a quantidade máxima é 2.147.483.647.
3. Preço vem do backend/provedor, deve ser positivo, moeda compatível (BRL/USD) e é persistido com precisão 19, escala 8 e HALF_UP.
4. Compra cria ou incrementa a posição por ativo-corretora e recalcula preço médio ponderado; venda parcial mantém o preço médio; venda total remove a posição, preservando transações.
5. Venda sem posição ou acima da quantidade é rejeitada; transação e posição são atômicas.
6. Existe no máximo uma posição por ativo-corretora. O bloqueio pessimista atual é obtido pela corretora para serializar mutações concorrentes; conflito não resolvido retorna 409.
7. Não existe saldo de caixa. O endpoint chamado `saldo-total` representa valor de mercado das posições, não dinheiro disponível.
8. Posições BRL e USD mantêm preço médio na moeda nativa. Qualquer consolidação exige taxa cambial explícita e rastreável.
9. Falha de cotação não pode virar zero nem resultado parcial apresentado como completo. Falha de comunicação de mutação pode deixar resultado desconhecido e não autoriza reenvio automático.

### Melhorias profissionais recomendadas

1. Read models próprios para tela, paginação server-side, falha parcial explícita e timestamps com `Instant`/offset.
2. Persistir proveniência de cotações e integrar fonte de câmbio configurável; remover a constante 5,30.
3. Separar shell, páginas, componentes apresentacionais, componentes de estado e facades por contexto.
4. Usar reactive forms tipados, tokens CSS, componentes semânticos compartilhados e carregamento por rota.
5. Instrumentar desempenho, cache de leituras com política visível de atualidade e correlação segura de falhas, sem registrar segredos.
6. Paginar movimentações e preservar filtros na URL; não carregar listas ilimitadas no cliente.
7. Validar corretoras por base oficial separada da consulta empresarial e manter estados `NOT_CHECKED`, `VERIFIED`, `NOT_FOUND`, `STALE`, `UNAVAILABLE`.

### Funcionalidades reguladas ou tributárias fora do escopo atual

- Enviar, rotear, cancelar, executar ou liquidar ordens; conectar conta/custódia real; atuar como intermediário.
- Recomendar, classificar, comparar como oportunidade, definir preço-alvo ou aconselhar individualmente; suitability e perfil de investidor.
- Apurar imposto, day trade, isenção mensal, prejuízos compensáveis, IRRF, DARF, ReVar ou declaração; faltam custos, vendas mensais completas, eventos e demais dados fiscais.
- Importar notas de corretagem/B3, calcular corretagem, emolumentos, liquidação D+2, desdobramentos, grupamentos, bonificações, subscrições, proventos ou preço médio fiscal.
- Certificar autorização de uma instituição sem consulta oficial ao cadastro de participantes.

### Dados que o backend não fornece e não podem ser inventados no frontend

- Histórico/movimentações via API, patrimônio por posição, custo total consolidado, lucro/prejuízo, rentabilidade, variação diária ou em qualquer janela.
- Caixa/saldo disponível, aportes, retiradas, proventos, impostos, taxas, benchmarks, metas e alocação por setor/classe.
- Fonte e instante real do provedor das cotações; timezone de `dataHoraCotacao`; atualidade contratual do dado.
- Taxa, fonte e data de câmbio; a constante 5,30 atual não deve ser apresentada como cotação vigente.
- Evidência de registro/autorização CVM/BCB; `validadaNaCvm=true` hoje é derivado de CNAE e não comprova isso.
- Logos, imagens, setor, indicadores fundamentalistas, notícias, recomendações ou qualquer dado visto nos produtos de referência.

## Goals / Non-Goals

**Goals:**

- Definir fronteiras entre UI e cálculo financeiro para que o backend permaneça fonte de verdade.
- Criar arquitetura visual/componentizada que implemente os cenários IU, PR, SO, BR e AI-05.
- Permitir migração aditiva e verificável sem quebrar clientes dos endpoints atuais.
- Fazer do protótipo um contrato de hierarquia e responsividade, não uma implementação reutilizada diretamente.

**Non-Goals:**

- Escolher um design system de terceiros ou adicionar dependência de componentes nesta fase.
- Reproduzir paridade funcional com Investidor10 ou Status Invest.
- Redefinir autenticação, sessão ou login já especificados em `add-secure-admin-authentication`; esta mudança apenas os integra depois de concluídos.
- Resolver multiusuário, tributação, custódia, execução de ordens ou ingestão B3.
- Alterar o Angular ou o Spring enquanto esta proposta estiver em planejamento.

## Decisions

### 1. Arquitetura de informação original e progressiva

Desktop usará rail lateral de 248 px, topbar enxuta e conteúdo com largura máxima de 1440 px. Tablet em 768 px usará rail de 84 px com nomes acessíveis e tooltips não essenciais, preservando 684 px para a área principal. Celular usará cabeçalho compacto e navegação inferior para as cinco rotas, com padding igual à altura real mais safe area. A hierarquia será: contexto/atualização, título e ação principal, resumo, conteúdo operacional e detalhe. Investidor10 e Status Invest informaram apenas padrões abstratos úteis — navegação por domínio, busca, resumo, cartões densos e passagem de resumo a transações — sem reutilizar texto, marca, imagens, grid ou composição.

Alternativa considerada: manter navegação superior e três telas. Rejeitada porque mistura dashboard e boleta, não escala para Operações e falha em largura móvel.

### 2. Rotas e páginas

- `/dashboard`: visão inicial com quatro cartões possíveis, composição somente se retornada pelo backend, tabela curta de posições, cinco movimentações e status de fontes; contém apenas CTA discreto para Operações.
- `/carteira`: resumo e tabela completa de posições, filtros por mercado/corretora e explicação de cálculo.
- `/acoes`: catálogo, busca/cadastro e atualização de cotação.
- `/corretoras`: cadastro e lista com evidência cadastral/regulatória separada.
- `/operacoes`: formulário de compra/venda simulada e histórico paginado.
- `/**`: página não encontrada.

Filtros de leitura ficam em query params. A ação principal do Dashboard navega à rota Operações. O formulário existe somente nessa rota e abre como região/painel não modal, evitando foco complexo, concorrência com indicadores e falta de espaço móvel.

### 3. Inventário de componentes planejados

`AppShell`, `SideNavigation`, `MobileNavigation`, `TopBar`, `AcademicDisclaimer`, `PageHeader`, `SummaryCard`, `DataStatus`, `QuoteProvenance`, `AsyncRegion`, `EmptyState`, `ErrorSummary`, `PositionsTable`, `MovementsTable`, `AssetTable`, `BrokerTable`, `OperationForm`, `OperationReview`, `StatusBadge`, `CurrencyValue`, `PercentageValue`, `DateTimeValue`, `Pagination` e `ToastRegion`.

Páginas orquestram read models por facade; componentes de valor/estado são puros. Estado remoto será união discriminada (`idle/loading/success/empty/error/stale/unavailable`) em vez de combinações inválidas de booleanos. Alternativa: adotar store global. Rejeitada inicialmente porque o domínio é pequeno; facades por rota fornecem cancelamento, cache e testabilidade sem dependência nova.

### 4. Contratos aditivos de leitura

Planejar:

- `GET /carteira/dashboard`: resumo, posições resumidas, movimentações recentes, `asOf`, status e fontes.
- `GET /carteira/posicoes/detalhadas`: página/filtros e cálculos por posição.
- `GET /carteira/movimentacoes`: página/filtros determinísticos.
- `GET /cambio/USD/BRL`: taxa de referência e metadados, ou encapsular o mesmo objeto dentro do dashboard.

DTOs usam números JSON decimais, códigos ISO e instantes ISO 8601 com offset/UTC. Métricas incluem `availability` e `reason`; totais dependentes de um componente indisponível não são parciais. O frontend não junta `/acoes`, `/posicoes` e `/saldo-total` para recalcular finanças.

Alternativa: calcular tudo no Angular com as listas atuais. Rejeitada por precisão, multimoeda, falhas parciais, duplicação de regra e ausência de campos.

### 5. Proveniência e câmbio

Novas cotações guardarão `provider`, `referenceAt`, `fetchedAt`, `currency` e estado. Conversão USD/BRL será obtida por porta configurável e carregará par, taxa, fonte e instantes. Se PTAX/BCB for escolhida, será descrita como taxa de referência, não tempo real, e sua data útil será visível. Registros antigos terão proveniência `UNAVAILABLE`; não haverá backfill inventado.

Alternativa: continuar com 5,30 ou buscar câmbio no navegador. Rejeitada porque o valor fica desatualizado, não auditável e inconsistente entre clientes.

### 6. Evidência de corretora

Remover a semântica de `validadaNaCvm` como derivação de CNAE. Manter dois blocos: `businessRegistration` (fonte empresarial) e `regulatoryEvidence` (base oficial CVM/BCB). Uma migração preservará o booleano legado apenas para auditoria e o mapeará inicialmente como `NOT_CHECKED`, nunca como `VERIFIED`.

Alternativa: renomear visualmente o booleano atual. Rejeitada porque mudaria o rótulo, não a validade da evidência.

### 7. Operações sem aparência de ordem real

O preço permanece ausente do payload e será consultado pelo backend. A revisão mostra que o preço não é garantido e que o resultado é um registro simulado. Não haverá atualização otimista. Após 200, o cliente relê dashboard/posições/movimentações; se a releitura falhar, mantém sucesso da mutação separado. Em status 0, prioriza reconciliação.

Alternativa: “boleta de negociação” com Comprar/Vender como home broker. Rejeitada por expectativa falsa de execução e por não haver cotação indicativa antes do envio no contrato.

### 8. Sistema visual

Tokens propostos: azul-marinho `#0B1F3A`, azul de ação `#185ADB`, fundo `#F4F7FB`, superfície `#FFFFFF`, texto `#172033`, texto secundário `#5D6B82`, borda `#D8E0EC`, positivo `#137A4A`, negativo `#B4232C`, aviso `#9A6700`. Fonte será uma pilha de sistema, evitando download e dependência externa. Cards têm raio 16 px, borda sutil e sombra mínima; tabelas usam header fixo apenas quando não encobrir foco.

A escala tipográfica será 12/14/16/20/28/36 px com line-height mínimo de 1,4 para corpo; grid base de 4 px, espaçamento principal 8/12/16/24/32/48 px e largura de leitura controlada. Densidade de tabelas será confortável por padrão (linha mínima de 56 px desktop e 64 px touch) e jamais reduzirá alvos ou legibilidade. Estados hover, focus-visible, active, disabled, invalid e pending terão tokens próprios e contraste medido.

Verde/vermelho nunca serão usados para compra/venda como promessa de ganho/perda; representam somente resultado matemático real e sempre vêm com sinal/ícone/texto. O azul é a ação primária.

### 9. Responsividade

- `>= 1200 px`: rail, quatro cartões, tabelas completas.
- `768–1199 px`: rail compacto de 84 px ou drawer, dois cartões por linha, conteúdo útil mínimo de 684 px no viewport de referência.
- `< 768 px`: uma coluna, navegação inferior com safe area e reserva de layout, ações empilhadas, resumo rolável apenas dentro de regiões explicitamente rotuladas quando inevitável.
- 320 CSS px: sem overflow horizontal da página; tabelas viram cartões de linha com pares rótulo/valor.

O conteúdo deverá ser validado em 1440×1024, 768×1024, 390×844 e 320×568, em zoom 200% e com strings longas.

### 10. Acessibilidade WCAG 2.2 AA

Landmarks (`header`, `nav`, `main`, `footer`), ordem de headings, link “Pular para conteúdo”, `aria-current=page`, nomes acessíveis, foco `:focus-visible`, foco não encoberto, error summary, `aria-describedby`, `aria-live=polite` para leituras e `role=alert` apenas para falha que exige atenção. Skeletons serão ocultos de tecnologia assistiva e terão texto de status. Touch targets obedecem 24×24 CSS px ou espaçamento equivalente; ações principais buscarão 44 px. Preferências `prefers-reduced-motion` e `forced-colors` serão respeitadas.

Testes automatizados ajudam a detectar regressões, mas teclado, leitor de tela, zoom/reflow e contraste em estados reais terão checklist manual.

### 11. Estratégia de testes e execução pelos containers

- Unitários frontend: pipes/utilitários de moeda/data/percentual, reducers de estado, facades, services/contratos, formulários e todos os componentes compartilhados.
- Componentes: conteúdo por estado, cabeçalhos/labels, foco, anúncios, breakpoints e ausência de cálculos proibidos.
- Backend: DTO/contrato, precisão, falha parcial, paginação, proveniência, migração e evidência regulatória simulada.
- Concorrência: manter testes PostgreSQL com barreiras para primeira compra, vendas disputadas e timeout; garantir que os read models observem apenas dados confirmados.
- E2E: Playwright desktop/celular, teclado, vazio, sucesso, erros 4xx/5xx, fonte ausente, stale, câmbio indisponível, resultado desconhecido e reconciliação.
- Containers: construir e iniciar `postgres`, `backend`, `frontend`; aguardar os três healthchecks; executar E2E contra Nginx `/api` com stubs no host; não chamar provedores reais; validar persistência e encerrar sem apagar volumes não descartáveis.

## Riscos / Trade-offs

- [Read model amplia o backend e a migração] → entregar contratos e proveniência antes de cartões dependentes; manter endpoints legados.
- [Taxa cambial de referência pode não representar preço executável] → exibir fonte, data, natureza e indisponibilidade; não chamar de tempo real.
- [LocalDateTime atual é ambíguo] → não converter silenciosamente; migrar novos contratos para `Instant` e marcar legado sem fuso.
- [`validadaNaCvm` contém falsos positivos semânticos] → nunca exibir como verificada; migrar para evidência estruturada e revisar dados.
- [Falha de uma cotação derruba hoje o saldo inteiro] → read model com granularidade e total indisponível, sem total parcial enganoso.
- [Bloqueio por corretora é mais amplo que ativo-corretora] → manter por segurança na primeira entrega e medir contenção; otimização exige teste concorrente equivalente.
- [Ticker único global impede colisões entre mercados e padrões são estreitos] → manter compatibilidade nesta mudança; registrar como ambiguidade antes de ampliar universo de ativos.
- [Protótipo usa dados demonstrativos] → rotular em cada viewport e impedir que números sejam convertidos em fixtures/expectativas de produção sem contrato.
- [Referências comerciais mudam] → registrar apenas princípios abstratos observados em 2026-09-06 e não criar dependência funcional/visual.
- [Automação de acessibilidade não prova AA] → combinar axe/semelhante com checklist manual e evidência por viewport/tecnologia assistiva.

## Migration Plan

1. Congelar exemplos de contrato atual e adicionar contract tests de compatibilidade.
2. Criar migrações aditivas para proveniência e evidência, sem apagar o booleano legado.
3. Implementar portas/adapters simuláveis de câmbio e cadastro oficial; backfill somente como `UNAVAILABLE`/`NOT_CHECKED`.
4. Entregar read models e testes backend, mantendo endpoints antigos.
5. Construir tokens, shell, componentes de estado/valor e rotas Angular atrás de integração interna.
6. Migrar uma página por vez; habilitar Dashboard somente quando seus contratos estiverem disponíveis.
7. Executar gates unitários, integração, concorrência, WCAG e E2E nos quatro viewports e três containers.
8. Rollback: reverter frontend para as rotas antigas e parar de consumir endpoints aditivos; manter colunas/tabelas aditivas sem perda. Uma remoção futura exige mudança própria.

Pré-condição de execução: comprovar que todas as tarefas e testes de `add-secure-admin-authentication` foram concluídos. Nenhum shell/dashboard será implementado sobre endpoints anônimos para posterior adaptação.

## Ambiguidades registradas

- “Saldo” pode significar caixa, mas o backend só fornece patrimônio de mercado; toda UI usará “patrimônio” até existir ledger de caixa.
- A origem exata e a licença operacional de um feed de câmbio ainda precisam de escolha; a spec fixa o comportamento, não o fornecedor.
- A política de freshness de cotações e PTAX depende do calendário/mercado e deverá ser configurada e documentada antes da implementação.
- O universo chamado “ações” aceita BRASIL e AMERICANO, mas os regex atuais excluem símbolos americanos com ponto/hífen e não modelam lote/ticker fracionário brasileiro; a expansão não faz parte desta mudança.
- `nomeEmpresa` não é preenchido pelos adapters atuais, embora o DTO o exponha.
- A consulta BrasilAPI usada hoje não é fonte oficial solicitada para evidência regulatória; ela pode permanecer como enriquecimento empresarial, não como prova CVM.

## Fontes e referências consultadas em 2026-09-06

Referências de produto, somente para hierarquia/densidade/navegação/cartões/tabelas/indicadores:

- Investidor10: https://investidor10.com.br/
- Status Invest: https://statusinvest.com.br/

Fontes oficiais brasileiras pertinentes:

- CVM, Corretoras e Distribuidoras e Resolução CVM 234: https://www.gov.br/cvm/pt-br/assuntos/regulados/consultas-por-participante/corretoras-e-distribuidoras/corretoras-e-distribuidoras
- CVM, Cadastro de participantes autorizados: https://www.gov.br/cvm/pt-br/canais_atendimento/consultas-reclamacoes-denuncias/participantes-autorizados
- CVM, atividade de consultoria (Resolução CVM 19): https://www.gov.br/cvm/pt-br/assuntos/regulados/consultas-por-participante/consultores-de-valores-mobiliarios/consultores-de-valores-mobiliarios
- CVM, atividade de analista (Resolução CVM 20): https://conteudo.cvm.gov.br/legislacao/resolucoes/resol020.html
- CVM Dados Abertos, cadastro diário de intermediários: https://dados.cvm.gov.br/dataset/intermed-cad
- B3, características de ações, cotação, lote e liquidação D+2: https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/acoes.htm
- Receita Federal, Perguntas e Respostas IRPF 2026, renda variável: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/dirpf/p-r-irpf-2026-v1-00-2026-04-23.pdf
- Receita Federal, visão geral de Renda Variável/ReVar: https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/pagamento/renda-variavel/renda-variavel
- Banco Central, histórico de cotações: https://www.bcb.gov.br/estabilidadefinanceira/historicocotacoes
- Banco Central, metodologia PTAX (Circular 3.506): https://normativos.bcb.gov.br/Lists/Normativos/Attachments/49545/Circ_3506_v1_O.pdf
- ANPD, perguntas frequentes e conceito de dado pessoal: https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes
- ANPD, RIPD, necessidade, proporcionalidade, segurança e transparência: https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/relatorio-de-impacto-a-protecao-de-dados-pessoais-ripd
- W3C, WCAG 2.2: https://www.w3.org/TR/WCAG22/

Conclusão de pertinência: CVM/BCB limitam alegações sobre autorização e atividades reguladas; B3 ajuda a distinguir registro acadêmico de negociação/liquidação real; Receita evidencia por que cálculo tributário exige dados fora do contrato; ANPD tem impacto limitado hoje porque não há conta de pessoa natural, mas orienta minimização caso isso seja adicionado.
