## 0. Aprovação e baseline

- [x] 0.1 Registrar a auditoria containerizada do estado atual, incluindo login, cinco rotas autenticadas, vazio, loading, erro, parcial, stale, indisponibilidade, sessão expirada e 404 nas larguras de 1440, 768, 720, 390 e 320 px; verificar as capturas em `audit/current/`, as medições em `audit/current/metrics.json` e a matriz em `audit/matrix.md`
- [x] 0.2 Produzir protótipos comparáveis de Login, Dashboard, Carteira e Operações usando somente campos existentes e dados explicitamente simulados; verificar `prototype/screenshots/metrics.json`, ausência de overflow nas 12 capturas e inspeção visual humana
- [x] 0.3 Obter aprovação explícita para a direção “finanças editoriais calmas”, patrimônio hero navy, qualidade fechada em sucesso/aberta em impacto e iconografia SVG local; verificar registro das quatro decisões antes de alterar o Angular

## 1. Fundação visual Atlas

- [x] 1.1 Refinar tokens de cor, tipografia, números tabulares, espaçamento, raios, bordas, sombras, foco e movimento, sem adicionar dependências; verificar testes de tokens, contraste AA e `prefers-reduced-motion`
- [x] 1.2 Criar a marca cartográfica compacta e os cinco ícones SVG locais com traço coerente, mantendo rótulos e `aria-hidden` em desenhos decorativos; verificar testes de nomes acessíveis e inspeção visual em claro/escuro do shell
- [x] 1.3 Consolidar primitivas de superfície, botão, badge, linha financeira e disclosure para eliminar CSS duplicado; verificar busca por estilos inline, testes dos componentes e revisão do diff
- [x] 1.4 Aplicar a linguagem visual ao shell desktop, tablet e mobile sem alterar rotas, guard, sessão, CSRF ou logout; verificar testes existentes de autenticação/navegação e capturas em 1440, 768, 720, 390 e 320 px

## 2. Login, navegação e mensagens globais

- [x] 2.1 Reorganizar o Login para priorizar marca, campos e CTA, reduzindo narrativa e mantendo finalidade, segurança e sessão expirada; verificar campos/CTA na primeira dobra de 390×844, navegação por teclado e testes de autenticação
- [x] 2.2 Substituir iniciais da navegação pelos ícones aprovados e reforçar o item atual além da cor; verificar foco, nomes acessíveis, títulos, breadcrumbs e testes responsivos dos cinco destinos
- [x] 2.3 Consolidar o aviso acadêmico em uma formulação persistente e discreta por viewport, sem remover a indicação de simulação; verificar inspeção nas cinco larguras e teste que impeça duplicação simultânea
- [x] 2.4 Harmonizar 404, sessão expirada e logout com a voz visual Atlas, preservando retorno seguro e anúncios dinâmicos; verificar testes de rota desconhecida, expiração, logout e foco inicial

## 3. Dashboard e qualidade dos dados

- [x] 3.1 Implementar patrimônio estimado como métrica hero e custo, resultado não realizado e posições ativas como grupo compacto, sem alterar cálculos ou contratos; verificar testes de associação entre rótulo, moeda, disponibilidade e valor
- [x] 3.2 Reorganizar principais posições e movimentações para leitura imediata em desktop e mobile, mantendo somente dados retornados pelo backend; verificar sucesso, vazio e equivalência de conteúdo em tabela/cartões
- [x] 3.3 Transformar qualidade dos dados em resumo acessível e detalhe progressivo com fonte, referência, coleta e freshness; verificar fechado em sucesso e comportamento aprovado para stale/indisponibilidade
- [x] 3.4 Compactar a apresentação de parcial, stale e indisponível sem converter ausência em zero nem tratar total parcial como completo; verificar fixtures de contrato e testes dos estados `AVAILABLE`, `STALE` e `UNAVAILABLE`
- [x] 3.5 Preservar atualização independente e recuperação de falhas sem recarregar a aplicação; verificar testes HTTP de sucesso, timeout/erro, retry e independência dos painéis

## 4. Carteira, Ações e Corretoras

- [x] 4.1 Compactar filtros da Carteira e posicionar a coleção na primeira dobra quando houver conteúdo, preservando busca, ordenação, filtros ativos e limpeza; verificar testes de interação e captura em 768×1024
- [x] 4.2 Refinar tabela desktop com alinhamento numérico tabular e hierarquia de colunas sem perder `scope`, ticker, mercado, moeda, corretora, quantidade, preço, cotação, valor e resultado; verificar teste de tabela e navegação por tecnologia assistiva automatizável
- [x] 4.3 Refinar cartões mobile da Carteira com pares curtos e comparáveis, tratando cotação e conversão individualmente; verificar 390×844, reflow 320 px e casos sem cotação/câmbio
- [x] 4.4 Reduzir o peso visual dos painéis de cadastro de Ações e Corretoras sem remover funcionalidades, validações ou integrações externas; verificar fluxos de cadastrar/editar/atualizar e lista visível na primeira dobra de 768×1024
- [x] 4.5 Harmonizar evidência CVM, botões, badges, feedback e estados nas duas páginas, sem inferir autorização a partir de CNAE ou situação cadastral; verificar os cinco estados regulatórios e testes existentes

## 5. Operações

- [x] 5.1 Reagrupar tipo, ativo, corretora, quantidade e revisão em um fluxo compacto, mantendo confirmação antes do envio; verificar percurso completo por teclado em desktop, 390 e 320 px
- [x] 5.2 Colocar formulário antes do histórico no mobile e organizar ambos na primeira dobra possível no desktop, sem a navegação fixa cobrir controles ou mensagens; verificar bounding boxes e capturas nas cinco larguras
- [x] 5.3 Tornar filtros avançados recolhíveis em mobile, preservando valores, indicação de filtros ativos, aplicar e limpar; verificar testes de disclosure, filtros, paginação e ordenação
- [x] 5.4 Compactar cartões de movimentação sem perder tipo, ativo, quantidade, moeda, preço, corretora, data/hora e timezone; verificar equivalência com a tabela e testes de dados indisponíveis
- [x] 5.5 Preservar prevenção de duplicidade, reconciliação de 409/resultado desconhecido e atualização somente após confirmação do backend; verificar testes de duplo clique, conflito, falha de rede e reconciliação sem sucesso falso

## 6. Estados compartilhados e acessibilidade

- [x] 6.1 Unificar loading, vazio, erro, parcial, stale e indisponível em uma família visual proporcional, mantendo ação recuperável e sem depender somente de cor; verificar testes de componente e snapshots representativos
- [x] 6.2 Revisar textos técnicos e acadêmicos, mantendo apenas linguagem orientada à tarefa e detalhes contratuais alcançáveis no contexto; verificar revisão editorial e ausência dos padrões redundantes listados em `audit/report.md`
- [x] 6.3 Validar landmarks, hierarquia de títulos, labels, descrições, nomes acessíveis, regiões vivas, foco visível e ordem de tabulação após a compactação; verificar Axe sem violações e roteiro de teclado nas rotas auditadas
- [x] 6.4 Validar contraste de texto, ícones, bordas de controles e estados, além de zoom/reflow a 200% e preferência por movimento reduzido; verificar auditoria de contraste e uso completo em 320 px

## 7. Evidência final

- [x] 7.1 Ampliar testes unitários e de integração visual para os requisitos IU-07 a IU-11 sem substituir testes funcionais existentes; verificar suíte Angular completa sem regressões
- [x] 7.2 Executar build de produção, `npm audit`, `git diff --check` e inspeção de segredos, temporários, fixtures em produção e mudanças fora do escopo; verificar todos os comandos e revisão do diff
- [x] 7.3 Executar frontend e backend reais com PostgreSQL em containers descartáveis e validar autenticação, CSRF, proxy same-origin e contratos inalterados; verificar healthchecks e jornada principal
- [x] 7.4 Executar Playwright e Axe em 1440×1024, 768×1024, 720 px, 390×844 e 320 px, comprovando ausência de overflow e conteúdo encoberto; verificar relatório e capturas inspecionadas
- [x] 7.5 Comparar capturas finais com `audit/current/` e `prototype/screenshots/`, documentando desvios aprovados sem exigir pixel perfeito; verificar matriz de aceite IU-07 a IU-11 preenchida
- [x] 7.6 Executar `openspec validate polish-atlas-presentation-experience --strict` e marcar somente tarefas sustentadas pelas evidências produzidas
