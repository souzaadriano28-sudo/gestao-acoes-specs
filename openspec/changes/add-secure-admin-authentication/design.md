## Context

Ver [proposal.md](./proposal.md) para a motivação. O backend Spring Boot 4.0.6 não possui hoje dependência/configuração Spring Security, entidade de usuário ou endpoints de autenticação. O Angular 21 fornece HTTP e router sem guard/interceptor de sessão. Nginx entrega a SPA e encaminha `/api` para um único backend; esta topologia same-origin deve ser preservada. A autenticação é predecessora de `modernize-investment-experience`.

## Goals / Non-Goals

**Goals:**

- Criar uma única fronteira administrativa real, simples e evolutiva.
- Manter autenticação no servidor e credenciais fora do JavaScript persistente.
- Integrar sessão e CSRF corretamente a uma SPA Angular.
- Oferecer login finalizado visualmente e verificável nos três containers.

**Non-Goals:**

- Criar IAM genérico, gestão de usuários ou autorização por múltiplos papéis.
- Resolver rotação/autosserviço de senha, MFA, OAuth/OIDC ou recuperação.
- Compartilhar sessões entre múltiplas réplicas; o runtime atual tem um backend.
- Alterar regras financeiras ou implementar o dashboard moderno nesta mudança.

## Decisions

### 1. Spring Security e negação por padrão

Adicionar `spring-boot-starter-security` compatível com o BOM atual e uma `SecurityFilterChain` explícita. Serão públicos apenas `GET /auth/csrf`, `POST /auth/login` e endpoints mínimos de readiness/liveness. `GET /auth/session`, `POST /auth/logout`, documentação e toda API de negócio exigirão autenticação administrativa. Entry point e access denied handler retornarão JSON no envelope comum, nunca redirect/form HTML.

Alternativa: proteger apenas pelo guard Angular. Rejeitada porque código cliente não é fronteira de segurança.

### 2. Administrador persistido e bootstrap idempotente

Tabela `admin_user`: id, username canônico/único, `password_hash`, enabled, failed count/window start, `locked_until`, timestamps e versão otimista. `ADMIN_INITIAL_USERNAME` e `ADMIN_INITIAL_PASSWORD` serão segredos obrigatórios do primeiro bootstrap. Um runner transacional cria a conta somente quando a tabela está vazia, usando o encoder antes do `INSERT`; se já existir conta, nunca atualiza o hash. Nenhum modelo `.env` terá valor funcional.

Alternativa: usuário somente em memória criado a cada startup. Rejeitada porque troca involuntária de senha e estado de bloqueio seriam frágeis.

### 3. Hash adaptativo com formato evolutivo

Usar `DelegatingPasswordEncoder` e formato `{id}hash`, com encoder recomendado pela versão compatível do Spring Security. A comparação será delegada ao framework; a política de custo será testada e poderá fazer upgrade do hash após autenticação futura sem formato proprietário. Texto claro e NoOp são proibidos.

### 4. Sessão server-side e cookie

Usar HttpSession com proteção de fixação `changeSessionId`, timeout ocioso padrão de 30 minutos e cookie nomeado `ATLAS_SESSION`, HttpOnly, SameSite=Lax, Path `/` e Secure em HTTPS. Produção falhará ou será considerada não pronta se a configuração declarar HTTPS obrigatório e o cookie seguro não puder ser garantido. O perfil local loopback poderá desabilitar `Secure` explicitamente, nunca por fallback silencioso.

Não haverá JWT ou bearer token. O Angular guard chama `/auth/session` e mantém apenas estado de UI em memória.

Alternativa: JWT em localStorage. Rejeitada pelo requisito e pelo impacto de XSS/expiração/revogação para uma única SPA administrativa.

### 5. CSRF para SPA

Manter CSRF habilitado. `HttpSessionCsrfTokenRepository` guarda o valor esperado na sessão e `GET /auth/csrf` devolve somente o token atual para memória da SPA. Um interceptor envia `X-CSRF-TOKEN` nos métodos mutáveis same-origin. A página obtém token antes do login e busca um novo após autenticação e logout, pois essas transições invalidam/renovam estado de segurança.

Alternativa: desabilitar CSRF porque a API usa JSON. Rejeitada: cookies de sessão são enviados automaticamente pelo navegador e JSON não elimina CSRF.

### 6. Limitação de tentativas

Configuração padrão: cinco falhas em quinze minutos, bloqueio por quinze minutos. Estado de conta será persistido com relógio injetável e atualização atômica. Um limitador de origem complementará o bloqueio para usuários inexistentes; a origem será derivada apenas do endereço remoto confiável, sem aceitar `X-Forwarded-For` arbitrário. Nginx/proxy terá política explícita de forwarded headers. Respostas inválidas usarão texto genérico e trabalho de hash equivalente para usuário inexistente.

Persistir bloqueio de conta permite sobreviver a restart; o limitador de origem poderá ser local enquanto houver uma réplica. Se o runtime escalar, o mecanismo de origem deverá migrar para armazenamento compartilhado antes de múltiplas réplicas.

### 7. Contratos de autenticação

- `GET /auth/csrf` → token e nomes de header/parâmetro, sem autenticação.
- `POST /auth/login` → JSON usuário/senha, CSRF obrigatório, cria/renova sessão; 200 com identidade mínima ou 401/429 genérico.
- `GET /auth/session` → 200 `{authenticated:true, username}` ou 401.
- `POST /auth/logout` → CSRF obrigatório, invalida sessão/cookie; 204.

Senha nunca volta em DTO. Cache deve ser desabilitado nos endpoints de autenticação. Login não aceita return URL; o redirect é responsabilidade do Angular após validação local de rota interna.

### 8. Angular e experiência de login

Criar `LoginPage`, `AuthService`, facade de sessão, guard funcional e interceptor de 401/CSRF. A rota `/login` é pública; as demais são protegidas. O guard preserva `returnUrl` somente se começar com `/`, não tiver protocolo/host, não apontar para login e corresponder a rota interna conhecida. Um 401 global limpa somente estado em memória e navega ao login sem loop.

O formulário é reativo e tipado. Mostrar/ocultar alterna `type`, mantém o mesmo controle e foco, e atualiza `aria-pressed`/nome acessível. Não haverá links falsos para cadastro, social ou “esqueci minha senha”.

### 9. Direção visual do login

Desktop 1440×1024: composição 58/42, com painel azul-marinho contendo identidade Atlas, mensagem de produto acadêmico e elementos geométricos abstratos; painel claro centraliza formulário de até 420 px. Mobile 390×844: somente formulário e marca, aviso acadêmico após a ação e sem ilustração que roube altura. Tipografia, tokens, foco e densidade são os mesmos do dashboard refinado.

Estados prototipados: padrão, foco, senha visível, validação local, envio pendente e erro genérico/bloqueio. Os PNGs de aprovação mostram o estado padrão; o HTML permite alternar visualmente os estados sem autenticar.

### 10. CORS, Nginx e cookies

Produção continuará same-origin por `/api`, eliminando necessidade de CORS para o navegador publicado. Desenvolvimento preferirá proxy Angular. Se acesso direto cross-origin continuar habilitado para diagnóstico, permitirá credenciais somente para a origem exata configurada, nunca `*`, e testes cobrirão preflight/cookies. TLS e headers seguros pertencem ao deployment; o cookie Secure não substitui HTTPS.

### 11. Testes

- Backend unitário: bootstrap, encoder, relógio, limites e genericidade.
- Backend integração: SecurityFilterChain, CSRF, sessão/fixação, cookie, 401/403/429, logout e proteção de todos os resources.
- PostgreSQL: bootstrap concorrente, contadores/bloqueio e migração.
- Frontend unitário: auth service, guard, interceptor, return URL, formulário e mostrar/ocultar.
- Acessibilidade: teclado, foco, anúncios, labels, 200% e 320 px.
- E2E três containers: login inválido, limitação, login válido, refresh com sessão, rota direta, mutação CSRF, expiração simulada e logout.

## Risks / Trade-offs

- [Cookie Secure não funciona no HTTP local] → perfil loopback explícito e produção HTTPS obrigatória; documentar diferença sem relaxar produção.
- [Bloqueio por conta pode ser usado para negação de serviço] → combinar janela curta, limite por origem, mensagem genérica e métricas operacionais.
- [Limitador em memória não escala horizontalmente] → aceitável para uma réplica atual; bloquear escala até armazenamento compartilhado.
- [Variável de senha inicial continua presente no ambiente] → tratar como segredo, nunca logar, não reaplicar após bootstrap e documentar remoção/rotação operacional futura.
- [CSRF em SPA possui renovação sutil] → endpoint dedicado e E2E após login/logout/expiração.
- [Guard pode produzir falsa sensação de segurança] → resource tests garantem autorização no backend para cada endpoint.
- [Spring Boot 4/Security 7 podem mudar APIs] → usar BOM do projeto e documentação da versão resolvida, com contract tests em vez de copiar configuração de versão diferente.

## Migration Plan

1. Adicionar contract tests anônimos que demonstrem a exposição atual e fixtures de endpoints.
2. Criar tabela/migração administrativa e propriedades obrigatórias com valores não funcionais nos exemplos.
3. Implementar bootstrap, encoder, limitação e testes PostgreSQL.
4. Configurar Spring Security, sessão, CSRF e contratos JSON; proteger recursos por negação padrão.
5. Implementar login/guard/interceptor/logout Angular e testes unitários/acessibilidade.
6. Atualizar Compose/Nginx/documentação e executar E2E nos três containers.
7. Somente após todos os gates desta mudança passarem, iniciar `modernize-investment-experience`.

Rollback exige restaurar a versão anterior do backend/frontend em conjunto. A tabela administrativa é aditiva e não deve ser apagada; remover proteção é regressão de segurança e não constitui rollback operacional aceitável após exposição fora de loopback.

## Referências técnicas oficiais

- Spring Security, password storage: https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html
- Spring Security, session management e fixation: https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html
- Spring Security, CSRF para SPA: https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html
- Angular, route guards: https://angular.dev/guide/routing/route-guards
- Angular, HttpClient/XSRF: https://angular.dev/guide/http/security
