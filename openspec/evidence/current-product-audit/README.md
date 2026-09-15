# Auditoria somente leitura da pilha atual

## Escopo e segurança

Auditoria realizada em 2026-09-07 contra `http://127.0.0.1:4200`, usando os três containers existentes e os dados já cadastrados. O procedimento não envia mutações ao backend, não apaga dados e não registra usuário, senha, cookie ou token CSRF. O nome da conta é substituído por “Conta de inspeção” antes das capturas.

`capture-readonly.cjs` visita login, Corretoras, Ações, Operações e Dashboard. A revisão de compra é apenas uma transição local do formulário. A captura do estado de espera do ativo americano intercepta o POST no navegador e o aborta antes de alcançar o Nginx; portanto, ela demonstra o comportamento da interface sob latência, não cria ativo e não pretende substituir a falha real registrada nos logs.

Para repetir com a pilha já ativa, defina `AUDIT_BASE_URL`, `AUDIT_USERNAME` e `AUDIT_PASSWORD` somente no ambiente do processo e execute:

```powershell
node openspec\evidence\current-product-audit\capture-readonly.cjs
```

## Evidências observadas

| Evidência | Resultado reproduzível | Impacto |
| --- | --- | --- |
| [Corretoras desktop](captures/corretoras-1440x1024.png) | CNPJ inicia em `y=325,39` e CEP em `y=353,38`: desalinhamento vertical de aproximadamente 28 px causado pelo texto auxiliar existente somente no primeiro campo e pelo alinhamento inferior do toolbar. | O formulário parece quebrado e reduz confiança. |
| [Corretoras mobile](captures/corretoras-390x844.png) | Inputs ocupam alturas medidas diferentes e a navegação fixa atravessa a região do formulário; a razão social real de 71 caracteres domina o cartão. | Primeiro cadastro é cansativo e conteúdo importante perde hierarquia. |
| [Ações desktop](captures/acoes-1440x1024.png) | Ticker começa em `y=325,41` e Mercado em `y=353,39`, repetindo a diferença de aproximadamente 28 px. O usuário precisa digitar ticker canônico e escolher o mercado. | Exige conhecimento prévio e permite combinação incorreta. |
| [Ações mobile](captures/acoes-390x844.png) | A tela separa “Cadastrar ativo” e “Ativos monitorados”, expõe termos como “Origem”, “Coleta” e “freshness” e mantém muitos detalhes técnicos no nível principal. | Modelo mental administrativo e linguagem pouco compreensível. |
| [Espera controlada de ativo americano](captures/ativo-americano-espera-controlada-1440x1024.png) | Após 2,5 s a única resposta visual é “Consultando…”, sem etapa, prazo, cancelar ou fallback. | Uma integração lenta parece travamento. |
| Log real de 17:25 UTC | Nginx registrou `POST /api/acoes` com HTTP 503; a consulta local anterior ocorreu por volta de `17:25:08` e a resposta foi registrada em `17:25:14`. Não houve segundo ativo persistido. | Confirma falha real no caminho de cadastro; os logs seguros não identificam provedor/causa, dificultando diagnóstico. |
| [Operações desktop](captures/operacoes-1440x1024.png) | A tabela tem 833 px dentro de contêiner de 625 px e a razão social de 71 caracteres fragmenta a coluna. | Rolagem horizontal e densidade baixa. |
| [Operações mobile](captures/operacoes-390x844.png) | `documentScrollWidth=560` para viewport de 390 px; navegação fixa cruza a área de formulário. | Existe rolagem horizontal de página e risco de ação encoberta. |
| [Revisão sem preço](captures/operacoes-revisao-sem-preco-1440x1024.png) | A revisão mostra tipo, ativo, corretora e quantidade, mas substitui data, preço, moeda e total por “Consultado pelo backend; não garantido.” | O usuário confirma sem conhecer o valor financeiro do registro. |
| [Qualidade técnica](captures/dashboard-qualidade-tecnica-1440x1024.png) | A área principal usa “Fonte, referência, coleta e freshness”, razão interna `NOT_REQUIRED_FOR_SINGLE_CURRENCY_PORTFOLIO` e estado parcial apesar de o câmbio não ser necessário. | Linguagem técnica e sinal de indisponibilidade enganoso. |

As medições completas e o texto visível sanitizado estão em [metrics.json](captures/metrics.json).

## Diagnóstico técnico inicial

- Os layouts de Corretoras e Ações usam o mesmo grid e uma toolbar alinhada ao final; textos auxiliares assimétricos deslocam controles.
- O cadastro americano chama o provedor de cotação de forma síncrona antes de persistir. Há timeouts explícitos para BCB e CVM, mas não para o cliente Twelve Data na configuração atual. O HTTP 503 é coerente com falha/timeout externo, embora o log atual não permita atribuir a causa com certeza.
- A operação persiste `preco_unitario` e o histórico o retorna, porém o fluxo obtém o preço somente no envio final. A interface não tem data da operação, preço editável, moeda, total ou chave de idempotência.
- Ativo e corretora são cadastros globais; transação e posição não possuem proprietário. O usuário administrativo é singleton por restrição de banco.
- Venda total remove apenas a linha de posição e mantém transações, comportamento correto; a evolução deve preservar o ledger completo como fonte financeira.

## Estado preservado

No momento da auditoria havia 1 conta, 1 corretora, 1 ativo, 1 operação e 1 posição. Os containers `frontend`, `backend` e `postgres` permaneceram saudáveis. Nenhuma captura contém credenciais.
