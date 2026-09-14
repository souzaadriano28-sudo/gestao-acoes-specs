## ADDED Requirements

### Requirement: CI-04 Descoberta e fallback validados
Busca SHALL aceitar ticker ou nome e retornar ticker, empresa, bolsa, país, mercado e moeda. Seleção SHALL preencher identidade automaticamente; fallback manual SHALL preservar ticker+mercado e passar pelas mesmas regras canônicas e de duplicidade.

#### Scenario: Mesmo ticker no mesmo mercado
- **WHEN** usuário tenta cadastrar forma equivalente de ativo já cadastrado em seu escopo
- **THEN** recebe conflito de duplicidade e o registro existente é preservado.

#### Scenario: Busca sem resultado
- **WHEN** nenhum item corresponde ao texto
- **THEN** a interface oferece entrada manual sem afirmar que o ticker é inexistente antes da consulta.
