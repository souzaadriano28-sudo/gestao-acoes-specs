## MODIFIED Requirements

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

