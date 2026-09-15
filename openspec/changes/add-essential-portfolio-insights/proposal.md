## Why

A interface ainda reflete entidades administrativas, usa linguagem técnica e oferece pouca leitura visual. Um MVP profissional precisa orientar o primeiro acesso e mostrar apenas três análises confiáveis, derivadas dos dados reais já registrados.

## What Changes

- Reorganizar navegação em Visão geral, Carteira e Lançamentos, preservando acesso contextual aos cadastros obrigatórios.
- Criar primeiro acesso guiado: cadastrar corretora, cadastrar ativo, registrar primeira compra e ver a carteira.
- Corrigir alinhamentos, larguras, nomes extensos e rolagem horizontal desnecessária em desktop, tablet e mobile.
- Trocar `freshness` por “Atualização dos dados”, `origem` por “Fonte da cotação”, `coleta` por “Consultada em” e `evidência regulatória` por “Situação no cadastro da CVM”.
- Manter códigos, timestamps internos e diagnóstico técnico apenas em detalhes solicitados.
- Adicionar exatamente três visões gráficas do MVP: composição por ativo; capital investido versus valor atual; ganho ou perda por posição.
- Disponibilizar tabela acessível equivalente para cada gráfico e estados vazio, parcial, desatualizado e indisponível.
- Excluir dividendos, impostos, saldo, benchmark, TWR, XIRR, histórico inventado e análises avançadas.
- Dependências obrigatórias: `enable-secure-multi-user-ownership` e `streamline-catalog-and-transactions`.

## Capabilities

### New Capabilities

- `essential-portfolio-insights`: três análises matemáticas reais com visualização e tabela acessível equivalentes.

### Modified Capabilities

- `portfolio-read-model`: fornecer agregações por proprietário e qualidade dos dados para as três análises.
- `investment-workspace-ui`: adotar navegação orientada a tarefas, onboarding, linguagem simples e responsividade integral.
- `application-integration`: validar fórmulas, autorização, acessibilidade, breakpoints, E2E e containers.

## Impact

Rotas e componentes Angular, design tokens mínimos, conteúdo, consultas/agregações Spring e testes de matemática/acessibilidade. Não exige série temporal nova nem inventa dados; reutiliza ledger, posições e cotações válidas resultantes dos changes anteriores.
