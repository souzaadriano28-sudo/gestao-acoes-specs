## 1. Base de verificacao dos dois repositorios

- [x] 1.1 Registrar estado inicial e comandos de build/teste dos dois repositórios, preservando alterações locais; verificar baseline documentado com falhas existentes identificadas, sem marcar testes quebrados como ignorados.
- [x] 1.2 Corrigir imports e expectativas obsoletos de AppComponent, AcaoComponent e AcaoService no Angular; verificar que os testes compilam e exercitam os símbolos reais.
- [x] 1.3 Preparar fixtures determinísticas BRL/USD e substitutos dos quatro provedores externos no backend; verificar testes sem credenciais reais e sem chamadas externas (AI-03/04).

## 2. Contrato de erro e identificadores no backend

- [x] 2.1 Consolidar handlers, exceções classificadas e envelope AE-01; verificar testes HTTP para tipos/JSON inválidos em 400, regras em 422, ausências em 404, duplicidades/conflitos em 409, integrações em 404/429/502/503, falha em 500 e método/conteúdo em 405/415, incluindo prioridade de validação, fieldErrors múltiplos e ausência de segredos.
- [x] 2.2 Centralizar normalização de CNPJ, ticker e mercado nos cadastros, consultas e operações; validar formato original e dígitos verificadores do CNPJ, aceitando no corpo somente 14 dígitos ou máscara convencional e na URL somente 14 dígitos; verificar todos os cenários CI-01/02 e ambos os aliases de cada mercado.
- [x] 2.3 Rejeitar ID de criação e impedir sua propagação nos mappers; verificar POSTs que tentam reutilizar ID sem modificar o registro existente (CI-03).
- [x] 2.4 Mapear duplicidade canônica e colisões concorrentes de cadastro para 409; verificar com barreira em PostgreSQL que cadastros equivalentes simultâneos produzem exatamente um 201, um 409 e um registro, além das restrições do banco (CI-01/03).

## 3. Validacao e integridade de carteira

- [x] 3.1 Aplicar validação ao DTO e endpoints de compra/venda e desserialização inteira estrita; verificar ausência/null/branco/zero/negativos em 422 e texto/fração/`10.0`/número não representável em 400, com zero gravações e consultas externas (TI-01).
- [x] 3.2 Validar referências e compatibilidade de mercado no serviço, selecionando provedor pelo cadastro; verificar 404/422 antes da consulta externa e sucesso BRASIL/AMERICANO (TI-02).
- [x] 3.3 Validar resposta/preço/moeda em todos os consumidores e adaptar respostas externas sem fallback que encubra dado ausente; verificar resposta/lista/preço/moeda ausente, lista vazia, zero, negativo, não numérico, NaN, infinito, moeda incompatível e ativo explicitamente ausente em cadastro, atualização, operação e patrimônio (TI-03).
- [x] 3.4 Migrar preço unitário e médio para decimal de precisão 19/escala 8 e aplicar HALF_UP conforme TI-04; verificar média 10,00666667, patrimônio 100,01 sem arredondamento intermediário, preço que vira zero e JSON numérico.
- [x] 3.5 Proteger cálculos de quantidade acumulada e valores fora da precisão, preservando média ponderada, separação por corretora, vendas parcial/total e recompra após zerar; verificar todos os cenários TI-05 e histórico intacto.
- [x] 3.6 Separar consulta externa da região transacional e serializar compra/venda pela corretora com releitura da posição; verificar que falha intermediária reverte histórico e posição e que rede não ocorre durante o lock (TI-05/06).
- [x] 3.7 Preparar procedimento versionado de diagnóstico/normalização de legado e migração decimal, com restrições de unicidade/positividade; verificar que legado válido preserva IDs/vínculos e legado conflitante ou fora da precisão interrompe sem mesclar, apagar ou arredondar silenciosamente (CI-03).
- [x] 3.8 Implementar testes de persistência no PostgreSQL isolado com stubs fixos, barreiras controladas e timeouts limitados; verificar duas primeiras compras confirmadas, exatamente uma de duas vendas confirmada com a outra em 422, timeout em 409 e rollback por leitura posterior (TI-06).

## 4. Configuracao externa de credenciais

- [x] 4.1 Substituir constantes e propriedades reais por BRAPI_TOKEN, TWELVEDATA_API_KEY e DB_PASSWORD conforme perfil; verificar injeção de valores fictícios externos e falha segura de startup para configuração ausente, vazia ou composta somente de espaços (AI-03).
- [x] 4.2 Revisar código, propriedades, documentação, coleção Postman e fixtures dos dois repositórios para remover credenciais reais do conteúdo atual; verificar varredura que reporte somente arquivos/ocorrências, nunca valores, e testes de sanitização de respostas/logs.
- [x] 4.3 Documentar configuração local/teste e procedimento para substituição/revogação das credenciais expostas pelo responsável; verificar exemplos sem segredos e distinção entre remover conteúdo atual e revogar no provedor, sem reescrever Git.

## 5. Fluxos Angular estabilizados

- [x] 5.1 Registrar HttpClient na configuração raiz; verificar bootstrap com providers reais e transporte de teste, resolvendo os três serviços sem falha de injeção (AI-01).
- [x] 5.2 Tipar e centralizar o tratamento do envelope de erro nos serviços/componentes; verificar associação de fieldErrors, erro geral, resposta inesperada, leitura sem comunicação e os três estados de mutação: recusada, confirmada com atualização falha e resultado desconhecido (AE-02).
- [x] 5.3 Aplicar validação local coerente e controle de envio pendente em cadastros, operações e atualização de cotação; verificar quantidade fracionária, clique repetido, bloqueio da alternância compra/venda, liberação em sucesso/erro e ausência de retry automático de POST (AI-02).
- [x] 5.4 Distinguir carregamento, vazio, falha e sucesso nas listagens e patrimônio; verificar falha inicial sem zero fictício, preservação de dados antigos sinalizados e nova tentativa explícita (AE-02).
- [x] 5.5 Ampliar testes HTTP dos serviços e dos componentes para método, rota, payload e resposta de cada fluxo atual; verificar compatibilidade de sucesso 201/200, incluindo compra/venda sem corpo (AI-01).

## 6. Aceite integrado e documentacao

- [x] 6.1 Adicionar jornada automatizada de navegador contra backend de teste com cotações fixas; verificar corretora, PETR4/BRL 20, AAPL/USD 100, compras, venda de 4 PETR4, posições finais e patrimônio JSON exato de 1180.00, além de operação recusada, atualização falha após sucesso e resultado desconhecido por falha de comunicação (AI-01/04, AE-02).
- [x] 6.2 Documentar contratos, aliases, códigos de erro, limites e execução das suítes, incluindo PostgreSQL isolado e navegador; verificar instruções reproduzíveis e explicitação de preço externo, câmbio fixo, precisão 19/8, HALF_UP e ausência de idempotência persistente.
- [x] 6.3 Executar `mvnw.cmd verify` no backend e `npm ci`, `npm run build`, `npm test -- --watch=false` no frontend, além dos comandos documentados de PostgreSQL/navegador; verificar todas as suítes sem falhas e registrar evidências por TI/CI/AE/AI.
- [x] 6.4 Revisar diffs e entregar procedimento de atualização/rollback coordenado; verificar que ambos os mercados permanecem suportados e que autenticação, preço manual e redesign não entraram no escopo.
