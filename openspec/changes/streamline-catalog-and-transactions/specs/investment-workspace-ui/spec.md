## ADDED Requirements

### Requirement: IU-13 Cadastros explícitos e revisáveis
Telas de Corretoras e Ações SHALL permanecer acessíveis e apresentar consultar, revisar e confirmar como estados separados, com campos alinhados, cancelamento, nova tentativa e prevenção de duplo envio. Operações SHALL aceitar somente ativos já cadastrados.

#### Scenario: Estado invalidado após edição
- **WHEN** usuário altera CNPJ, CEP, ticker ou mercado depois de consultar
- **THEN** confirmação volta a ser bloqueada até nova consulta válida.

#### Scenario: Cadastro americano cancelável
- **WHEN** consulta demora
- **THEN** usuário pode cancelar sem criação e tentar novamente de forma explícita.
