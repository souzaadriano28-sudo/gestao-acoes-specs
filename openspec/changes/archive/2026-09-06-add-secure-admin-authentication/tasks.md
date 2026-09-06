## 1. Baseline e contrato de autenticação

- [x] 1.1 Registrar os endpoints atualmente públicos e criar testes de caracterização que comprovem o comportamento anterior à proteção. Verificação: suíte backend identifica explicitamente cada rota que passará a exigir sessão.
- [x] 1.2 Adicionar a dependência Spring Security e documentar as versões efetivamente resolvidas pelo build. Verificação: árvore de dependências não contém versões conflitantes.
- [x] 1.3 Definir os contratos JSON de `GET /auth/csrf`, `POST /auth/login`, `GET /auth/session` e `POST /auth/logout`, incluindo códigos de erro genéricos. Verificação: testes de contrato cobrem sucesso, ausência de sessão, CSRF inválido e credenciais inválidas.
- [x] 1.4 Documentar a ordem de entrega que torna esta mudança pré-requisito de `modernize-investment-experience`. Verificação: os dois artefatos OpenSpec apontam para a mesma dependência.

## 2. Persistência, senha e bootstrap administrativo

- [x] 2.1 Criar migração versionada para a entidade administrativa mínima, com identificador normalizado, hash da senha, estado de bloqueio, contadores e timestamps de auditoria técnica. Verificação: migração sobe em banco vazio e em banco já populado.
- [x] 2.2 Mapear a conta administrativa em repositório transacional sem expor o hash em DTOs ou logs. Verificação: teste unitário comprova normalização e ausência do hash nas respostas.
- [x] 2.3 Configurar `DelegatingPasswordEncoder` com algoritmo adaptativo e parâmetros documentados. Verificação: teste aceita o formato persistido e rejeita senha incorreta.
- [x] 2.4 Implementar bootstrap idempotente da credencial inicial exclusivamente por variáveis de ambiente obrigatórias. Verificação: primeira inicialização cria uma conta e reinicializações não substituem silenciosamente a senha.
- [x] 2.5 Falhar de forma segura quando as variáveis administrativas forem ausentes ou inseguras no perfil de implantação. Verificação: teste de inicialização cobre configuração válida, ausente e inválida sem imprimir segredos.
- [x] 2.6 Garantir atomicidade do bootstrap diante de inicializações concorrentes. Verificação: teste de integração concorrente resulta em uma única conta administrativa válida.

## 3. Segurança HTTP, sessão e CSRF

- [x] 3.1 Criar `SecurityFilterChain` explícita com negação por padrão e liberar somente login, obtenção inicial de CSRF e health check estritamente necessário. Verificação: teste parametrizado exige autenticação para todos os demais endpoints.
- [x] 3.2 Configurar respostas JSON consistentes para 401, 403 e sessão expirada, sem redirecionamento HTML. Verificação: testes MockMvc validam status, tipo de conteúdo e mensagem segura.
- [x] 3.3 Configurar sessão no servidor com renovação do identificador após login, expiração por inatividade e invalidação no logout. Verificação: teste comprova proteção contra fixation e impossibilidade de reutilizar a sessão encerrada.
- [x] 3.4 Configurar cookie `ATLAS_SESSION` com `HttpOnly`, `SameSite=Lax`, escopo mínimo e `Secure` em HTTPS, mantendo exceção local explícita apenas para desenvolvimento. Verificação: testes por perfil validam todos os atributos.
- [x] 3.5 Implementar token CSRF associado à sessão e endpoint de obtenção/renovação. Verificação: operações mutáveis sem token ou com token antigo falham, e token renovado funciona após login.
- [x] 3.6 Implementar login com autenticação pelo `AuthenticationManager`, renovação de sessão e resposta sem dados sensíveis. Verificação: teste de integração cobre sucesso e falha.
- [x] 3.7 Implementar consulta de sessão autenticada com apenas os dados necessários à interface. Verificação: resposta anônima é 401 e resposta autenticada não contém hash, cookie ou token.
- [x] 3.8 Implementar logout via POST protegido por CSRF, invalidando sessão e limpando o cookie. Verificação: teste confirma 204 e rejeição de chamadas subsequentes.

## 4. Tentativas repetidas e observabilidade segura

- [x] 4.1 Implementar contador persistente por conta com janela de 15 minutos, limite de 5 falhas e bloqueio temporário de 15 minutos. Verificação: testes com relógio controlado cobrem incremento, bloqueio, expiração e reset após sucesso.
- [x] 4.2 Implementar limitação complementar por origem para uma instância, com limites e retenção configuráveis. Verificação: teste confirma bloqueio sem revelar se a conta existe.
- [x] 4.3 Definir política segura para confiar em cabeçalhos de proxy somente quando a infraestrutura estiver configurada para isso. Verificação: teste não aceita origem forjada na configuração padrão.
- [x] 4.4 Uniformizar mensagens e comportamento observável para usuário inexistente, senha incorreta e conta temporariamente bloqueada. Verificação: testes de contrato retornam a mesma mensagem pública e não permitem enumeração trivial.
- [x] 4.5 Registrar apenas eventos técnicos mínimos de login, bloqueio e logout, sem senha, hash, cookie ou token CSRF. Verificação: teste de captura de logs procura e rejeita valores sensíveis conhecidos.

## 5. Integração Angular protegida

- [x] 5.1 Criar modelos e serviço de autenticação para CSRF, login, sessão e logout usando cookies de sessão. Verificação: testes unitários validam URLs, métodos e ausência de persistência de tokens.
- [x] 5.2 Criar estado de sessão em memória com estados inicial, verificando, autenticado, anônimo e expirado. Verificação: testes cobrem todas as transições e nova aba/reload sem depender de `localStorage`.
- [x] 5.3 Criar interceptor que envie credenciais e o token CSRF em memória apenas nas requisições mutáveis aplicáveis. Verificação: testes garantem que o token não vaza para origens externas nem é salvo no navegador.
- [x] 5.4 Criar guard para rotas privadas e redirecionamento de retorno limitado a caminhos internos seguros. Verificação: testes rejeitam `returnUrl` externo e protegem todas as rotas de carteira.
- [x] 5.5 Criar página de login responsiva com formulário reativo, rótulos persistentes, autocomplete apropriado e mensagens genéricas. Verificação: testes cobrem validação, envio pendente, erro e sucesso.
- [x] 5.6 Implementar mostrar/ocultar senha como botão com nome acessível, estado anunciado e foco preservado. Verificação: teste de teclado e componente cobre alternância sem perder o valor.
- [x] 5.7 Integrar logout à navegação e tratar 401 por expiração sem ciclos de redirecionamento. Verificação: teste unitário restaura a rota segura após novo login.
- [x] 5.8 Garantir que a UI não apresente cadastro público, recuperação por e-mail, login social, MFA ou gestão de múltiplos usuários nesta fase. Verificação: teste de conteúdo e revisão de rotas confirmam a exclusão.

## 6. Apresentação, acessibilidade e responsividade do login

- [x] 6.1 Aplicar a identidade Atlas Carteira e os tokens visuais compartilhados com o dashboard sem importar marca, texto, imagem ou composição das referências de mercado. Verificação: revisão visual compara os artefatos aprovados e o inventário de assets.
- [x] 6.2 Implementar estados visuais de repouso, hover, foco visível, inválido, enviando, erro genérico e sucesso. Verificação: testes de componente e snapshots cobrem cada estado sem depender apenas de cor.
- [x] 6.3 Garantir contraste WCAG 2.2 AA, ordem de foco, alvo mínimo, anúncio de erros e associação entre rótulos, dicas e campos. Verificação: axe automatizado sem violações críticas e auditoria manual por teclado/leitor de tela.
- [x] 6.4 Validar desktop 1440x1024, mobile 390x844, zoom de 200% e reflow de 400%. Verificação: não há rolagem horizontal, sobreposição ou conteúdo essencial oculto.
- [x] 6.5 Exibir aviso persistente de finalidade acadêmica, inexistência de execução de ordens e ausência de recomendação de investimento. Verificação: o aviso permanece legível nas duas larguras e não compete com erros do formulário.

## 7. Containers, testes e entrega

- [x] 7.1 Acrescentar ao exemplo de ambiente as variáveis administrativas, de cookie e de limitação sem incluir credenciais reais. Verificação: scanner de segredos e revisão manual não encontram valores utilizáveis.
- [x] 7.2 Ajustar o Docker Compose para injetar as variáveis necessárias no backend, preservando os três containers frontend, backend e PostgreSQL. Verificação: `docker compose config` resolve sem segredos versionados.
- [x] 7.3 Configurar proxy frontend/backend de mesma origem e, quando o acesso direto de desenvolvimento for necessário, CORS exato com credenciais. Verificação: E2E aceita a origem autorizada e rejeita origem não autorizada.
- [x] 7.4 Executar testes unitários e de integração do backend, incluindo migração, bootstrap, sessão, CSRF, autorização, logout e limitação. Verificação: build Maven finaliza com sucesso.
- [x] 7.5 Executar testes unitários do Angular para serviço, interceptor, estado, guard e LoginPage. Verificação: suíte Angular finaliza sem testes focados ou ignorados indevidamente.
- [x] 7.6 Executar E2E nos três containers para login válido, credenciais inválidas, bloqueio temporário, acesso direto a rota protegida, expiração e logout. Verificação: cenários passam em viewport desktop e mobile.
- [x] 7.7 Executar auditoria E2E de acessibilidade e responsividade do login. Verificação: relatório registra WCAG 2.2 AA, teclado, zoom e viewports exigidos.
- [x] 7.8 Atualizar documentação operacional com bootstrap, rotação manual da credencial inicial, cookies, HTTPS e limitações da fase. Verificação: procedimento é reproduzido em ambiente limpo sem revelar senha.
- [x] 7.9 Executar `openspec validate add-secure-admin-authentication --type change --strict --no-interactive` antes da implementação e novamente ao concluir. Verificação: validação estrita retorna sucesso.
