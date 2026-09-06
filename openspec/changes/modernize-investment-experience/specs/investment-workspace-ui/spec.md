## Purpose

Definir uma experiência de acompanhamento de carteira original, profissional, responsiva e acessível que apresente apenas informações sustentadas pelos contratos do sistema.

## ADDED Requirements

### Requirement: IU-01 Estrutura e navegação
Depois da implementação de `add-secure-admin-authentication`, o frontend SHALL oferecer as rotas protegidas Dashboard, Carteira, Ações, Corretoras e Operações em uma estrutura persistente com identificação da página atual, título único, link de salto para o conteúdo e fallback de rota inexistente. A raiz autenticada SHALL abrir o Dashboard. A navegação SHALL continuar utilizável por teclado, leitor de tela, desktop, tablet e celular, sem exigir gesto específico ou hover. Navegação fixa SHALL reservar espaço de layout e safe area suficientes para nunca encobrir conteúdo, foco ou ações.

#### Scenario: Entrada e localização
- **WHEN** a aplicação é aberta na raiz
- **THEN** o Dashboard é exibido e sua opção de navegação é programaticamente identificada como atual.

#### Scenario: Rota inexistente
- **WHEN** uma URL interna não corresponde a uma rota conhecida
- **THEN** a interface exibe estado de página não encontrada com ação para voltar ao Dashboard, sem tela em branco.

#### Scenario: Navegação móvel
- **WHEN** a viewport possui 320 CSS px de largura
- **THEN** todas as áreas e rotas permanecem alcançáveis sem rolagem horizontal da página, sem perda de conteúdo ou funcionalidade e sem a navegação inferior cobrir o último elemento focável.

#### Scenario: Navegação tablet
- **WHEN** a viewport possui 768×1024 CSS px
- **THEN** a navegação usa rail compacto ou drawer sem reduzir a área principal a uma coluna ilegível, e foco/conteúdo permanecem totalmente visíveis.

### Requirement: IU-02 Dashboard honesto e acionável
O Dashboard SHALL priorizar resumo da carteira, composição sustentada pelo read model, posições, movimentações recentes e qualidade das fontes. Cada cartão SHALL mostrar valor, rótulo, unidade/moeda, estado e contexto temporal quando fornecidos pelo backend. Indicadores sem dado real SHALL aparecer como indisponíveis ou não SHALL ser renderizados; o frontend MUST NOT estimar rentabilidade, lucro/prejuízo, saldo em conta, proventos, variação, diversificação ou patrimônio por ativo a partir de campos insuficientes. O formulário completo de compra/venda MUST NOT ocupar o Dashboard; a página SHALL oferecer apenas ação proporcional que navega para Operações.

#### Scenario: Dados completos
- **WHEN** o read model retorna patrimônio, custo, posição, resultado e metadados válidos
- **THEN** os cartões correspondentes exibem exatamente esses valores formatados e a tabela de posições oferece acesso à carteira.

#### Scenario: Métrica ausente
- **WHEN** o backend omite ou marca como indisponível uma métrica opcional
- **THEN** a interface mostra “Indisponível” com explicação curta ou omite o cartão, sem substituir por zero, placeholder numérico ou cálculo local.

#### Scenario: Carteira vazia
- **WHEN** o read model confirma zero posições e zero movimentações
- **THEN** o Dashboard mostra estado vazio com ações para cadastrar corretora, cadastrar ação e registrar a primeira compra simulada.

#### Scenario: Acesso à operação
- **WHEN** a pessoa aciona “Registrar operação simulada” no Dashboard
- **THEN** navega para a rota Operações, onde o formulário completo é apresentado, sem abrir boleta dominante sobre o resumo.

### Requirement: IU-03 Tabelas e estados assíncronos
Posições, movimentações, ações e corretoras SHALL usar tabelas semânticas em larguras compatíveis e uma apresentação móvel equivalente que preserve rótulos, associação de cabeçalhos e ações. Cada região assíncrona SHALL distinguir carregamento inicial, vazio confirmado, erro, sucesso, indisponibilidade e dados antigos; mutações SHALL ainda distinguir envio pendente, sucesso, recusa e resultado desconhecido. Repetir uma leitura MUST NOT repetir uma mutação.

#### Scenario: Carregamento inicial
- **WHEN** uma coleção ainda não respondeu e não existe dado anterior
- **THEN** a região anuncia carregamento, reserva espaço para reduzir mudança de layout e não anuncia lista vazia.

#### Scenario: Atualização falha com dados anteriores
- **WHEN** uma leitura falha depois que dados foram exibidos
- **THEN** os últimos dados permanecem visíveis, marcados como desatualizados, com tentativa manual que repete somente a leitura.

#### Scenario: Dados parciais
- **WHEN** posições persistidas estão disponíveis, mas uma ou mais cotações, conversões ou métricas dependentes falham
- **THEN** a interface preserva os dados confirmados, identifica cada seção afetada e não apresenta total parcial como completo.

#### Scenario: Tabela em celular
- **WHEN** uma tabela é acessada em celular
- **THEN** os mesmos campos essenciais permanecem disponíveis em linhas adaptadas ou cartões rotulados, sem truncar ticker, quantidade, moeda, data ou ação principal.

### Requirement: IU-04 Formatação financeira e temporal
Valores monetários SHALL ser formatados com `pt-BR` e o código ISO 4217 recebido, mantendo sinal e precisão de apresentação adequada; percentuais SHALL aparecer apenas quando fornecidos ou calculáveis pelo backend com base declarada e SHALL incluir sinal textual ou símbolo além de cor. Datas SHALL usar formato brasileiro, hora e indicação de fuso quando o contrato trouxer instante inequívoco; data sem offset SHALL ser rotulada como horário informado pelo servidor, sem conversão presumida.

#### Scenario: Moedas distintas
- **WHEN** uma posição BRL e uma posição USD são retornadas
- **THEN** cada valor nativo usa respectivamente BRL e USD e não há soma entre moedas no frontend.

#### Scenario: Resultado negativo
- **WHEN** o backend retorna percentual de resultado negativo
- **THEN** a interface mostra sinal de menos, texto acessível e estilo negativo; a interpretação não depende somente do vermelho.

#### Scenario: Data sem fuso
- **WHEN** `dataHoraCotacao` não contém offset ou zona
- **THEN** a interface não a converte silenciosamente para o fuso do navegador e informa que o fuso não foi fornecido.

### Requirement: IU-05 Proveniência, aviso e identidade
Toda cotação ou conversão cambial apresentada SHALL indicar fonte, data/hora de referência e estado de disponibilidade conforme o backend. A aplicação SHALL exibir aviso persistente de que é um sistema acadêmico, não executa ordens e não constitui recomendação de investimento. A identidade SHALL usar azul-marinho, superfícies claras, verde para resultado positivo e vermelho para negativo, preservando contraste e sem copiar marca, texto, imagem ou composição específica de terceiros.

#### Scenario: Metadados completos de cotação
- **WHEN** uma cotação possui fonte e instante de referência
- **THEN** ambos aparecem junto ao valor ou em detalhe diretamente acessível.

#### Scenario: Origem ausente
- **WHEN** um contrato legado retorna cotação sem fonte
- **THEN** a interface apresenta “Origem não informada” e não atribui a informação à B3, Banco Central ou provedor presumido.

#### Scenario: Aviso acadêmico
- **WHEN** qualquer rota principal é exibida
- **THEN** o aviso acadêmico está disponível de forma persistente e não é ocultado por responsividade.

### Requirement: IU-06 Acessibilidade WCAG 2.2 AA
A interface SHALL satisfazer WCAG 2.2 nível AA aplicável, incluindo estrutura semântica, nome/descrição/erro de controles, ordem lógica, operação completa por teclado, foco visível e não encoberto, contraste mínimo, reflow, redimensionamento de texto, mensagens de estado anunciadas e alvos de ponteiro de pelo menos 24 por 24 CSS px ou espaçamento equivalente. Animações SHALL respeitar preferência por movimento reduzido.

#### Scenario: Jornada somente por teclado
- **WHEN** uma pessoa navega, preenche e envia uma operação somente com teclado
- **THEN** foco permanece visível e lógico, nenhum controle exige ponteiro e o resultado é anunciado sem mover foco de forma inesperada.

#### Scenario: Erro de formulário
- **WHEN** o envio é rejeitado com erros por campo
- **THEN** o resumo é anunciado, cada mensagem está programaticamente associada ao campo, o campo inválido é identificado e os valores digitados são preservados.

#### Scenario: Zoom e reflow
- **WHEN** o conteúdo é ampliado a 200% e testado com viewport equivalente a 320 CSS px
- **THEN** texto, controles e conteúdo essencial permanecem legíveis e operáveis sem rolagem em duas dimensões.

#### Scenario: Hover e foco equivalentes
- **WHEN** uma ação oferece indicação visual em hover
- **THEN** ela oferece indicação de foco de contraste equivalente ou superior, sem depender de hover para revelar nome, instrução, validação ou confirmação.
