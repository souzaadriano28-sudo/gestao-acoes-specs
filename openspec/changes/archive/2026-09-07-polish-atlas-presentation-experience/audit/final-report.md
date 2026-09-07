# Evidência final de implementação

## Resultado

A implementação segue a direção aprovada de “finanças editoriais calmas”: fundo papel, navy estrutural, azul apenas para ação, verde/âmbar/vermelho acompanhados de texto e símbolos, números tabulares e superfícies com hierarquia discreta. O Angular continua consumindo os contratos existentes e nenhum cálculo ou dado financeiro novo foi introduzido.

## Comparação com os protótipos

| Tela | Resultado final | Desvio justificado |
| --- | --- | --- |
| Login | Marca, contexto curto, campos e CTA aparecem na primeira dobra; segurança fica em disclosure | A implementação preserva mensagens reais de preparação, erro e sessão expirada, ausentes no protótipo estático |
| Dashboard | Patrimônio hero navy, três métricas compactas, duas coleções e qualidade em faixa recolhível | Os cartões móveis mantêm campos reais de posição e as cinco movimentações retornadas, por isso são mais altos que o protótipo abreviado |
| Carteira | Filtros compactos, tabela numérica no desktop e cartões equivalentes no mobile | A tabela preserva todos os campos contratuais e pode exigir mais largura interna que a representação estática, sem overflow da viewport |
| Operações | Formulário precede o histórico no mobile; filtros avançados são recolhíveis | Confirmação, conflito e reconciliação reais permanecem no fluxo e não foram simulados visualmente no protótipo |
| Ações e Corretoras | Cadastro e lista compartilham a primeira dobra no tablet e usam a mesma família de controles/estados | As evidências regulatórias reais foram preservadas integralmente, ainda que não aparecessem nos protótipos prioritários |

Não foi buscada equivalência pixel a pixel. As diferenças preservam funcionalidade, acessibilidade e conteúdo real.

## Evidência automatizada

- Angular: 22 arquivos de teste, 87 testes aprovados.
- Build de produção: aprovado; bundle inicial de 442,99 kB (105,40 kB estimados transferidos).
- Dependências: `npm audit --audit-level=low`, zero vulnerabilidades.
- Playwright local: 7/7; jornada principal, mobile, parcial/stale, 409/resultado desconhecido, teclado e reflow.
- Axe: zero violações nos pontos auditados.
- Viewports: 1440×1024, 768×1024, 720×900, 390×844 e 320×568, sem overflow horizontal.
- Zoom/reflow: 200% nas larguras representativas, sem perda de conteúdo.
- Navegação inferior: caixas delimitadoras comparadas com cada elemento interativo visível; zero sobreposições. Ao focar um controle, a barra recolhe inclusive para teclado virtual e respeita safe area.
- Movimento reduzido e cores forçadas: aprovados no cenário dedicado.

## Sistema containerizado

Foram construídas as imagens locais e iniciados exatamente três serviços isolados: Angular/Nginx, Spring Boot e PostgreSQL 17. Todos ficaram `healthy`. A jornada principal passou pelo proxy same-origin, autenticou, enviou CSRF, cadastrou ativos e corretora, registrou compras e vendas e releu as posições.

Após reiniciar o backend, o PostgreSQL manteve 7 movimentações (7 antes e 7 depois), o backend voltou a `healthy`, o Nginx respondeu `/health` com HTTP 200 e o Liquibase informou 9 changesets previamente executados e banco atualizado.

Seis cenários de browser aplicáveis à imagem produtiva passaram. O único cenário não aplicável usa o cabeçalho `X-Atlas-E2E-Fault: conflict`, aceito exclusivamente pelo launcher de testes para fabricar HTTP 409; a imagem produtiva corretamente o ignora. A reconciliação de 409 e resultado desconhecido foi comprovada na suíte local 7/7, sem reenvio da mutação e sem sucesso falso.

## Inspeção

As capturas finais em `audit/final/` foram comparadas visualmente com `audit/current/` e `prototype/screenshots/`. Foram verificados login, cinco rotas autenticadas, 404, sessão expirada e estados vazio, erro, parcial e stale. As imagens e Dockerfiles não contêm credenciais; as credenciais do Compose existiram apenas como variáveis do processo. Não há biblioteca nova, fixture sintética em código de produção, estilo inline em template, gráfico ou métrica sem contrato.
