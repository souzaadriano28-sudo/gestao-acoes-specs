## Purpose

Proteger a aplicação acadêmica com autenticação administrativa real, sessão server-side e uma experiência acessível, sem expor credenciais ou depender de tokens persistidos no navegador.

## ADDED Requirements

### Requirement: SA-01 Administrador inicial seguro
Quando não existir administrador, o backend SHALL criar exatamente uma conta administrativa a partir de nome de usuário e senha inicial fornecidos por variáveis de ambiente obrigatórias. A senha SHALL ser transformada por hash adaptativo unidirecional antes da persistência e seu valor original MUST NOT ser salvo, retornado ou registrado. Reiniciar a aplicação com uma conta existente MUST NOT sobrescrever sua senha ou criar duplicidade.

#### Scenario: Primeiro bootstrap
- **WHEN** o banco não possui administrador e as duas variáveis iniciais são válidas
- **THEN** uma única conta habilitada é criada com usuário canônico e hash suportado, sem senha em texto claro no banco ou logs.

#### Scenario: Credencial ausente
- **WHEN** o primeiro bootstrap ocorre sem usuário ou senha inicial válida
- **THEN** a aplicação falha antes de aceitar tráfego e identifica somente o nome da configuração ausente.

#### Scenario: Reinício posterior
- **WHEN** a aplicação reinicia depois que o administrador já existe
- **THEN** o registro e seu hash não são substituídos pelos valores de bootstrap.

### Requirement: SA-02 Login e respostas não enumeráveis
O sistema SHALL autenticar nome de usuário e senha por POST, usando comparação segura com o hash persistido. Falhas por usuário inexistente, senha incorreta, conta desabilitada ou bloqueio não SHALL revelar qual condição ocorreu; corpo, status e tempo observável deverão reduzir enumeração. Sucesso SHALL renovar o identificador de sessão e retornar somente identidade pública mínima e estado autenticado.

#### Scenario: Credencial válida
- **WHEN** o administrador habilitado informa usuário e senha corretos e não está limitado
- **THEN** recebe sessão autenticada com id renovado e resposta sem hash, senha ou detalhes internos.

#### Scenario: Credencial inválida
- **WHEN** usuário ou senha não corresponde
- **THEN** a resposta usa mensagem genérica equivalente, não cria sessão autenticada e registra somente metadados seguros da tentativa.

#### Scenario: Campo vazio
- **WHEN** usuário ou senha está vazio ou excede os limites aceitos
- **THEN** a requisição é recusada sem ecoar a senha e sem distinguir existência da conta.

### Requirement: SA-03 Limitação de tentativas
Tentativas inválidas SHALL ser limitadas por conta candidata e origem de rede através de janela, limiar e bloqueio temporário configuráveis. O limite padrão SHALL ser cinco falhas em quinze minutos com bloqueio de quinze minutos. Sucesso SHALL limpar o contador aplicável; expiração SHALL liberar automaticamente nova tentativa. A resposta MUST NOT confirmar se o bloqueio pertence à conta ou à origem.

#### Scenario: Limiar excedido
- **WHEN** a quinta falha ocorre dentro da janela padrão
- **THEN** novas tentativas durante quinze minutos são recusadas sem executar autenticação custosa repetidamente e com mensagem genérica.

#### Scenario: Bloqueio expirado
- **WHEN** o relógio ultrapassa `lockedUntil`
- **THEN** uma credencial válida pode autenticar e os contadores expirados são limpos.

#### Scenario: Reinício durante bloqueio de conta
- **WHEN** o backend reinicia durante um bloqueio associado à conta existente
- **THEN** o bloqueio de conta continua vigente até seu instante de expiração.

### Requirement: SA-04 Sessão e cookie seguros
A autenticação SHALL ser persistida exclusivamente em sessão server-side. O cookie de sessão SHALL ser HttpOnly, SameSite=Lax ou mais restritivo, limitado ao path necessário e Secure em ambientes HTTPS; o id de sessão MUST NOT aparecer em URL ou corpo. Login SHALL proteger contra fixação, sessão expirada SHALL resultar em 401 e logout SHALL invalidar a sessão e expirar o cookie. Tokens de autenticação MUST NOT ser gravados em localStorage ou sessionStorage.

#### Scenario: Cookie em produção HTTPS
- **WHEN** o login ocorre no perfil de produção servido por HTTPS
- **THEN** o cookie possui HttpOnly, Secure, SameSite e Path configurados e JavaScript não acessa seu valor.

#### Scenario: Sessão expirada
- **WHEN** a sessão ultrapassa o timeout ocioso configurado
- **THEN** a próxima chamada protegida retorna 401 e o frontend encaminha ao login preservando somente destino interno seguro.

#### Scenario: Logout
- **WHEN** o administrador confirma logout
- **THEN** a sessão é invalidada, o cookie expira e qualquer reutilização do id anterior recebe 401.

### Requirement: SA-05 Proteção CSRF da SPA
Todas as requisições mutáveis, incluindo login e logout, SHALL exigir token CSRF válido vinculado à sessão. A SPA SHALL obter o token por endpoint público mínimo e enviá-lo em header; após login e logout deverá obter token novo. O token CSRF poderá existir somente em memória JavaScript ou mecanismo dedicado suportado, mas MUST NOT funcionar como credencial de autenticação.

#### Scenario: Mutação sem CSRF
- **WHEN** uma requisição POST/PUT/PATCH/DELETE chega sem token válido
- **THEN** retorna 403 no envelope seguro e nenhuma regra de negócio ou autenticação é executada.

#### Scenario: Login com CSRF
- **WHEN** a página de login carrega
- **THEN** obtém um token CSRF e o envia no login; após sucesso descarta o anterior e solicita outro.

#### Scenario: Token reutilizado após logout
- **WHEN** um token anterior ao logout é reenviado
- **THEN** ele é rejeitado e não recria ou reutiliza a sessão encerrada.

### Requirement: SA-06 Autorização de endpoints e rotas
Somente bootstrap CSRF, login e healthchecks mínimos SHALL ser públicos. Consulta de sessão, logout, ações, corretoras, carteira, operações, documentação administrativa e demais endpoints SHALL exigir administrador autenticado, adotando negação por padrão. Rotas Angular de negócio SHALL usar guard para experiência, mas o backend SHALL continuar sendo a fronteira de autorização.

#### Scenario: API anônima
- **WHEN** um cliente sem sessão chama qualquer endpoint de negócio
- **THEN** recebe 401 no envelope JSON comum, sem redirecionamento HTML e sem executar o recurso.

#### Scenario: Rota Angular protegida
- **WHEN** uma pessoa anônima navega diretamente para uma rota de carteira
- **THEN** é direcionada ao login e, após sucesso, pode retornar somente ao caminho interno validado.

#### Scenario: Caminho externo como retorno
- **WHEN** o parâmetro de retorno contém URL absoluta, protocolo, host ou caminho não permitido
- **THEN** ele é ignorado e o destino após login é o Dashboard.

### Requirement: SA-07 Experiência de login e logout acessível
A página de login SHALL ser responsiva e coerente com a identidade Atlas Carteira, conter usuário, senha, mostrar/ocultar senha, ação de entrar e aviso acadêmico. Labels, instruções, erros e estado pendente SHALL ser programaticamente associados e anunciados; alternar visibilidade SHALL preservar valor e foco e atualizar nome/estado acessível. A página não SHALL apresentar cadastro, recuperação por email ou login social.

#### Scenario: Mostrar senha
- **WHEN** a pessoa aciona mostrar senha por teclado ou ponteiro
- **THEN** o mesmo valor passa a ser visível, o controle anuncia “Ocultar senha”, o foco permanece e nenhum dado é enviado.

#### Scenario: Envio pendente
- **WHEN** o login foi enviado e aguarda resposta
- **THEN** os campos e a ação ficam protegidos contra duplicação, o estado é anunciado e a senha não aparece em texto auxiliar ou URL.

#### Scenario: Erro genérico
- **WHEN** o login é recusado ou temporariamente limitado
- **THEN** a página mostra mensagem genérica, mantém o usuário, limpa a senha conforme política definida e move/anuncia foco de forma acessível.

#### Scenario: Reflow móvel
- **WHEN** a página é usada em 390×844 ou 320 CSS px com zoom de 200%
- **THEN** formulário, aviso, ação e mostrar/ocultar permanecem visíveis e operáveis sem rolagem horizontal.

### Requirement: SA-08 Escopo mínimo e observabilidade segura
O sistema MUST NOT oferecer nesta mudança cadastro público, recuperação de senha, login social, MFA, remember-me, múltiplos papéis ou interface de gestão de usuários. Logs e métricas SHALL registrar sucesso/falha/limitação de modo suficiente para operação, sem senha, hash, cookie, token CSRF ou usuário completo quando a minimização permitir.

#### Scenario: Superfície pública
- **WHEN** rotas e endpoints públicos são enumerados por teste
- **THEN** não existem endpoints funcionais de cadastro, recuperação, OAuth/social ou administração de usuário.

#### Scenario: Inspeção de logs
- **WHEN** login, falha, bloqueio, expiração e logout são exercitados
- **THEN** logs não contêm credenciais, hashes, ids de sessão, cookies ou tokens CSRF.
