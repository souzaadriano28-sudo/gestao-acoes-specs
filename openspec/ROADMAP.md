# Roadmap MVP — Atlas Carteira

Data-base: 2026-09-07. Planejamento acadêmico profissional; não autoriza implementação.

## Resultado da revisão

O plano anterior de seis mudanças e 137 tarefas foi substituído por três mudanças e **68 tarefas**. O MVP preserva a demonstração acadêmica — cadastros explícitos, endpoints e integrações — e concentra o investimento em propriedade, validação correta, lançamento financeiro e três insights reais.

```text
1. enable-secure-multi-user-ownership (22 tarefas)
                 ↓
2. streamline-catalog-and-transactions (28 tarefas)
                 ↓
3. add-essential-portfolio-insights (18 tarefas)
```

| Ordem | Mudança | Entrega | Horas | Dependência |
|---:|---|---|---:|---|
| 1 | `enable-secure-multi-user-ownership` | Cadastro/login local, propriedade, migração, perfil mínimo; Google secundário | 105–145 h | Nenhuma |
| 2 | `streamline-catalog-and-transactions` | Corretora/CVM/CEP, ações BR/EUA e operações corretas | 135–185 h | 1 aceita |
| 3 | `add-essential-portfolio-insights` | Navegação, onboarding, reflow e três gráficos | 75–105 h | 1 e 2 aceitas |

Estimativa total: **315–435 horas**, arredondadas para **320–440 horas** incluindo integração e estabilização. Google representa aproximadamente 16–24 horas da fase 1 e pode sair da apresentação sem comprometer o login local. A estimativa MySQL não está incluída.

## Escopo do MVP

### 1. Propriedade segura

- Cadastro com nome, e-mail e senha; login local é o caminho principal.
- Sessão server-side, cookie HttpOnly/SameSite, CSRF, rotação, rate limit e respostas não enumeráveis.
- Uma carteira implícita por usuário. Corretoras, ações cadastradas, operações, posições e leituras pertencem ao usuário.
- Propriedade sempre derivada da sessão; IDs de outra conta não revelam nem alteram dados.
- Migração Liquibase expand/backfill/contract preserva o administrador e todos os dados atuais em uma conta legado.
- Perfil mínimo, troca de senha e desativação com preservação de dados; sem recuperação por e-mail.
- Google OAuth/OIDC somente após aceite local, atrás de configuração de ambiente e sem segredo no Git/frontend/logs/imagem.

### 2. Cadastros e operações

#### Corretoras

Fluxo obrigatório: digitar CNPJ → validar formato/duplicidade → “Consultar CNPJ”/BrasilAPI → confirmar empresa ativa → consultar CVM pelo mesmo CNPJ → exigir registro ativo/categoria compatível → escolher CEP sugerido ou digitar outro → “Consultar CEP”/ViaCEP → revisar endereço → confirmar.

Alterar CNPJ invalida empresa, CVM e CEP; alterar CEP invalida o endereço. CNPJ ausente, empresa inativa, CVM ausente/inativa/incompatível/inconclusiva e indisponibilidade CVM bloqueiam. Não existe bypass.

O histórico mostra que o commit `4a3ed52` introduziu e o código atual mantém `6612601`, `6612602` e `6431900` como `CNAES_VALIDOS`. Hoje essa lista permite o cadastro e a evidência CVM é atualizada separadamente. O MVP corrige a ordem: CNAE passa a complementar a análise; somente a fonte CVM ativa e compatível autoriza o novo cadastro. Corretora que perder autorização permanece no histórico/posição, mas não aceita novos lançamentos.

#### Ações

- Cadastro explícito preservado.
- Busca por ticker ou nome em ativos brasileiros e americanos.
- Sugestão apresenta ticker, empresa, bolsa, país e moeda; Mercado permanece visível e é preenchido automaticamente.
- Entrada manual ticker+mercado continua disponível, mas precisa de “Consultar ativo”.
- Confirmação mostra nome, mercado, bolsa, moeda, cotação e horário válidos.
- Ticker inexistente difere de API indisponível/limitada. Timeout, cancelar, tentar novamente e bloqueio de duplo envio evitam o travamento americano.
- Duplicidade é ticker canônico+mercado dentro do proprietário.

#### Operações

- Compra/venda usam somente ativo cadastrado e corretora autorizada do usuário.
- Campos: data, quantidade, preço unitário visível/editável, moeda, corretora e total prévio.
- Preço histórico é sugestão somente com fonte confiável; o preço efetivamente pago confirmado prevalece.
- Idempotência e consulta de resultado tratam clique duplo, retry e resposta desconhecida.
- Venda não excede posição disponível; preço médio é determinístico.
- Correção/estorno preservam o original e reconstroem a posição. Nenhum ativo é criado silenciosamente.

### 3. Experiência e insights

- Navegação: Visão geral, Carteira e Lançamentos. Cadastros explícitos ficam contextuais em Carteira/onboarding.
- Primeiro acesso: cadastrar corretora, cadastrar ação, registrar primeira compra, visualizar carteira.
- Formulários alinhados; nomes extensos com nome curto/truncamento acessível; tabela desktop e cards mobile sem overflow da página.
- Linguagem: “Atualização dos dados”, “Fonte da cotação”, “Consultada em” e “Situação no cadastro da CVM”. Detalhes internos aparecem somente sob solicitação.
- Três gráficos: composição por ativo; capital investido versus valor atual; ganho/perda por posição. Cada um possui tabela acessível equivalente.
- Capital investido é custo remanescente das posições abertas; não é aporte, saldo ou soma bruta de compras.
- Ausência de preço/câmbio produz parcial/indisponível, nunca zero inventado.

## Endpoints mínimos preservados

Nenhuma rota mínima será removida ou renomeada:

- Corretoras: `POST/GET /api/corretoras`, `GET /api/corretoras/{id}`, `GET /api/corretoras/cnpj/{cnpj}`.
- Ações: `POST/GET /api/acoes`, `GET /api/acoes/{id}`, `GET /api/acoes/ticker/{ticker}`, `PUT /api/acoes/{id}/atualizar-cotacao`.
- Carteira: `POST /api/carteira/comprar`, `POST /api/carteira/vender`, e GETs atuais de saldo, posições, dashboard, posições detalhadas e movimentações.

Endpoints auxiliares de consulta/busca podem ser adicionados. Os POST finais continuam nas rotas atuais; o payload de operação será estendido e a ausência dos novos campos terá erro explícito.

## Arquitetura e integrações

Manter Resource/Controller → Service/domínio → Repository e ports/adapters. Domínio não conhece Feign, URL ou payload externo. Ports mínimos: CNPJ empresarial, CEP, cadastro CVM, busca de ativo, cotação e preço histórico.

Integrações reais e visíveis:

1. BrasilAPI: empresa/CNPJ e sugestão de CEP.
2. ViaCEP: consulta e revisão do endereço.
3. CVM Dados Abertos: autorização e categoria do intermediário.
4. BRAPI: busca/cotação brasileira.
5. Twelve Data: busca/cotação americana.

Cada adapter trata timeout, payload inválido, not-found, 429/limite e indisponibilidade. Retry somente em leitura idempotente. H2 continua para testes/desenvolvimento e PostgreSQL para integração/Compose.

## Qualidade e aceite

- Unitários: CNPJ, CEP, ticker, CNAE complementar, categoria CVM, preço médio, total, arredondamento e três fórmulas.
- Integração: H2 e PostgreSQL, Liquibase, adapters com WireMock/fixtures e contratos HTTP.
- Segurança: pelo menos dois usuários, IDs cruzados em todas as APIs, filtros, paginação e cache.
- Concorrência: cadastro duplicado, duas vendas, idempotência e resultado desconhecido.
- E2E: conta nova; corretora; ação BR/EUA; compra/venda; onboarding; insights; falhas de APIs.
- Responsividade/acessibilidade: 320, 390, 768 e 1440 px, zoom 200%, teclado, foco e tabela equivalente.
- Docker: build e healthcheck dos três serviços, smoke de frontend/login/backend/banco.

O MVP conclui quando todos os cenários OpenSpec passam, os dados legado reconciliam, nenhuma chamada horizontal funciona, pelo menos três integrações reais são demonstráveis, os endpoints mínimos permanecem cobertos e os três containers ficam saudáveis.

## Decisões pendentes

1. O enunciado exige compatibilidade MySQL apenas arquitetural/documental ou uma execução/teste real? Se real, adicionar 12–20 h.
2. Quais categorias textuais/códigos do dataset CVM contam como compatíveis e qual a validade máxima do snapshot para novo cadastro?
3. Qual endpoint/plano dos provedores será usado para autocomplete e preço histórico, considerando limites e cobertura?
4. Google precisa aparecer na apresentação ou pode ficar imediatamente depois do aceite do MVP local?
5. Qual moeda de apresentação usar quando a carteira tiver BRL e USD e o câmbio estiver indisponível?

## Backlog futuro — fora do MVP

Múltiplas carteiras, importação/exportação CSV, integração B3, alertas, recuperação por e-mail, novas classes de ativos, tributação, dividendos, saldo/caixa, benchmark, séries históricas, TWR, XIRR e demais análises avançadas. Cada item exige proposta própria; nenhum está escondido nas 68 tarefas.

## Evidência preservada

A auditoria sanitizada permanece em [`openspec/evidence/current-product-audit/README.md`](evidence/current-product-audit/README.md), incluindo desalinhamentos, overflow, revisão sem preço, termos técnicos e comportamento do ativo americano. O 503 é observado; a causa específica continua não comprovada pelos logs atuais.
