# Application Integration Specification

## Purpose

Assegurar integração operacional entre Angular e backend e configuração segura e testável dos provedores, com regressão dos fluxos atuais nos dois mercados.

## Requirements
### Requirement: AI-01 Inicializacao e contratos HTTP
A aplicação Angular SHALL inicializar com transporte HTTP fornecido pela mesma configuração raiz usada em produção, disponível a todos os serviços atuais, e permitir navegar nas telas de ações, corretoras e carteira. Rotas, payloads válidos, tipos dos campos e formatos de sucesso atuais SHALL ser preservados: cadastros 201 com corpo, leituras e atualização 200 com corpo, compra/venda 200 sem corpo. Valores de identificadores e mercado nas respostas SHALL seguir a forma canônica definida em CI-01/02.

#### Scenario: Bootstrap real
- **WHEN** o teste inicializa a aplicação importando a configuração raiz de produção e substitui somente o backend de transporte por uma implementação simulada
- **THEN** os serviços HTTP são resolvidos sem registrar outro provedor HTTP que possa ocultar a configuração real, e cada tela carrega seus dados.

#### Scenario: Jornada nos dois mercados
- **WHEN** com cotações fixas PETR4/BRL 20,00, AAPL/USD 100,00 e câmbio fixo vigente de 5,30, o usuário cadastra uma corretora, cadastra os dois ativos, compra 10 PETR4 e 2 AAPL, consulta posições e vende 4 PETR4
- **THEN** os cadastros retornam 201, operações retornam 200 sem corpo, posições finais são 6 PETR4 a 20,00000000 e 2 AAPL a 100,00000000, e o patrimônio final é retornado como número JSON 1180.00 em BRL.

### Requirement: AI-02 Envios pendentes
A interface SHALL permitir somente um envio pendente por formulário de cadastro e por ação de atualização de cotação. Compra e venda SHALL compartilhar um único bloqueio do formulário de operação: durante o envio, não será possível trocar o tipo ou enviar outra operação. O bloqueio SHALL terminar tanto em sucesso quanto em erro. Não SHALL haver repetição automática de POST de operação após falha de rede. Reenvios independentes posteriores não possuem garantia de idempotência nesta mudança e SHALL seguir AE-02 para resultado desconhecido.

#### Scenario: Clique repetido
- **WHEN** o usuário confirma duas vezes antes de a resposta da primeira operação chegar
- **THEN** apenas uma requisição é enviada e o estado pendente fica visível.

#### Scenario: Troca de operacao durante envio
- **WHEN** uma compra está pendente e o usuário tenta selecionar venda ou confirmar outra operação
- **THEN** o tipo e os dados enviados permanecem bloqueados até a resposta, e nenhuma segunda requisição é enviada.

#### Scenario: Liberacao apos erro
- **WHEN** o envio pendente termina com erro
- **THEN** o formulário permite correção e nova tentativa explícita, sem repetir a operação automaticamente.

### Requirement: AI-03 Credenciais externas
Código, configurações, documentação, fixtures, imagens e artefatos versionados dos três repositórios SHALL conter somente referências a configuração ou valores deliberadamente fictícios, nunca credenciais reais. Perfil ativo, URL, usuário e senha do datasource, tokens dos provedores de cotação, endpoints dos quatro provedores, origem CORS e portas publicadas SHALL ser configuráveis externamente sem recompilar a aplicação. Nos perfis que habilitam integrações reais, `BRAPI_TOKEN` e `TWELVEDATA_API_KEY` SHALL ser obrigatórios; em qualquer perfil PostgreSQL, a senha SHALL ser obrigatória e não possuir valor padrão versionado. Ausência, valor vazio ou composto somente de espaços de qualquer segredo obrigatório SHALL impedir inicialização com indicação apenas do nome da configuração ausente. Perfis de testes isolados SHALL substituir integrações e banco conforme sua fixture e não exigir segredos reais. Logs, respostas, relatórios e configurações renderizadas não SHALL expor os valores.

#### Scenario: Configuracao valida
- **WHEN** perfil, datasource, endpoints e origem permitida são fornecidos externamente e BRAPI_TOKEN, TWELVEDATA_API_KEY e a credencial de banco exigida pelo perfil estão presentes
- **THEN** a aplicação inicia com os valores informados sem literal secreto alternativo embutido e sem mudar seus contratos HTTP.

#### Scenario: Credencial ausente
- **WHEN** a aplicação com integrações reais inicia sem BRAPI_TOKEN/TWELVEDATA_API_KEY, ou com valor vazio/somente espaços, ou um perfil PostgreSQL inicia sem senha válida
- **THEN** falha antes de aceitar tráfego com diagnóstico do nome ausente, sem divulgar outras credenciais.

#### Scenario: Credencial nao aparece na saida
- **WHEN** uma integração ou inicialização falha e são inspecionados logs, envelope HTTP, relatórios e configuração renderizada segura
- **THEN** nenhum valor de BRAPI_TOKEN, TWELVEDATA_API_KEY ou senha de banco aparece, inclusive em URLs e mensagens de exceção.

#### Scenario: Testes isolados
- **WHEN** as suítes H2, PostgreSQL e E2E são executadas sem credenciais reais
- **THEN** usam provedores simulados e valores fictícios explícitos sem consultar serviços financeiros externos.

#### Scenario: Modelo local seguro
- **WHEN** um desenvolvedor prepara configuração local a partir do modelo versionado
- **THEN** o modelo documenta todas as variáveis sem conter segredo funcional, arquivos `.env` locais permanecem ignorados pelo Git e pelo contexto de imagem e a aplicação não presume que o Spring carregue esses arquivos automaticamente.

### Requirement: AI-04 Regressao verificavel
As suítes dos dois repositórios SHALL compilar e passar em execução não interativa, cobrir os cenários TI, CI, AE e AI desta mudança e usar resultados determinísticos de provedores simulados. A validação integrada SHALL comprovar os contratos reais da API e o consumo das três telas; concorrência SHALL ser verificada em PostgreSQL isolado com barreiras controladas, timeouts limitados e resultados finais exatos, além dos testes rápidos.

#### Scenario: Execucao completa
- **WHEN** os comandos de verificação documentados são executados em ambiente com dependências e PostgreSQL de teste disponíveis
- **THEN** backend e frontend concluem sem falhas, sem testes ignorados para mascarar regressões e sem rede para provedores externos.

#### Scenario: Contrato entre repositorios
- **WHEN** a jornada brasileira e americana é executada contra o backend de teste com provedores simulados
- **THEN** cadastro, leitura, atualização, compra, venda e apresentação de erros satisfazem os mesmos contratos das specs.
