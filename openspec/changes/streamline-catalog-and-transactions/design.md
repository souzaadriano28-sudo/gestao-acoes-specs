## Context

As rotas mínimas atuais são `/api/corretoras`, `/api/acoes` e `/api/carteira/*`. BrasilAPI, ViaCEP, BRAPI, Twelve Data e dataset CVM já possuem adapters/clients, mas o cadastro de corretora aceita CNAE antes de uma verificação CVM posterior. O commit `4a3ed52` introduziu `6612601`, `6612602` e `6431900`; essa lista permanece no código atual. O POST americano real retornou 503 e a UI manteve estado que parece travamento.

## Goals / Non-Goals

**Goals:** preservar demonstração explícita de CNPJ, CEP, ações e endpoints; fazer cada integração observável, bloqueante e testável; corrigir o mínimo financeiro das operações.

**Non-Goals:** catálogo global completo, criação implícita de ativo, taxas, importação, execução real de ordem ou cobertura universal de bolsas.

## Decisions

### Rotas mínimas preservadas

Não remover nem renomear GET/POST de `/api/corretoras`, GET/POST/PUT de `/api/acoes` e compra/venda/leitura de `/api/carteira`. Os POST finais permanecem nessas rotas; endpoints auxiliares de consulta podem ser adicionados (`/corretoras/consultas/cnpj`, `/corretoras/consultas/cep`, `/acoes/busca`, `/acoes/consulta`). Payload de compra/venda será estendido com data, preço e chave idempotente; chamada antiga incompleta recebe validação explícita em vez de preço oculto.

### Máquina de estados no frontend e tokens de consulta

CNPJ: `editing → company-valid → cvm-valid → cep-valid → review → submitting`. O backend devolve token curto/assinado ou ID de consulta com validade e hash dos dados; o POST revalida estado/validade para não confiar no browser. Alterar CNPJ invalida tudo; alterar CEP invalida endereço. O CEP da empresa é apenas sugestão.

Ativo: `search/manual → consulting → review → submitting`. Campo Mercado permanece visível. Resultado selecionado preenche bolsa/país/moeda; entrada manual exige mercado e a mesma consulta de validação. Cancelamento aborta a assinatura no cliente, mas o backend também aplica timeout e não persiste antes da confirmação.

### CVM é fonte autorizativa; CNAE é diagnóstico complementar

Expandir `RegulatoryRegistryPort` para consulta por CNPJ no snapshot oficial atual e classificar ativo, categoria, referência e coleta. A lista de categorias compatíveis será configuração versionada e coberta por fixture oficial; indisponível/stale/inconclusivo bloqueia. Os três CNAEs históricos podem gerar observação ou defesa adicional, jamais aprovação. O refresh periódico continua e passa a bloquear novas operações ao degradar uma corretora, preservando ledger/posição.

### Ports/adapters e falhas tipadas

Domínio depende de `CompanyRegistryPort`, `AddressLookupPort`, `RegulatoryRegistryPort`, `AssetSearchPort`, `QuotePort` e `HistoricalPricePort`. Adapters existentes são reaproveitados. Cada integração possui timeout, limite de payload, rate limit/cache compatíveis com seus termos e mapeamento distinto para not-found, invalid, unavailable e limited. Retry automático só em leitura idempotente; mutações nunca são repetidas silenciosamente.

Pelo menos três integrações reais e visíveis na apresentação: BrasilAPI, ViaCEP e CVM. BRAPI/Twelve Data aparecem ao cadastrar ativos de seus mercados. Segredos permanecem em variáveis do backend.

### Catálogo leve, sem grande ingestão

Para caber no MVP, autocomplete consulta o provider por port e mantém cache local de sugestões/consultas; não será construído um catálogo mundial versionado. Resultado carrega identidade suficiente para confirmação. Fallback manual cobre lacunas sem contornar validação. Chave de duplicidade continua ticker canônico+mercado por proprietário.

### Operação usa ledger existente ampliado

Guardar `operation_date`, `unit_price`, `currency`, `total`, `idempotency_key` e vínculo de correção/estorno via Liquibase. Sugestão histórica é chamada de leitura separada e nunca ocorre no POST final. Posição é recalculada atomicamente; venda respeita saldo no mesmo escopo proprietário+ativo+corretora. Sem taxas no MVP.

## Risks / Trade-offs

- [Dataset CVM fora do ar] → cadastro bloqueado com retry; cache só é aceito dentro da validade aprovada.
- [Categoria oficial muda] → lista configurável/versionada, fixtures e revisão humana antes do deploy.
- [Autocomplete limitado] → fallback manual obrigatório e validado; não prometer cobertura total.
- [Timeout americano reaparece] → timeout backend/frontend, cancelamento, correlação segura e estado recuperável.
- [Contrato de operação muda] → preservar rota e cobrir payload novo/erro antigo em contract tests.

## Migration Plan

Adicionar campos e estado regulatório sem remover os existentes; preencher operações legadas com data/preço/moeda já persistidos e total derivado, marcando proveniência legado. Rodar refresh CVM sem apagar corretoras. Liberar consultas e UI antes de tornar os novos campos obrigatórios. Rollback desliga novos passos e preserva dados adicionados.
