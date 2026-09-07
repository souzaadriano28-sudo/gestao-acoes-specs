# Protótipo estático

Protótipo visual isolado da aplicação Angular. Todos os números, nomes de corretoras, cotações, resultados e datas mostrados são demonstrativos e não representam dados reais, recomendação ou ordem executável.

- `index.html`: uma composição responsiva original do Dashboard.
- `states.html`: catálogo estático de carregamento, vazio, erro, dados parciais, sucesso, foco, validação e confirmação.
- `dashboard-desktop-1440x1024.png`: viewport desktop.
- `dashboard-tablet-768x1024.png`: viewport tablet com rail compacto.
- `dashboard-mobile-390x844.png`: viewport de celular.
- `dashboard-states-1440x1024.png`: catálogo visual dos estados.
- `render.mjs`: renderização determinística com o Playwright já instalado no projeto frontend.

Para renderizar novamente a partir da raiz:

```powershell
node openspec/changes/modernize-investment-experience/prototype/render.mjs
```
