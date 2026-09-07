# Auditoria estética, de UX e apresentação

## Escopo e método

Auditoria executada em 6 de setembro de 2026 sobre a aplicação final containerizada. O banco e as credenciais foram descartáveis; PETR4, AAPL e “Corretora Teste” são registros simulados criados exclusivamente para a inspeção. As capturas em `current/` cobrem login, Dashboard, Carteira, Operações, Ações, Corretoras, loading, vazio, erro, parcial, stale, indisponibilidade, sessão expirada e 404.

Foram medidas 25 combinações de página e viewport. Nenhuma apresentou `scrollWidth` maior que a largura da viewport. A comparação de maturidade usou apenas material público do [Investidor10](https://investidor10.com.br/gerenciador-de-carteiras/) e do [Status Invest](https://statusinvest.com.br/produtos/carteira-de-investimentos): leitura rápida, organização em camadas e foco na tarefa foram referências; recursos não suportados pelo Atlas foram desconsiderados.

## Baseline operacional comprovada

- Especificações `main`: `9bc645d2810465241f30f666111861c294b4604b`.
- Backend `main`: `83c0e6b8da9df87c8a313d84401ed4197cc74009`.
- Frontend `master`: `550fc8ecc7e65df0b89e043485abe97d53c2ba85`.
- Compose isolado `atlas-polish-audit`: Angular/Nginx, Spring Boot e PostgreSQL 17 chegaram simultaneamente a `healthy`; frontend acessível em `127.0.0.1:4211` e integrações dirigidas a um provedor local controlado.
- Autenticação, sessão, CSRF, proxy same-origin, Liquibase e persistência foram exercitados pelos fluxos reais de cadastro e operação simulada. Nenhuma credencial ou token foi escrita nos artefatos; o identificador visível nas capturas foi anonimizado como “Conta de demonstração”.
- A base descartável começou vazia e depois recebeu `PETR4`, `AAPL`, `Corretora Teste`, duas compras e uma venda, todos identificados como simulação. Estados parcial, stale e indisponível foram capturados com fixtures de auditoria derivadas do contrato real e marcadas em `current/contract-state-evidence.json`, sem apresentá-las como resposta de produção.
- Ao final, containers, rede, volume, imagens e provedor local criados para esta auditoria foram removidos; recursos Docker preexistentes não foram alterados.

## Observações por fluxo

| Fluxo | O que já funciona bem | O que merece polimento |
| --- | --- | --- |
| Login | Campos claros, erro/sessão preservados e bom contraste | Narrativa extensa e muito espaço sem função no desktop; formulário tardio no mobile |
| Dashboard | Valores honestos, moedas explícitas, painéis independentes | Métricas com peso uniforme, proveniência dominante e metadiscurso técnico |
| Carteira | Tabela completa e cartões sem perda de campo | Filtros altos, alinhamento financeiro pouco forte e baixa adaptação a poucos itens |
| Operações | Confirmação, reconciliação e prevenção de duplicidade confiáveis | 26–27 controles visíveis e rolagem longa; filtros competem com registro |
| Ações | Cadastro e integrações preservados | Painel de cadastro domina a primeira dobra e deixa vazio com poucos registros |
| Corretoras | Evidência CVM explícita e sem inferência indevida | Mesmo problema de densidade do cadastro e ações visualmente fragmentadas |
| Estados | Loading, vazio, erro, parcial, stale e indisponível são semanticamente corretos | Banners, badges e textos repetem impacto em múltiplos níveis |
| Sessão/404 | Recuperação clara dentro da linguagem existente | Acabamento genérico e repetição de contexto acadêmico |

## Diagnóstico executivo

O Atlas já parece confiável e mais cuidadoso que um CRUD comum. Login, shell, cartões, estados honestos e responsividade formam uma base sólida. A nota percebida cai porque o sistema explica demais o próprio funcionamento, distribui peso visual quase uniforme e usa sinais genéricos — monograma “AC”, letras D/C/A/R/O, cartões brancos semelhantes e azul intenso em muitas ações.

O maior ganho não virá de decoração ou gráficos. Virá de três decisões: estabelecer uma hierarquia financeira inequívoca, reduzir explicações por divulgação progressiva e compactar Operações/filtros no mobile. Essas mudanças aumentam confiança, velocidade de leitura e personalidade sem pedir um único campo novo ao backend.

## Bloqueante

Nenhum defeito funcional, de segurança, overflow ou acessibilidade bloqueia o uso atual. Para aprovar esta mudança de polimento, porém, os critérios IU-07 a IU-11 deverão ser comprovados; não se deve rebaixar a cobertura WCAG já existente.

## Alto impacto

1. **Hierarquia financeira uniforme demais.** Quatro cartões equivalentes fazem patrimônio, custo, resultado e contagem competir. Patrimônio deve liderar; custo e resultado precisam de relação semântica clara.
2. **Proveniência visualmente dominante.** Três cartões de fonte ocupam quase a altura de posições e movimentações. Em sucesso, uma linha de atualização basta; detalhes devem ser expansíveis.
3. **Operações mobile excessivamente longa.** Formulário, cinco filtros e cartões detalhados geram rolagem extensa e 26 controles visíveis. Filtros avançados devem iniciar recolhidos e o histórico deve usar linhas mais compactas.
4. **Iconografia provisória.** Letras em caixas cumprem contraste, mas comunicam protótipo e exigem leitura do rótulo. Um conjunto SVG próprio aumenta reconhecimento sem dependência.
5. **Texto técnico e acadêmico repetido.** “Calculado pelo backend”, “sem somas no navegador”, “origem histórica” e o aviso acadêmico reaparecem em várias regiões. A informação é correta, porém compete com a tarefa.
6. **Login amplo e promocional.** O split desktop usa metade da tela para uma narrativa com três cartões e grande vazio; no mobile, a narrativa precede o formulário. A marca pode ser forte com metade do texto.
7. **Densidade e espaço pouco adaptativos.** Carteira, Ações e Corretoras ficam com grande vazio quando há poucos itens, enquanto o topo reserva painéis altos para cadastro/filtro. A composição deve responder melhor ao volume real.
8. **Estados parciais corretos, mas pesados.** Banner, badges e “Indisponível” em itálico repetem o mesmo alerta. Uma mensagem de impacto curta e estados alinhados melhorariam escaneabilidade.

## Opcional

- Microtransição curta de expansão e feedback, sempre removida com `prefers-reduced-motion`.
- Variação discreta do motivo cartográfico entre login e cartão hero.
- Preferência de densidade do usuário, somente em mudança futura.
- Gráfico de composição, apenas se um contrato futuro fornecer agregações coerentes; não usar valores parciais nem calcular no Angular.
- Série patrimonial, dividendos, rentabilidade, caixa e impostos permanecem funcionalidades futuras e não são parte deste polimento.

## Avaliação por dimensão

| Dimensão | Estado atual | Direção recomendada |
| --- | --- | --- |
| Primeira impressão | Segura e organizada, mas próxima de template corporativo | Motivo Atlas, hierarquia hero e iconografia própria |
| Tipografia | Legível; valores fortes | Números tabulares, escala menos uniforme e textos auxiliares menores |
| Espaçamento | Confortável, às vezes excessivo | Ritmo de 8 px com densidade por tarefa |
| Valores financeiros | Moeda e sinal corretos | Patrimônio lidera; custo/resultado comparáveis e explicados uma vez |
| Navegação | Clara, responsiva e acessível | Ícones reconhecíveis, item atual com marcador adicional |
| Tabelas | Boas em desktop | Cabeçalho mais discreto, alinhamento numérico e linhas compactas |
| Cartões mobile | Completos | Menos repetição, pares rótulo/valor mais densos e detalhes recolhíveis |
| Formulários | Corretos e robustos | Agrupamento visual, ajuda curta e filtros avançados recolhíveis |
| Estados | Honestidade excelente | Menor repetição e impacto visual proporcional |
| Login | Visualmente forte | Mais foco no formulário e menos texto promocional |
| Produto real | Contratos e segurança convencem | Linguagem própria e menos metadiscurso técnico completam a percepção |

## Estimativa

- Implementação Angular: 3 a 5 dias úteis.
- Testes e ajuste visual nas cinco larguras: 1 a 2 dias úteis dentro da estimativa.
- Backend e banco: nenhuma alteração prevista.
- Risco: baixo a moderado, concentrado em regressão responsiva e acessibilidade durante compactação.
