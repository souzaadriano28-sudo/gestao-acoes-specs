## MODIFIED Requirements

### Requirement: IU-01 Estrutura e navegação
O frontend SHALL oferecer três destinos principais protegidos: Visão geral, Carteira e Lançamentos. Cadastros obrigatórios de Corretoras e Ações SHALL permanecer acessíveis de forma contextual em Carteira e no primeiro acesso. A raiz autenticada SHALL abrir Visão geral; título, localização, link de salto, fallback e navegação responsiva SHALL permanecer acessíveis sem encobrir conteúdo.

#### Scenario: Entrada e localização
- **WHEN** a aplicação é aberta na raiz autenticada
- **THEN** Visão geral é exibida e identificada programaticamente como atual.

#### Scenario: Rota inexistente
- **WHEN** URL interna não corresponde a rota conhecida
- **THEN** a interface mostra página não encontrada e ação para Visão geral.

#### Scenario: Navegação móvel
- **WHEN** viewport possui 320 CSS px
- **THEN** três destinos e cadastros contextuais são alcançáveis sem overflow ou elemento encoberto.

#### Scenario: Navegação tablet
- **WHEN** viewport possui 768×1024 CSS px
- **THEN** navegação mantém conteúdo e foco integralmente visíveis.

### Requirement: IU-05 Proveniência, aviso e identidade
Dados SHALL usar “Atualização dos dados”, “Fonte da cotação”, “Consultada em” e “Situação no cadastro da CVM”. Códigos, IDs e timestamps internos SHALL aparecer somente em detalhe solicitado. O aviso acadêmico e identidade Atlas própria SHALL permanecer acessíveis.

#### Scenario: Metadados completos de cotação
- **WHEN** cotação possui fonte e instante
- **THEN** o resumo mostra fonte e atualização em linguagem simples, com detalhe técnico opcional.

#### Scenario: Origem ausente
- **WHEN** contrato legado não informa fonte
- **THEN** a interface apresenta “Fonte da cotação não informada” sem atribuição presumida.

#### Scenario: Aviso acadêmico
- **WHEN** rota principal é exibida
- **THEN** o aviso de simulação permanece disponível sem competir com a tarefa principal.

## ADDED Requirements

### Requirement: IU-14 Primeiro acesso e reflow profissional
Carteira vazia SHALL orientar cadastro de corretora, cadastro de ativo, primeira compra e retorno à carteira. Formulários SHALL alinhar campos; tabelas/listas SHALL tratar nomes extensos e evitar rolagem horizontal da página em desktop, tablet e mobile.

#### Scenario: Primeiro resultado
- **WHEN** novo usuário conclui os três cadastros guiados
- **THEN** vê a posição resultante na Carteira e os insights disponíveis na Visão geral.

#### Scenario: Nome extenso em celular
- **WHEN** razão social extensa é mostrada em 320 ou 390 CSS px
- **THEN** nome curto/truncamento acessível e detalhe preservam legibilidade sem overflow horizontal.
