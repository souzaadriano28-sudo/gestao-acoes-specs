# Atlas Carteira

O Atlas Carteira é uma aplicação acadêmica para acompanhamento de carteiras de ações. Reúne cadastro de ativos e corretoras, registro histórico de compras e vendas, cálculo de preço médio, carteira por corretora e moeda, Dashboard e atualização rastreável de cotações.

> **Aviso:** o sistema é destinado ao acompanhamento da carteira. Registros de compra e venda são históricos; nenhuma ordem é enviada ao mercado.

## Repositórios da entrega

| Componente | Responsabilidade | Repositório |
| --- | --- | --- |
| Principal | Integração, Docker Compose e documentação | [gestao-acoes-specs](https://github.com/souzaadriano28-sudo/gestao-acoes-specs) |
| Backend | API Spring Boot | [gestao-acoes-spring](https://github.com/souzaadriano28-sudo/gestao-acoes-spring) |
| Frontend | Aplicação Angular | [gestao-acoes-ui](https://github.com/souzaadriano28-sudo/gestao-acoes-ui) |

O repositório principal coordena a execução; backend e frontend são repositórios independentes e devem ser clonados na estrutura indicada pelo tutorial.

## Arquitetura dos repositórios

Nesta pasta existem três repositórios Git independentes:

| Diretório | Responsabilidade |
| --- | --- |
| `gestao-acoes` | Repositório de integração: `compose.yaml`, ambiente local e esta documentação. |
| `gestao-acoes-spring` | Backend Spring Boot: API, autenticação, regras financeiras, persistência, Liquibase e integrações externas. |
| `gestao-acoes-ui` | Frontend Angular: interface, formulários, Dashboard, carteira e consumo da API. |

```text
Usuário → Frontend Angular/Nginx → Backend Spring Boot → PostgreSQL
                                      ├→ BRAPI
                                      ├→ Twelve Data
                                      └→ Banco Central — PTAX
```

O Compose da raiz constrói e conecta os três serviços. Backend e frontend podem ser desenvolvidos e testados separadamente, mas a aplicação completa depende dessa integração coordenada.

### Estado Git atual

Embora os diretórios tenham nomes de projetos relacionados, a topologia atual **não usa submódulos Git**: não há arquivo `.gitmodules` nem entradas gitlink no repositório raiz. Assim, a raiz não copia os conteúdos dos projetos filhos nem fixa commits deles; cada diretório possui seu próprio remoto e histórico.

Na prática, atualizar o backend ou frontend exige commit e push no respectivo repositório. Um commit na raiz não inclui automaticamente mudanças internas não commitadas desses repositórios. O comando `git submodule status` é útil para confirmar essa situação, mas atualmente não há submódulos para inicializar ou atualizar.

### Versões compatíveis da entrega

Como não há submódulos, a reprodução exata depende da combinação dos três históricos independentes. Os hashes abaixo formam a combinação validada desta entrega.

| Componente | Repositório | Branch | Commit validado |
| --- | --- | --- | --- |
| Backend | `gestao-acoes-spring` | `main` | `ccaece38ff05663f11a48bfe4a523c90af041f94` |
| Frontend | `gestao-acoes-ui` | `master` | `543bed5bb0e070d2f7ad833d6038a00262990fd9` |

Depois dos três clones, use os comandos abaixo para reproduzir exatamente essa combinação:

```powershell
git -C gestao-acoes-spring fetch origin feature/enable-secure-multi-user-ownership
git -C gestao-acoes-spring switch --detach ccaece38ff05663f11a48bfe4a523c90af041f94

git -C gestao-acoes-ui fetch origin feature/enable-secure-multi-user-ownership
git -C gestao-acoes-ui switch --detach 543bed5bb0e070d2f7ad833d6038a00262990fd9
```

`switch --detach` é apropriado para reprodução exata; para desenvolvimento, troque para uma branch própria antes de alterar arquivos.

## Funcionalidades

- Autenticação com sessão e isolamento de dados por usuário.
- Ativos brasileiros e americanos, com moedas BRL e USD.
- Cadastro e consulta de corretoras.
- Registro, prévia, edição e exclusão de operações históricas de compra e venda.
- Carteira separada por ativo, corretora e moeda.
- Dashboard com posições, totais por moeda, fontes de dados e movimentações recentes.
- Atualização explícita de cotações.
- Estados de disponibilidade: disponível, cotação desatualizada e indisponível.
- Histórico de operações com as mais recentes primeiro.

## Regras financeiras

- A chave de uma posição é **ativo + corretora + moeda**, dentro do portfólio do usuário.
- BRL e USD nunca são somados diretamente.
- Custos de compra integram o preço médio.
- Uma venda parcial preserva o preço médio unitário da posição remanescente.
- Custos da venda reduzem a receita líquida e afetam o resultado realizado.
- Resultado realizado e resultado não realizado são métricas distintas.
- Uma venda não pode produzir posição negativa.
- O ledger é reprocessado em ordem cronológica: `dataHora ASC`, com `id ASC` como desempate.
- A leitura do histórico usa `dataHora DESC`, com `id DESC` como desempate.

## Tecnologias confirmadas

- Java 17 e Spring Boot 4.0.6.
- Maven.
- Angular 21.2.x e TypeScript 5.9.x.
- Node.js 24.8.0 na imagem de build do frontend; o projeto declara npm 11.13.0.
- PostgreSQL 17.6.
- Liquibase para migrations.
- Docker Compose, Nginx sem privilégios e imagens Linux Alpine.
- Spring Security, Spring Data JPA, OpenFeign, Spring Boot Actuator e Vitest.

## Executando o projeto com Docker — passo a passo

### 1. Instalar pré-requisitos

Instale Git e Docker Desktop. Em Windows, confirme antes que a edição do sistema é compatível com Docker Desktop e que a virtualização está habilitada no computador. Abra o PowerShell e verifique o WSL:

```powershell
wsl --status
```

Se o WSL 2 não estiver instalado, execute:

```powershell
wsl --install
```

Esse comando pode exigir um PowerShell executado como administrador e pode solicitar reinicialização. Baixe o Docker Desktop somente pelo site oficial: [Docker Desktop](https://www.docker.com/products/docker-desktop/).

Durante a instalação, selecione o mecanismo WSL 2 quando essa opção estiver disponível. Abra o Docker Desktop, aceite a configuração inicial e aguarde o Docker Engine ficar ativo. Em **Settings > General**, confirme **Use the WSL 2 based engine**, quando a opção for aplicável. Kubernetes não é necessário para este projeto.

Valide a instalação com:

```powershell
docker run --rm hello-world
docker --version
docker compose version
git --version
```

O primeiro comando deve baixar ou executar a imagem de teste e exibir uma mensagem de sucesso; os demais devem informar as versões instaladas, sem necessidade de coincidir com números fixos deste README.

### 2. Clonar os três repositórios

Como a topologia atual não possui submódulos registrados, clone os projetos irmãos na estrutura abaixo:

```powershell
git clone https://github.com/souzaadriano28-sudo/gestao-acoes-specs.git gestao-acoes
Set-Location gestao-acoes
git clone https://github.com/souzaadriano28-sudo/gestao-acoes-spring.git gestao-acoes-spring
git clone https://github.com/souzaadriano28-sudo/gestao-acoes-ui.git gestao-acoes-ui
git submodule status
```

O último comando não deve listar submódulos neste estado do projeto. Se `gestao-acoes-spring` ou `gestao-acoes-ui` estiver ausente, o Compose não encontrará seu contexto de build; execute o clone correspondente novamente.

> Caso a topologia seja convertida para submódulos no futuro, o clone correto passará a usar `git clone --recurse-submodules ...` e `git submodule update --init --recursive`. Esses comandos não são necessários para a topologia atual.

### 3. Preparar o ambiente

Há um arquivo de exemplo na raiz. Crie o arquivo local sem publicar seu conteúdo:

```powershell
Copy-Item .env.example .env
```

O arquivo `.env` não deve ser versionado. As variáveis presentes no exemplo são:

| Variável | Uso | Situação no Compose |
| --- | --- | --- |
| `DB_NAME` | Nome do banco PostgreSQL. | Opcional, possui padrão. |
| `DB_USERNAME` | Usuário do banco. | Opcional, possui padrão. |
| `DB_PASSWORD` | Senha do banco. | Obrigatória. |
| `BRAPI_TOKEN` | Credencial para cotações BRAPI. | Obrigatória. |
| `TWELVEDATA_API_KEY` | Credencial para cotações Twelve Data. | Obrigatória. |
| `ADMIN_INITIAL_USERNAME` | Usuário administrativo inicial. | Obrigatória. |
| `ADMIN_INITIAL_PASSWORD` | Senha administrativa inicial. | Obrigatória. |
| `AUTH_MAX_ATTEMPTS` | Limite de tentativas de autenticação. | Opcional, possui padrão. |
| `AUTH_ATTEMPT_WINDOW` | Janela das tentativas. | Opcional, possui padrão. |
| `AUTH_LOCK_DURATION` | Duração do bloqueio temporário. | Opcional, possui padrão. |
| `SESSION_IDLE_TIMEOUT` | Tempo de inatividade da sessão. | Opcional, possui padrão. |
| `SESSION_COOKIE_SECURE` | Marca Secure do cookie de sessão. | Opcional, possui padrão. |
| `FRONTEND_PORT` | Porta local do frontend. | Opcional, padrão `4200`. |

Nunca copie valores de `.env` para o README, commits, logs ou issues.

### 4. Validar a configuração

```powershell
docker compose --env-file .env config
```

Esse comando valida a composição e interpola as variáveis, mas não inicia os containers. Corrija qualquer mensagem de variável obrigatória ausente antes de continuar. Como a saída pode conter segredos interpolados, não a publique.

### 5. Construir e iniciar

```powershell
docker compose --env-file .env up -d --build
```

`--build` constrói as imagens e `-d` mantém os serviços em segundo plano. Na primeira execução, o processo pode demorar. O backend aplica automaticamente as migrations Liquibase e o PostgreSQL usa o volume nomeado `postgres_data`.

### 6. Acompanhar o estado e os logs

```powershell
docker compose --env-file .env ps
docker compose --env-file .env logs --tail 100 frontend
docker compose --env-file .env logs --tail 100 backend
docker compose --env-file .env logs --tail 100 postgres
```

Os serviços reais são `frontend`, `backend` e `postgres`; todos possuem healthcheck no Compose. Aguarde o estado saudável antes de considerar o ambiente pronto.

### 7. Acessar a aplicação

- Frontend: `http://127.0.0.1:4200` por padrão, ou a porta definida em `FRONTEND_PORT`.
- Health do frontend: `http://127.0.0.1:4200/health`.
- API: acessada pelo navegador sob o prefixo relativo `/api`, encaminhado pelo Nginx ao backend.

O Compose principal não publica portas do backend ou do PostgreSQL no host. O endpoint de readiness do backend é usado internamente pelo healthcheck: `/actuator/health/readiness`.

### 8. Parar e retomar sem perder dados

Para parar preservando containers e volume:

```powershell
docker compose --env-file .env stop
```

Para retomar:

```powershell
docker compose --env-file .env start
```

`stop`/`start` preservam os containers. `up -d` também inicia o que estiver parado e cria apenas o que faltar.

### 9. Reconstruir somente um serviço

```powershell
docker compose --env-file .env up -d --build frontend
docker compose --env-file .env up -d --build backend
```

Esses comandos não precisam recriar o PostgreSQL para alterações isoladas de frontend ou backend.

### 10. Cuidados com dados

Não use `docker compose down -v` durante o uso normal: `-v` remove volumes e pode apagar dados locais. Faça backup antes de qualquer remoção de volume. Não utilize comandos destrutivos como diagnóstico genérico.

### 11. Solução de problemas

| Situação | Diagnóstico seguro |
| --- | --- |
| Docker Desktop não iniciado | Abra o Docker Desktop, aguarde o daemon e repita `docker compose --env-file .env ps`. |
| Porta ocupada | Altere somente `FRONTEND_PORT` no `.env` e suba novamente o frontend. |
| Variável ausente | Execute `docker compose --env-file .env config` e preencha a variável indicada. |
| Diretório de projeto ausente | Confira a estrutura de clones da etapa 4; o Compose precisa dos dois diretórios irmãos. |
| Container unhealthy | Consulte `docker compose --env-file .env logs --tail 100 <serviço>` antes de recriar qualquer coisa. |
| Frontend com build antigo | Reconstrua apenas o frontend com `up -d --build frontend`. |
| Provedor externo indisponível | Mantenha os dados persistidos; o sistema informa a disponibilidade ou desatualização da cotação. |

## Execução local para desenvolvimento

O desenvolvimento local requer PostgreSQL acessível e variáveis fornecidas pelo ambiente. O Spring não lê o arquivo `.env` automaticamente fora do Compose. No Compose, `DB_URL` é montada para apontar ao serviço `postgres`; fora dele, informe `DB_URL`, `DB_USERNAME` e `DB_PASSWORD` para o PostgreSQL local ou remoto desejado. Para usar integrações reais, também forneça `BRAPI_TOKEN`, `TWELVEDATA_API_KEY`, `ADMIN_INITIAL_USERNAME` e `ADMIN_INITIAL_PASSWORD` pelo ambiente.

### Backend

```powershell
Set-Location gestao-acoes-spring
mvn.cmd spring-boot:run
```

O backend utiliza as propriedades de conexão `DB_URL`, `DB_USERNAME` e `DB_PASSWORD`; no perfil com integrações reais, também são necessárias as credenciais e configurações de autenticação previstas em `application.properties`.

### Frontend

```powershell
Set-Location gestao-acoes-ui
npm.cmd ci
npm.cmd start
```

O servidor Angular usa `proxy.conf.json`: chamadas `/api` são encaminhadas para `http://127.0.0.1:8080` durante o desenvolvimento local.

## Testes e builds

### Backend

```powershell
Set-Location gestao-acoes-spring
mvn.cmd test
mvn.cmd -DskipTests package
```

### Frontend

```powershell
Set-Location gestao-acoes-ui
npm.cmd ci
npm.cmd test -- --watch=false
npm.cmd run build
```

`npm.cmd ci` instala exatamente as versões registradas em `package-lock.json`, tornando a instalação reproduzível em um clone limpo.

Na validação final do projeto, o backend possui 142 testes aprovados e o frontend possui 145 testes aprovados em 24 arquivos de spec.

## Fontes de dados e moedas

- **BRAPI:** cotações de ativos brasileiros.
- **Twelve Data:** cotações de ativos americanos.
- **Banco Central — PTAX:** conversão USD/BRL quando há uma observação utilizável.

Cada informação pode conter hora de referência (o dado no provedor) e hora de coleta (quando foi obtida). O sistema diferencia disponível, desatualizado e indisponível. Quando não há câmbio utilizável, valores nativos em BRL e USD permanecem separados; não existe taxa fixa nem conversão inventada.

## API

A API é organizada pelos grupos abaixo:

- Autenticação: `/auth`.
- Ações: `/acoes`.
- Corretoras: `/corretoras`.
- Operações históricas: `/operacoes`.
- Carteira e Dashboard: `/carteira`.

O frontend utiliza `/api` como prefixo público e o Nginx remove esse prefixo ao encaminhar ao backend. Consulte o código dos resources para a documentação completa de cada operação.

## Banco e Liquibase

Liquibase aplica migrations automaticamente no início do backend; o Hibernate permanece em modo de validação do schema. No Compose, os dados PostgreSQL são persistidos no volume `postgres_data`.

Migrations já aplicadas não devem ser editadas. O ledger de operações preserva compras e vendas históricas, recalcula posições em ordem cronológica e persiste o resultado realizado de cada venda.

## Segurança

- Sessões autenticadas são mantidas pelo cookie `ATLAS_SESSION`, com `HttpOnly` e `SameSite=Lax`.
- Requisições mutáveis usam proteção CSRF com o cabeçalho `X-CSRF-TOKEN`.
- Leituras e mutações de ativos, corretoras, operações e posições são limitadas ao proprietário autenticado.
- Segredos são fornecidos por variáveis de ambiente; `.env` não deve ser versionado.

## Roteiro de demonstração

1. Autentique-se no sistema.
2. Consulte e cadastre um ativo.
3. Cadastre uma corretora.
4. Registre uma compra e revise a prévia antes de confirmar.
5. Visualize quantidade, preço médio e custo na Carteira.
6. Compre o mesmo ativo por outra corretora e confirme as posições separadas.
7. Cadastre e compre um ativo americano para demonstrar BRL e USD separados.
8. Tente vender quantidade maior que o saldo e observe a rejeição.
9. Atualize as cotações no Dashboard.
10. Confira que o histórico mostra as operações mais recentes primeiro.
11. Abra as fontes de dados do Dashboard e observe provedores, referência e disponibilidade.

## Limitações conhecidas

- Cotações, cadastro de empresas e conversão cambial dependem de provedores externos.
- A conversão USD/BRL pode ficar indisponível; nesse caso, os valores permanecem separados por moeda.
- O sistema não envia ordens ao mercado.

## Estrutura de diretórios

```text
gestao-acoes/
├── compose.yaml                 # Integra frontend, backend e PostgreSQL
├── .env.example                 # Nomes das variáveis de ambiente
├── README.md                    # Documentação de integração
├── gestao-acoes-spring/         # Backend Spring Boot e Liquibase
└── gestao-acoes-ui/             # Frontend Angular
```

## Fluxo Git dos projetos irmãos

1. Faça commit e push primeiro no repositório alterado (`gestao-acoes-spring` ou `gestao-acoes-ui`).
2. Versione na raiz apenas arquivos que pertençam à raiz, como `compose.yaml` e `README.md`.
3. Para uma nova máquina, replique os três clones da etapa de instalação.

Não há, na topologia atual, um ponteiro de submódulo para atualizar na raiz. Converter esses repositórios em submódulos exigiria uma mudança Git explícita, fora do escopo desta documentação.

## Informações acadêmicas

Integrantes identificados na documentação existente do projeto: Adriano Alves, Breno Rogerio e Vinicius Oliveira.
