## Why

O sistema expõe hoje todas as rotas Angular e APIs de carteira sem autenticação, o que é incompatível com a apresentação profissional planejada. Uma autenticação administrativa mínima, real e verificável deve existir antes do dashboard completo para que proteção de sessão, rotas, estados e E2E sejam fundamentos, não remendos posteriores.

## What Changes

- Adicionar Spring Security com autenticação de um administrador persistido e senha armazenada exclusivamente como hash adaptativo.
- Criar a credencial administrativa inicial a partir de variáveis de ambiente obrigatórias no primeiro bootstrap, sem literal funcional versionado, log ou resposta que revele o segredo.
- Autenticar por sessão do servidor com cookie HttpOnly, Secure em HTTPS, SameSite e proteção contra fixação de sessão; nenhum token de autenticação será gravado em `localStorage`, `sessionStorage` ou JavaScript persistente.
- Proteger contra CSRF todas as requisições mutáveis da SPA e renovar o token CSRF após login e logout.
- Expor login, consulta da sessão atual e logout; proteger todos os endpoints de negócio e liberar somente login, bootstrap CSRF e healthchecks mínimos necessários.
- Proteger as rotas Angular com guard e restaurar apenas destino interno seguro após autenticação.
- Implementar página de login original, responsiva e WCAG 2.2 AA, com mostrar/ocultar senha acessível e estados de carregamento, erro genérico, bloqueio temporário e sucesso.
- Retornar mensagens indistinguíveis para usuário inexistente, senha inválida, conta desabilitada ou bloqueada quando isso evitar enumeração.
- Limitar tentativas repetidas por conta e origem com janela e bloqueio temporário configuráveis, observabilidade segura e expiração automática.
- Implementar logout por POST protegido por CSRF, invalidando a sessão e removendo o cookie.
- Não incluir cadastro público, recuperação de senha por e-mail, login social, MFA, múltiplos papéis ou administração de usuários nesta fase.
- Declarar esta mudança como predecessora obrigatória de `modernize-investment-experience`.

## Capabilities

### New Capabilities

- `secure-admin-authentication`: credencial administrativa inicial, armazenamento de senha, login por sessão segura, CSRF, autorização de APIs/rotas, logout, limitação de tentativas e experiência acessível.

### Modified Capabilities

Nenhuma.

## Impact

- Backend futuro: dependência Spring Security, configuração de filter chain, entidade/repositório administrativo, endpoints de autenticação, hashing, sessão, CSRF, rate limiting e testes.
- Frontend futuro: rota pública de login, serviço/facade de sessão, interceptor/configuração XSRF, guard funcional, tratamento 401/403/429 e logout.
- Banco futuro: tabela administrativa e dados de bloqueio/tentativas, criados por migração aditiva.
- Runtime: novas variáveis `ADMIN_INITIAL_USERNAME` e `ADMIN_INITIAL_PASSWORD`, sem valores funcionais no Git; os três containers existentes são preservados.
- Dependência: `modernize-investment-experience` somente poderá iniciar a implementação do dashboard protegido depois da conclusão desta mudança.
- Compatibilidade: clientes anônimos dos endpoints de negócio passarão a receber 401; esta é uma alteração intencional de segurança.
