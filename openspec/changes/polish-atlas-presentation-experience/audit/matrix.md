# Matriz de rastreabilidade da auditoria

| Prioridade | Problema | Evidência | Melhoria | Critério de aceite |
| --- | --- | --- | --- | --- |
| Alta | Quatro métricas têm peso equivalente | `current/dashboard-1440x1024.png` | Patrimônio hero; custo, resultado e posições compactos | Em 1440 e 390 px, patrimônio é a primeira métrica percebida e todos os rótulos/moedas continuam associados |
| Alta | Proveniência compete com conteúdo financeiro | Cards de qualidade ocupam a coluna inteira do Dashboard | Resumo de atualização + detalhe expansível | Em sucesso, metadados não ocupam mais de uma faixa; em falha, impacto aparece sem expansão |
| Alta | Operações mobile é uma página muito longa | `current/operacoes-390x844.png`; 26 controles | Fluxo compacto e filtros avançados recolhíveis | Formulário vem antes do histórico; filtros podem fechar/abrir por teclado e preservam valores |
| Alta | Letras D/C/A/R/O parecem placeholders | Shell em todas as capturas | Cinco SVGs locais com traço comum e rótulos | Destinos distinguíveis por ícone+texto; item atual tem marcador além de cor |
| Alta | Aviso acadêmico repetido | Sidebar, descrições e rodapé repetem ressalvas | Um aviso persistente curto e ajuda contextual apenas quando necessária | Uma formulação principal visível por viewport, sem perder informação obrigatória |
| Alta | Login prioriza narrativa | `current/login-1440x1024.png` e mobile | Reduzir painel editorial e antecipar formulário no mobile | Campos e CTA aparecem na primeira dobra em 390×844; segurança continua acessível |
| Alta | Parcial/stale repete alerta em três níveis | `current/dashboard-partial-1440x1024.png` e `dashboard-stale-1440x1024.png` | Mensagem compacta de impacto e badges alinhados | Nenhum valor indisponível vira zero; stale mantém valor+referência; texto não depende de cor |
| Alta | Tabelas usam pouco alinhamento financeiro | `current/carteira-1440x1024.png` | Números alinhados e colunas essenciais mais compactas | Quantidade e valores com números tabulares; cabeçalhos e scopes preservados |
| Alta | Cartões mobile repetem muitos rótulos | Dashboard, Carteira e Operações em 390/320 | Linhas comparáveis e detalhes secundários recolhíveis | Mesmo conteúdo essencial, menor altura e nenhuma perda em 320 px |
| Alta | Cadastro/filtro domina páginas com poucos itens | Ações, Corretoras e Carteira desktop | Painel de ação compacto e lista mais próxima do título | A lista começa na primeira dobra em 768×1024 quando houver conteúdo |
| Média | Botões de atualizar variam de posição/peso | Cinco rotas | Padrão único de ação secundária com ícone | Mesma classe, estado pendente e feedback em todas as leituras |
| Média | 404 é correta porém genérica | `current/404-320x568.png` | Motivo Atlas e ação proporcional | Continua dentro do shell, sem ilustração externa nem CTA redundante |
| Opcional | Superfícies são todas brancas e similares | Visão geral das páginas | Tinta sutil e bordas por hierarquia | Contraste AA preservado e decoração não comunica estado |
| Fora | Gráficos de evolução/composição | Backend não fornece série/agregação formal | Backlog de produto separado | Nenhum gráfico entra sem contrato, precisão e disponibilidade definidos |
| Fora | Dividendos, caixa, IR, rentabilidade histórica | Dados inexistentes | Não implementar nesta mudança | Nenhuma menção ou valor fictício em produção |

## Aceite final dos requisitos

| Requisito | Evidência final | Resultado |
| --- | --- | --- |
| IU-07 | `final/dashboard-1440x1024.png`, `final/dashboard-parcial-390x844.png` e testes de métricas/disponibilidade | Aprovado: patrimônio lidera; custo e resultado não se confundem; indisponível não vira zero |
| IU-08 | Shell nas cinco larguras, cinco SVGs locais, foco/estado ativo não dependentes de cor e teste de movimento reduzido | Aprovado |
| IU-09 | Qualidade fechada em sucesso e aberta em impacto; fonte, referência, coleta e freshness alcançáveis; um aviso por viewport | Aprovado |
| IU-10 | Capturas de Carteira e Operações nas cinco larguras, filtros preservados e teste de bounding boxes da barra móvel | Aprovado: zero overflow e zero sobreposição interativa |
| IU-11 | `final/login-*`, `final/login-session-expired-390x844.png`, 404 e estados vazio/erro/parcial/stale | Aprovado: voz e recuperação consistentes, regiões e foco preservados |
