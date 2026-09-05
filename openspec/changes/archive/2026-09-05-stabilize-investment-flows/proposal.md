## Why

Os fluxos de cadastro e carteira dos repositórios `gestao-acoes-spring` e `gestao-acoes-ui` têm falhas de integração, validação e consistência que podem impedir o uso da interface ou gravar operações inválidas. Estabilizar esses fluxos antes de expandir o produto permite preservar ações brasileiras e americanas com comportamento verificável.

## What Changes

- Registrar HttpClient no bootstrap Angular e ajustar os testes aos componentes e serviços reais.
- Validar os campos de transação no backend, incluindo quantidade inteira positiva, referências obrigatórias e mercado compatível com o ativo.
- Rejeitar respostas e cotações ausentes, malformadas, não finitas, não positivas ou com moeda incompatível antes de gravar dados ou calcular patrimônio; calcular e arredondar valores monetários com regra decimal determinística.
- Garantir atomicidade, unicidade da posição e consistência de compras e vendas concorrentes; prevenir reenvio enquanto uma operação estiver pendente na interface.
- Normalizar CNPJ, ticker e mercado antes de consultar e persistir, validando primeiro os formatos aceitos e os dígitos verificadores do CNPJ, preservando aliases atualmente aceitos e ambos os mercados.
- Unificar o contrato de erro consumido pelo Angular, distinguindo requisição malformada, regra inválida, ausência, duplicidade, concorrência, integração e falha inesperada; separar operação recusada, sucesso com atualização posterior falha e resultado desconhecido por comunicação interrompida.
- Remover credenciais literais do código e configurações versionadas, usando configuração externa obrigatória e testes sem segredos reais.
- Ampliar testes de serviço, API, persistência e interface com integrações externas simuladas.
- **BREAKING**: requisições antes toleradas com dados inválidos serão rejeitadas; erros terão status semânticos e envelope único. Rotas, payloads válidos e respostas de sucesso atuais serão preservados.

## Capabilities

### New Capabilities

- `transaction-integrity`: validação, preço, atomicidade e concorrência de carteira.
- `canonical-identifiers`: normalização de cadastros e compatibilidade entre mercados.
- `api-error-contract`: respostas de erro estáveis e consumo pela interface.
- `application-integration`: bootstrap HTTP, configuração de credenciais e regressão integrada dos dois repositórios.

### Modified Capabilities

Nenhuma: `openspec/specs/` não possui especificações existentes. As novas specs formalizam e estabilizam capacidades já parcialmente implementadas.

## Impact

Backend: resources, DTOs, serviços, mappers, repositórios, entidades de carteira, integrações Brapi/Twelve Data, handlers e propriedades. Frontend: bootstrap, serviços HTTP, componentes e testes. Os contratos afetados incluem `/acoes`, `/corretoras` e `/carteira`.

A implementação exigirá ajustes de restrições de persistência e tratamento explícito de dados legados conflitantes, sem descarte automático. As credenciais expostas deverão ser substituídas pelo responsável pelo ambiente; reescrita do histórico Git não faz parte desta mudança.

Fora do escopo: autenticação, múltiplas carteiras, redesign visual completo, preço manual, custos, operações retroativas, proventos, câmbio dinâmico, execução de ordens e idempotência persistente entre requisições independentes. Mantêm-se cotação externa como preço da operação, quantidade inteira e a fórmula atual de conversão do patrimônio; sua taxa fixa permanece uma limitação conhecida. A adoção de cálculo decimal nesta mudança limita-se aos preços, médias e totais já existentes.
