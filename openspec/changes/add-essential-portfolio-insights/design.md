## Context

O backend já expõe dashboard, posições detalhadas e movimentações; a auditoria mostra termos técnicos, overflow e navegação administrativa. Os changes anteriores fornecem proprietário, preço efetivo e cotações válidas. Não será criada série histórica.

## Goals / Non-Goals

**Goals:** três análises reconciliáveis, navegação simples e reflow profissional com baixo custo de implementação.

**Non-Goals:** biblioteca analítica ampla, série temporal, dividendos, impostos, caixa, benchmark, TWR, XIRR ou redesign de marca completo.

## Decisions

### Três destinos, cadastros contextuais

Visão geral apresenta resumo e insights; Carteira apresenta posições e ações “Cadastrar corretora/ação”; Lançamentos apresenta compra/venda e histórico. As rotas antigas ganham redirects ou permanecem como subrotas contextuais para não quebrar o enunciado. O onboarding explicita quatro passos porque o trabalho exige cadastros separados: corretora, ativo, primeira compra, carteira.

### Três agregações sem histórico inventado

Backend calcula por proprietário em um único instante de corte:

- composição por ativo = valor atual utilizável da posição / soma dos valores utilizáveis;
- capital investido = soma de quantidade × preço médio das posições abertas;
- valor atual = soma de quantidade × cotação válida;
- ganho/perda por posição = valor atual − custo remanescente; percentual = resultado / custo, apenas se custo positivo.

Valores multimoeda usam a conversão atual já suportada e exibem cobertura; falta de cotação/câmbio torna parcial, nunca zero. Alternativa de calcular no Angular foi rejeitada para manter consistência e autorização.

### Um payload, duas representações

Cada endpoint de insight retorna rótulo, valor decimal, moeda, cobertura e atualização. Gráfico e tabela consomem o mesmo array. Usar biblioteca existente ou SVG acessível pequeno conforme bundle/avaliação; não adicionar dependência pesada sem necessidade.

### Ajuste de interface focado

Reusar tokens/componentes atuais. Formulários usam grid com labels superiores; tabelas desktop ocultam metadados secundários em detalhe e mobile usa cards/listas. Nome curto aparece primeiro, razão social completa fica acessível. Testes nos breakpoints 390, 768 e 1440 px, além de 320 px para reflow.

Termos técnicos são mapeados na camada de apresentação; detalhe expansível preserva suporte. “Atualização dos dados” é rótulo, enquanto data/hora específica aparece ao lado quando disponível.

## Risks / Trade-offs

- [Cobertura parcial distorce percentuais] → mostrar cobertura e excluir apenas valores indisponíveis de denominadores rotulados.
- [Conversão cambial indisponível] → estado parcial/indisponível, nunca soma de moedas distintas.
- [Gráfico inacessível] → tabela equivalente obrigatória e testes por teclado/leitor.
- [Navegação esconde endpoints acadêmicos] → ações contextuais e contract/E2E preservam todos os fluxos.

## Migration Plan

Não há mudança destrutiva. Entregar agregações, depois componentes e shell; manter rotas antigas por redirects durante o MVP. Feature flag permite voltar à apresentação anterior sem tocar nos dados.
