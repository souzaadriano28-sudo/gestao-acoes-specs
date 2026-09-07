## Why

A base funcional do Atlas Carteira é confiável, responsiva e acessível, mas a auditoria final encontrou excesso de explicação técnica, densidade irregular e elementos visuais genéricos que reduzem a leitura imediata e a percepção de produto acabado. Esta mudança concentra um último polimento de alto impacto antes de ampliar funcionalidades, preservando integralmente os contratos financeiros e de segurança já aprovados.

## What Changes

- Reequilibrar a hierarquia do Dashboard para priorizar patrimônio, custo, resultado e posições, mantendo qualidade/freshness acessível por divulgação progressiva.
- Refinar identidade, tipografia, iconografia, espaçamentos, alinhamentos, superfícies, botões e badges para uma linguagem própria e consistente do Atlas.
- Reduzir textos técnicos e acadêmicos repetidos, mantendo avisos obrigatórios em linguagem curta, clara e sempre disponível.
- Tornar filtros, formulários e confirmação de operação mais compactos e orientados à tarefa, sobretudo em celular e 320 px.
- Melhorar leitura e escaneabilidade de tabelas e cartões móveis sem ocultar moeda, origem, disponibilidade ou significado financeiro.
- Elevar login, loading, vazio, erro, parcial, stale, sessão expirada e 404 ao mesmo padrão visual, sem enfraquecer nomes acessíveis, foco, contraste ou anúncios dinâmicos.
- Atualizar testes visuais, responsivos e de acessibilidade para comprovar a nova apresentação em 1440, 768, 720, 390 e 320 px.
- Manter fora do escopo gráficos, dividendos, rentabilidade histórica, caixa, impostos, recomendações, ordens reais e qualquer dado não sustentado pelo backend.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `investment-workspace-ui`: acrescentar requisitos observáveis de hierarquia, densidade, linguagem visual, divulgação progressiva e eficiência dos fluxos sem alterar os dados ou regras financeiras disponíveis.

## Impact

- Frontend Angular: shell autenticado, login, páginas existentes, componentes compartilhados, tokens e testes.
- OpenSpec: delta da experiência visual, relatório de auditoria, matriz de decisão, protótipos e evidências comparativas.
- Backend, endpoints, Liquibase, autenticação, CSRF e integrações: sem mudanças planejadas.
- Dependências: nenhuma biblioteca nova é necessária; ícones deverão ser SVGs locais, acessíveis e originais ou de licença já compatível.
