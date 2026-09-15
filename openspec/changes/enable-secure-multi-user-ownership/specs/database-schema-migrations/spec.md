## ADDED Requirements

### Requirement: Migração de propriedade compatível com bancos suportados
Changesets de propriedade SHALL executar e ser testados em H2 e PostgreSQL sem apagar dados atuais. Compatibilidade MySQL executável SHALL permanecer um gate documental até confirmação do enunciado.

#### Scenario: Paridade do backfill
- **WHEN** a migração roda sobre fixtures equivalentes em H2 e PostgreSQL
- **THEN** ambas produzem o mesmo proprietário legado, constraints e contagens reconciliadas.
