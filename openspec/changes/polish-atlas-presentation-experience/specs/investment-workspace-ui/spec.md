## ADDED Requirements

### Requirement: IU-07 Hierarquia financeira imediata
A interface SHALL tornar patrimônio estimado, custo das posições, resultado não realizado e quantidade de posições identificáveis antes de detalhes operacionais ou de proveniência. Rótulo, valor, moeda, sinal e disponibilidade SHALL permanecer associados visual e programaticamente; custo MUST NOT ser apresentado como saldo disponível e indisponibilidade MUST NOT parecer zero.

#### Scenario: Dashboard completo em desktop
- **WHEN** o Dashboard recebe métricas disponíveis em 1440×1024
- **THEN** patrimônio ocupa a maior ênfase visual, custo e resultado permanecem comparáveis, posições são identificáveis e detalhes de fonte não competem com o resumo primário.

#### Scenario: Dashboard parcial
- **WHEN** patrimônio ou resultado estão indisponíveis, mas custo e posições persistidas continuam disponíveis
- **THEN** o resumo mantém os dados confirmados, destaca quais métricas faltam sem deslocar toda a página e explica que nenhum total parcial é tratado como completo.

#### Scenario: Resultado e custo não se confundem
- **WHEN** custo e resultado aparecem lado a lado
- **THEN** tipografia, rótulos e textos auxiliares deixam inequívoco que custo representa a base das posições e resultado representa diferença não realizada, sem sugerir caixa ou saldo para operar.

### Requirement: IU-08 Linguagem visual própria e consistente
Shell, navegação, cartões, tabelas, formulários, badges e estados SHALL compartilhar uma linguagem visual reconhecível do Atlas, com escala tipográfica, espaçamentos, raios, sombras, iconografia e ações coerentes. Ícones de navegação SHALL ser distinguíveis pelo desenho e acompanhados de nome acessível; iniciais isoladas MUST NOT ser a única diferenciação. Elementos positivos, negativos, stale e indisponíveis MUST NOT depender apenas de cor.

#### Scenario: Navegação reconhecível
- **WHEN** a pessoa alterna entre Dashboard, Carteira, Ações, Corretoras e Operações
- **THEN** cada destino possui ícone consistente e rótulo, o destino atual tem indicação não dependente somente de cor e a identidade não reproduz marca ou composição de produto terceiro.

#### Scenario: Ação equivalente em páginas diferentes
- **WHEN** duas páginas oferecem a mesma classe de ação, como atualizar leitura ou aplicar filtro
- **THEN** posição relativa, peso visual, ícone quando útil, estado pendente e feedback seguem o mesmo padrão.

#### Scenario: Movimento reduzido
- **WHEN** a preferência por movimento reduzido está ativa
- **THEN** o polimento visual preserva toda a compreensão sem transições ou animações essenciais.

### Requirement: IU-09 Texto conciso e divulgação progressiva
O Atlas SHALL apresentar primeiro linguagem orientada à tarefa e manter explicações técnicas, proveniência detalhada e limitações secundárias sob divulgação progressiva ou contexto próximo. O aviso acadêmico SHALL permanecer persistente e acessível, mas sua mesma formulação MUST NOT ser repetida simultaneamente em múltiplas regiões da viewport. Fonte, referência, coleta e freshness SHALL continuar alcançáveis por teclado e tecnologia assistiva.

#### Scenario: Qualidade de dados resumida
- **WHEN** todas as fontes estão disponíveis
- **THEN** o Dashboard mostra um resumo compacto de atualização e permite abrir detalhes de fonte, referência e coleta sem ocupar o mesmo peso visual das métricas financeiras.

#### Scenario: Fonte problemática
- **WHEN** uma fonte está stale ou indisponível
- **THEN** o problema e seu impacto aparecem sem exigir expansão, enquanto metadados completos permanecem disponíveis em detalhe acessível.

#### Scenario: Aviso acadêmico sem repetição
- **WHEN** uma rota autenticada é exibida
- **THEN** há um aviso acadêmico persistente e legível, mas cabeçalho, conteúdo e rodapé não repetem desnecessariamente a mesma ressalva.

### Requirement: IU-10 Fluxos responsivos eficientes
Em celular e reflow de 320 px, a tarefa principal de cada página SHALL aparecer antes de filtros avançados e histórico, com controles relacionados agrupados e ações primária/secundária distinguíveis. Filtros extensos SHALL permitir recolhimento sem perder filtros ativos, nomes acessíveis ou capacidade de limpar. Cartões móveis SHALL favorecer comparação por linhas curtas e manter ticker, corretora, moeda, quantidade, valor e estado.

#### Scenario: Operação no celular
- **WHEN** a tela Operações abre em 390×844 ou 320 px
- **THEN** tipo, ativo, corretora, quantidade e ação de revisão formam um fluxo compacto contínuo antes do histórico, sem navegação fixa sobrepor campo, confirmação ou mensagem.

#### Scenario: Filtros móveis
- **WHEN** uma lista possui quatro ou mais filtros em celular
- **THEN** os filtros avançados podem iniciar recolhidos, o resumo indica filtros ativos e aplicar/limpar permanecem disponíveis por teclado.

#### Scenario: Tabela e cartão equivalentes
- **WHEN** a mesma coleção alterna entre tabela desktop e cartões móveis
- **THEN** a ordem de leitura e o agrupamento dos valores permitem localizar e comparar os mesmos campos essenciais sem texto repetitivo por item.

### Requirement: IU-11 Login e estados com acabamento uniforme
Login, loading, vazio, erro, dados parciais, stale, integração indisponível, sessão expirada e 404 SHALL usar a mesma voz, ritmo visual e padrões de recuperação do restante do Atlas. A ação principal e a causa/limitação SHALL ser reconhecíveis sem leitura de parágrafos longos. Feedback dinâmico SHALL preservar `role`, região viva, foco e associação já exigidos por IU-06.

#### Scenario: Login focado na tarefa
- **WHEN** o login abre em desktop ou celular
- **THEN** marca, contexto mínimo, campos e ação de entrada formam o foco principal; explicações de segurança e finalidade permanecem disponíveis sem dominar a tela.

#### Scenario: Falha recuperável
- **WHEN** uma leitura falha
- **THEN** título, explicação curta e ação de repetição aparecem juntos, com contraste e nome acessível, sem criar uma página visualmente desconectada do shell.

#### Scenario: Sessão expirada
- **WHEN** a sessão expira durante uso autenticado
- **THEN** o login informa a expiração com prioridade adequada, preserva o destino de retorno permitido e não repete mensagens equivalentes em múltiplos painéis.

#### Scenario: Estado vazio orientado
- **WHEN** não existem posições nem movimentações
- **THEN** o estado vazio explica o próximo passo possível com uma ação principal e, no máximo, alternativas proporcionais, sem inserir valores demonstrativos na aplicação.
