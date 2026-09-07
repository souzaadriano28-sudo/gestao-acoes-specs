## Context

Veja `proposal.md` para a motivação. A auditoria foi executada sobre os commits integrados dos três repositórios, em Compose com exatamente Angular/Nginx, Spring Boot e PostgreSQL 17, usando provedores locais controlados e dados identificados como simulação. Foram inspecionados login, cinco rotas autenticadas, 404, sessão expirada e estados assíncronos em 1440, 768, 720, 390 e 320 px.

A base atual já preserva autenticação, CSRF, landmarks, foco visível, movimento reduzido, contratos financeiros e reflow sem overflow. O problema é de apresentação: oito títulos/subtítulos no Dashboard, proveniência com peso excessivo, navegação com letras no lugar de ícones, repetição do aviso acadêmico, formulários extensos e densidade móvel pouco seletiva. O relatório completo está em `audit/report.md` e a rastreabilidade em `audit/matrix.md`.

## Goals / Non-Goals

**Goals:**

- Aumentar a percepção de produto real com uma identidade Atlas reconhecível e sóbria.
- Fazer o resumo financeiro ser compreendido em poucos segundos, inclusive quando parcial ou stale.
- Reduzir altura, repetição e carga cognitiva sem remover informação contratual.
- Manter equivalência funcional e acessível entre desktop, tablet, celular e 320 px.
- Implementar com CSS, templates e componentes existentes, sem nova biblioteca.

**Non-Goals:**

- Alterar endpoints, regras financeiras, autenticação, sessão, CSRF, Liquibase ou integrações.
- Criar gráficos, séries históricas, dividendos, caixa, impostos, metas ou recomendações.
- Copiar layout, texto, cores, ícones ou marca de Investidor10, Status Invest ou outro produto.
- Reestruturar a arquitetura Angular além do necessário para componentes visuais reutilizáveis.

## Decisions

### 1. Direção “finanças editoriais calmas”

O Atlas manterá navy e azul como reconhecimento, acrescentando superfícies quentes muito claras, verde mineral e âmbar funcional. Títulos continuarão fortes, mas valores usarão números tabulares e uma família sans-serif disponível no sistema. Um motivo cartográfico/contorno sutil aparecerá somente em marca e cartão principal.

**Por quê:** preserva a identidade construída, reduz aparência de template SaaS azul e evita a exuberância visual inadequada a dados incompletos. **Alternativas rejeitadas:** tema escuro integral, gradientes promocionais e imitação de dashboards concorrentes.

### 2. Dashboard com uma métrica hero e três métricas compactas

Patrimônio estimado será a âncora visual. Custo, resultado não realizado e posições ativas formarão um grupo comparável. Abaixo, posições e movimentações terão prioridade; “Qualidade dos dados” vira uma faixa-resumo expansível. Nenhum cálculo muda e nenhum gráfico é incluído.

**Por quê:** cria ponto de entrada claro e usa somente campos reais existentes. **Alternativa rejeitada:** quatro cartões idênticos, que atribuem o mesmo peso a grandezas diferentes.

### 3. Proveniência em duas camadas

Estado e impacto ficam sempre visíveis; provedor, referência e coleta ficam em `details/summary` acessível. Em falha, a camada resumida informa exatamente qual valor não pode ser concluído. Em sucesso, apresenta uma frase curta de atualização.

**Por quê:** mantém rastreabilidade sem transformar metadados técnicos no principal conteúdo visual. **Alternativa rejeitada:** ocultar totalmente a origem ou mantê-la em três cartões permanentes.

### 4. Densidade por tarefa e divulgação progressiva

Filtros com quatro ou mais campos serão recolhíveis em celular e poderão ser mais compactos no desktop. Operações terá formulário primeiro e histórico depois no mobile; no desktop, formulário e atividade recente poderão dividir a primeira dobra. Textos auxiliares serão reduzidos a uma sentença e detalhes permanecerão associados aos controles.

**Por quê:** a página atual de Operações tem 26–27 controles e uma rolagem muito longa no celular. **Alternativa rejeitada:** esconder funcionalidades ou criar uma nova rota de filtro.

### 5. Iconografia local e semântica

As letras D/C/A/R/O serão substituídas por SVGs locais de traço coerente: visão geral, carteira, ativo, instituição e operação. Ícones decorativos terão `aria-hidden`; ações sem rótulo visível não serão introduzidas.

**Por quê:** melhora reconhecimento e personalidade sem dependência externa. **Alternativa rejeitada:** instalar biblioteca completa de ícones para cinco símbolos.

### 6. Estados como componentes de uma mesma família

Loading, vazio, erro, parcial, stale, indisponível, sessão expirada e 404 compartilharão espaçamento, símbolo, título, texto curto e ação. Stale e parcial usarão faixas compactas; erro total mantém maior presença. A semântica ARIA atual permanece.

**Por quê:** hoje os estados são corretos, mas variam de cartões amplos a banners extensos. **Alternativa rejeitada:** toasts efêmeros para falhas de leitura, inadequados à persistência do problema.

### 7. Login orientado ao acesso

No desktop, o painel de marca será reduzido e o formulário ganhará maior largura útil. No celular, marca, contexto curto e formulário aparecem antes da narrativa. Os textos de segurança e finalidade serão consolidados, sem remover o aviso de sessão HttpOnly nem o caráter acadêmico.

**Por quê:** o login atual tem boa aparência, mas grande área vazia e cinco mensagens que competem com a ação principal.

### 8. Validação por comparação, não por pixel perfeito

Testes verificarão hierarquia, ordem do DOM, visibilidade de estados, disclosure acessível, ausência de overflow/conteúdo encoberto, foco, contraste e screenshots representativos. Capturas serão revisadas nas cinco larguras, com tolerância visual definida pela ferramenta existente.

**Por quê:** critérios estruturais sobrevivem a pequenas diferenças de renderização; pixel perfect isolado produz falsos positivos.

## Risks / Trade-offs

- [Divulgação progressiva esconder informação importante] → estado/impacto permanecem visíveis e o detalhe recebe nome acessível, teclado e testes.
- [Compactação reduzir alvos ou legibilidade] → manter mínimo WCAG de 24 px, alvo confortável de 44 px nas ações primárias e validar 320 px/200%.
- [Cartão hero sugerir precisão excessiva] → preservar “estimado”, moeda, disponibilidade e instante de consolidação junto ao valor.
- [Novo ícone parecer decorativo ou ambíguo] → manter rótulo textual e validar reconhecimento com a revisão humana proposta.
- [Polimento espalhar CSS duplicado] → consolidar tokens e primitivas antes de adaptar páginas.
- [Escopo virar funcionalidade de produto] → qualquer proposta que exija dado inexistente volta para backlog separado e não entra nesta mudança.

## Migration Plan

1. Consolidar tokens e primitivas visuais sem mudar comportamento.
2. Atualizar shell e login preservando guard, sessão, CSRF e logout.
3. Aplicar hierarquia ao Dashboard e divulgação progressiva da qualidade.
4. Compactar Carteira e Operações; depois harmonizar Ações, Corretoras, 404 e estados.
5. Executar testes unitários, build, audit, Playwright/Axe e comparação visual em todos os viewports.
6. Publicar somente após aprovação visual; rollback é a reversão do commit Angular, pois não há migração de dados ou contrato.

## Decisões aprovadas em revisão

- Direção visual “finanças editoriais calmas”.
- Patrimônio estimado em hero navy sólido.
- Qualidade recolhida quando tudo estiver correto e expandida quando houver impacto, mantendo estado geral e horário no resumo.
- Cinco ícones SVG locais próprios, consistentes e acompanhados dos respectivos rótulos acessíveis.
