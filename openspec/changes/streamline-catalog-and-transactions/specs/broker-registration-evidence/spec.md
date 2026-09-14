## ADDED Requirements

### Requirement: BR-04 CVM bloqueante no cadastro
Nova corretora SHALL ser persistida somente se BrasilAPI confirmar empresa ativa e o cadastro oficial CVM confirmar o mesmo CNPJ ativo em categoria compatível. CNAE `6612601`, `6612602` ou `6431900` SHALL ser complementar e MUST NOT substituir, contradizer ou relaxar a validação CVM.

#### Scenario: CNAE aceito e CVM ausente
- **WHEN** empresa ativa possui CNAE historicamente aceito, mas CNPJ não consta ativo na categoria CVM compatível
- **THEN** o cadastro é bloqueado e nenhum registro é criado.

#### Scenario: Empresa inativa
- **WHEN** BrasilAPI informa situação empresarial inativa
- **THEN** o cadastro é bloqueado antes da confirmação, independentemente de CNAE.

#### Scenario: Categoria incompatível
- **WHEN** CNPJ consta ativo na CVM em categoria fora da lista aprovada
- **THEN** o cadastro é bloqueado com explicação objetiva e sem inferência por CNAE.

### Requirement: BR-05 Autorização posterior
Corretora já usada SHALL permanecer no histórico se sua evidência CVM vencer ou perder autorização, mas MUST NOT ser aceita em nova compra ou venda até voltar a estado ativo e compatível.

#### Scenario: Autorização perdida
- **WHEN** refresh oficial muda uma corretora histórica para inativa, incompatível ou não encontrada
- **THEN** histórico e posições permanecem visíveis e novos lançamentos por ela são bloqueados.
