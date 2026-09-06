## Why

A interface Angular atual concentra cadastro e operação em três telas com estilos inline, navegação mínima e pouca adaptação móvel; ao mesmo tempo, o backend possui regras financeiras importantes que a experiência não explica e não expõe dados suficientes para vários indicadores esperados em um painel profissional. Esta mudança define uma modernização original, acessível e honesta sobre a disponibilidade e a origem dos dados, preservando o caráter acadêmico do sistema.

## What Changes

- Introduzir um dashboard inicial e uma estrutura de navegação responsiva para Dashboard, Carteira, Ações, Corretoras e Operações.
- Reorganizar posições, ativos, corretoras e movimentações em cartões e tabelas legíveis, com estados explícitos de carregamento, vazio, erro, sucesso, resultado desconhecido, dados desatualizados e indisponibilidade.
- Tornar compra e venda fluxos claros de **simulação/registro acadêmico**, sem preço manual, sem execução de ordem e sem qualquer recomendação de investimento.
- Padronizar valores com moeda ISO recebida do backend, locale `pt-BR`, percentuais somente quando a base real existir, sinais positivo/negativo sem depender apenas de cor e data/hora com fuso ou ressalva de fuso desconhecido.
- Exigir proveniência das cotações e do câmbio, incluindo fonte, instante da cotação e instante de consulta; eliminar do painel profissional a aparência de atualidade quando a informação estiver ausente ou antiga.
- Planejar read models de dashboard, posições enriquecidas e movimentações para que o frontend não derive nem invente patrimônio por ativo, rentabilidade, resultado, cotação corrente, histórico ou taxa cambial.
- Substituir a inferência atual de “validada na CVM” por evidência proveniente do cadastro oficial, ou apresentar o estado como não verificado; CNAE, CNPJ e situação cadastral não equivalem a autorização da CVM.
- Atender WCAG 2.2 nível AA, incluindo navegação por teclado, foco visível, semântica, mensagens anunciadas, contraste, alvos de toque e reflow em 320 CSS px.
- Adotar identidade própria em azul-marinho e superfícies claras, com verde e vermelho apenas como reforço semântico para resultados reais positivos e negativos.
- Produzir protótipo estático de alta fidelidade, isolado do Angular e identificado como contendo dados demonstrativos.
- Refinar o protótipo do Dashboard nos viewports 1440×1024, 768×1024 e 390×844, com estados de carregamento, vazio, erro, dados parciais e sucesso; manter no Dashboard apenas acesso discreto à operação completa, que pertence à rota Operações.
- Depender da conclusão de `add-secure-admin-authentication` antes de implementar o shell, as rotas protegidas e o Dashboard completo.
- Manter fora do escopo execução/cancelamento de ordens, recomendação ou análise de investimentos, custódia real, integração com conta de corretora, suitability, cálculo ou declaração tributária, DARF/ReVar, notas de corretagem, taxas/emolumentos, proventos e eventos corporativos.

## Capabilities

### New Capabilities

- `investment-workspace-ui`: estrutura de navegação, dashboard, componentes de resumo e tabelas, estados de interface, responsividade, formatação, acessibilidade e avisos acadêmicos.
- `portfolio-read-model`: contratos de leitura que fornecem somente métricas calculadas no backend, posições enriquecidas, movimentações e metadados de cotação/câmbio necessários à apresentação confiável.
- `simulated-investment-operations`: experiência de compra e venda simuladas que preserva as regras atuais de validação, atomicidade, concorrência e resultado desconhecido sem sugerir execução em mercado.
- `broker-registration-evidence`: apresentação e contrato de evidência para situação cadastral empresarial e eventual registro oficial como participante, sem equiparar CNAE a autorização CVM.

### Modified Capabilities

- `application-integration`: ampliar a jornada integrada e os gates de qualidade para as novas rotas, contratos de leitura, acessibilidade, viewports desktop/celular e execução pelos três containers.

## Impact

- Frontend futuro: shell Angular, roteamento, componentes standalone, serviços/tipos HTTP, design tokens, estados assíncronos, formulários e testes Vitest/Playwright.
- Backend futuro: novos endpoints/DTOs de leitura e metadados, consulta paginada de transações, proveniência de cotação/câmbio e correção da evidência CVM; as regras transacionais existentes permanecem a fonte de verdade.
- Dados: poderá ser necessária migração aditiva para proveniência de cotação e evidência cadastral. Nenhum valor histórico ausente será sintetizado.
- Runtime: continuam exatamente três serviços (`frontend`, `backend`, `postgres`); E2E usará provedores simulados, sem credenciais reais nem chamadas financeiras externas.
- Ordem de implementação: `add-secure-admin-authentication` é predecessora obrigatória; esta mudança consumirá sua sessão, guard, logout e estados 401/403/429, sem redefinir autenticação.
- Compatibilidade: os endpoints atuais de cadastro, compra, venda, saldo e posições são preservados durante a migração; novos read models serão aditivos.
- Documentação: incluir matriz de dados disponíveis/ausentes, limites regulatórios e tributários, e fontes oficiais consultadas.
