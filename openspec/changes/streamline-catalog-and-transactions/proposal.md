## Why

Os cadastros demonstram integrações exigidas pelo trabalho, mas hoje expõem entradas desalinhadas, validações desconectadas e uma criação americana que pode parecer travada. O MVP deve preservar os endpoints e cadastros explícitos enquanto transforma CNPJ, CEP, ativo e operação em fluxos consultáveis, revisáveis e financeiramente corretos.

## What Changes

- Preservar cadastro manual de CNPJ/CEP e os endpoints mínimos de corretoras, mas separar consultar CNPJ, validar CVM, escolher/consultar CEP e confirmar.
- Exigir empresa ativa, registro CVM ativo e categoria compatível; CNAEs `6612601`, `6612602` e `6431900` permanecem apenas como verificação complementar. Resultado ausente, inativo, incompatível, inconclusivo ou indisponível bloqueia o cadastro.
- Sugerir o CEP da BrasilAPI sem inserção silenciosa; exigir “Usar este CEP” ou outro CEP e nova consulta ViaCEP depois de cada alteração.
- Preservar corretora histórica que perca autorização, bloqueando novas operações por ela.
- Preservar cadastro explícito e endpoints mínimos de ações; adicionar busca/autocomplete por ticker ou nome para Brasil/EUA, preenchimento automático e fallback manual de ticker+mercado.
- Exigir “Consultar ativo” e mostrar nome, mercado visível, bolsa, moeda, cotação e horário antes da confirmação; impedir duplicidade e distinguir inexistente de indisponível.
- Corrigir o fluxo americano com timeout, cancelamento, nova tentativa e proteção contra duplo envio.
- Ampliar compra/venda simulada com ativo já cadastrado, data, quantidade, preço unitário editável, moeda, corretora, total e revisão; sugestão histórica é opcional e nunca substitui o preço pago.
- Adicionar idempotência, reconciliação, venda limitada, preço médio correto e correção/estorno auditável; nenhuma operação cria ativo silenciosamente.
- Dependência obrigatória: `enable-secure-multi-user-ownership`.

## Capabilities

### New Capabilities

- `validated-registration-workflows`: consulta/revisão explícita de corretoras, ativos e lançamentos com provedores isolados e estados bloqueantes.

### Modified Capabilities

- `broker-registration-evidence`: tornar a situação CVM ativa e categoria compatível pré-condições do cadastro, mantendo CNAE complementar.
- `canonical-identifiers`: aceitar autocomplete e fallback manual validado sem colisão ticker/mercado.
- `transaction-integrity`: aceitar data e preço efetivo, idempotência, correção/estorno e regra de corretora autorizada.
- `simulated-investment-operations`: exibir preço, moeda, data e total antes de confirmar compra/venda.
- `api-error-contract`: distinguir inválido, inexistente, limite excedido, integração indisponível, conflito e resultado desconhecido.
- `investment-workspace-ui`: preservar telas explícitas com etapas, alinhamento, cancelamento e revisão.
- `application-integration`: preservar arquitetura em camadas/ports, integrações reais, H2/PostgreSQL, E2E e Docker.

## Impact

Fluxos Angular de corretora/ação/operação, contratos existentes com extensões compatíveis, serviços de domínio, ports/adapters BrasilAPI, ViaCEP, CVM, BRAPI e Twelve Data, timeouts/cache, Liquibase para ledger/estado regulatório e testes. A consulta CVM hoje é posterior ao cadastro; passará a ser gate transacional sem apagar histórico.
