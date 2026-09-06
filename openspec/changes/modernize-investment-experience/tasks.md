## 0. Predecessora de segurança

- [ ] 0.1 Confirmar que `add-secure-admin-authentication` foi implementada, testada estritamente e integrada aos três containers antes de alterar o Dashboard; verificar login, sessão, CSRF, rotas protegidas e logout em E2E.

## 1. Contract baselines and decisions

- [x] 1.1 Capture JSON contract fixtures for every existing action, broker, position, balance, buy and sell endpoint and verify current backend contract tests pass unchanged.
- [x] 1.2 Define JSON schemas/examples for dashboard, detailed positions, movements, quote provenance, exchange provenance and availability states; verify every IU/PR field maps to a backend-owned value.
- [x] 1.3 Decide and document the exchange-rate source, reference semantics, freshness window and outage behavior; verify the decision satisfies PR-01/04 without a fixed hidden rate.
- [x] 1.4 Define the official CVM/BCB participant dataset integration, update cadence and evidence states; verify CNAE alone cannot produce `VERIFIED`.
- [x] 1.5 Record deprecation/compatibility policy for `/carteira/saldo-total`, `/carteira/posicoes` and `validadaNaCvm`; verify existing client fixtures remain accepted.

## 2. Database and domain metadata

- [x] 2.1 Add an additive Liquibase changeset for quote provenance and verify fresh PostgreSQL migration plus rollback in the migration test.
- [x] 2.2 Add additive storage for exchange-rate provenance/cache and verify precision, pair, source and timestamps round-trip in PostgreSQL.
- [x] 2.3 Add structured broker regulatory evidence without deleting the legacy boolean and verify existing rows migrate to `NOT_CHECKED`, never `VERIFIED`.
- [x] 2.4 Extend transaction/query indexes for deterministic date/id pagination and filters; verify the PostgreSQL query plan avoids a full unbounded client read on representative fixtures.
- [x] 2.5 Add domain value objects/enums for availability and provenance and verify unit tests reject missing source, incompatible currency and invalid instants where availability is `AVAILABLE`.

## 3. Backend read models

- [x] 3.1 Implement the exchange-rate port and deterministic stub adapter; verify BRL/USD conversion tests cover current, stale, missing and invalid responses without external network.
- [x] 3.2 Remove the fixed 5,30 path from new consolidation logic and verify mixed-currency totals use only traceable rates with one final HALF_UP rounding.
- [x] 3.3 Implement detailed-position DTO/query calculations in native currency and verify cost, market value and result for BRL, USD and same asset in two brokers.
- [x] 3.4 Implement paginated movement query/filter DTOs and verify stable descending date/id order, empty page, invalid filters and legacy provenance absence.
- [x] 3.5 Implement dashboard aggregation with per-section availability and verify a missing quote/exchange makes dependent totals unavailable rather than partial or zero.
- [x] 3.6 Expose additive dashboard, detailed-position and movement endpoints and verify status codes, numeric JSON fields, ISO currency and UTC/offset timestamps in resource contract tests.
- [x] 3.7 Preserve legacy balance/position endpoints and verify the baseline fixtures from 1.1 still pass.
- [x] 3.8 Add cache/freshness handling for quotes and exchange rates and verify current, stale and unavailable boundaries with a controllable clock.

## 4. Broker evidence correction

- [x] 4.1 Separate business-registration mapping from regulatory evidence and verify active CNPJ/CNAE does not set an authorization claim.
- [x] 4.2 Implement a deterministic adapter/importer for the chosen official participant source and verify match by canonical CNPJ, category mapping, not-found and unavailable states.
- [x] 4.3 Expose evidence source and verification timestamp in broker DTOs while preserving legacy response compatibility; verify contract tests for old and new clients.
- [x] 4.4 Add scheduled/manual refresh behavior with stale handling and verify an old `VERIFIED` result is returned as `STALE` after the configured limit.
- [x] 4.5 Review logs and error envelopes for the new integrations and verify they contain no tokens, secret URLs, raw provider bodies or personal data not required by the flow.

## 5. Frontend foundations and components

- [ ] 5.1 Create design tokens, global typography, spacing, focus and color styles from the design and verify automated contrast plus forced-colors/reduced-motion snapshots.
- [ ] 5.2 Implement the responsive `AppShell`, skip link, desktop rail, mobile navigation and 404 route; verify route-active semantics and keyboard access in component tests.
- [ ] 5.3 Add typed API models/services for new read endpoints and verify HttpTestingController tests cover URL, params, payload shapes, optional fields and error envelopes.
- [ ] 5.4 Implement discriminated async state/facade primitives and verify unit tests prevent simultaneous empty/error/loading states and never retry mutations automatically.
- [ ] 5.5 Implement `CurrencyValue`, `PercentageValue` and `DateTimeValue` components/utilities and verify pt-BR, BRL/USD, signs, unavailable values, offset timestamps and legacy no-timezone labels.
- [ ] 5.6 Implement `SummaryCard`, `StatusBadge`, `DataStatus` and `QuoteProvenance` and verify positive/negative meaning is available without color and source/instants are exposed.
- [ ] 5.7 Implement `AsyncRegion`, skeleton, empty state, stale state, error summary and toast/live region; verify announcements, retry-read behavior and layout-space reservation.
- [ ] 5.8 Implement shared semantic table and mobile row-card pattern plus pagination; verify header associations, labels, long content and no loss of essential fields at 320 px.
- [ ] 5.9 Implement hover, focus-visible, active, disabled, invalid and pending tokens for interactive components and verify contrast plus keyboard equivalence in component snapshots.

## 6. Dashboard and portfolio pages

- [ ] 6.1 Implement `/dashboard` facade/page using only its read model and verify no financial metric is calculated from independent frontend lists.
- [ ] 6.2 Build dashboard summary cards with conditional availability and verify zero, unavailable and positive/negative values are distinguishable.
- [ ] 6.3 Build dashboard position preview, recent movements and source-status sections and verify links reach full Carteira/Operações views with preserved context.
- [ ] 6.4 Implement `/carteira` filters and detailed position table/mobile cards and verify same-ticker positions remain separated by broker.
- [ ] 6.5 Add loading, empty, partial failure, stale and full error cases to both pages and verify each state with component fixtures and visual snapshots.
- [ ] 6.6 Keep the operation form exclusively on `/operacoes` and verify the Dashboard exposes only a proportionate navigation CTA in desktop, tablet and mobile snapshots.

## 7. Actions and brokers pages

- [ ] 7.1 Refactor `/acoes` into typed form, table and facade while preserving current API behavior; verify canonical ticker/market errors, duplicate submit protection and quote update states.
- [ ] 7.2 Show quote currency, reference/fetch time, source and freshness on action rows and verify legacy source absence reads “Origem não informada”.
- [ ] 7.3 Refactor `/corretoras` into typed form, table/mobile cards and facade; verify CNPJ/CEP errors, optional field omission and duplicate submit protection.
- [ ] 7.4 Present business status separately from regulatory evidence and verify no legacy boolean or CNAE renders as “autorizada pela CVM”.
- [ ] 7.5 Verify action and broker empty/error/stale/success states and keyboard/focus behavior in component tests.

## 8. Simulated operations

- [ ] 8.1 Implement `/operacoes` with typed buy/sell form and backend-derived market/broker choices; verify only ticker, canonical market, integer quantity and broker id are submitted.
- [ ] 8.2 Add accessible review step with explicit academic/no-order wording and verify no guaranteed price, execution, liquidation or custody claim appears.
- [ ] 8.3 Enforce one pending submission and no optimistic financial update; verify repeated click/type change sends exactly one request and preserves displayed positions until reread.
- [ ] 8.4 Handle success, business refusal, 409 conflict and unknown network outcome separately; verify field preservation, announcements and reconciliation-first actions.
- [ ] 8.5 Implement paginated/filterable movement table and mobile cards and verify purchase/sale, ticker, broker, quantity, native price/currency and date remain available.
- [ ] 8.6 Verify full/partial sale and successive purchase UI outcomes against deterministic backend fixtures, including unchanged average price on sale and history preservation.

## 9. Accessibility and responsive verification

- [ ] 9.1 Add automated accessibility checks to every route and major async/form state and verify no detectable WCAG 2.2 A/AA violations remain.
- [ ] 9.2 Complete a keyboard-only audit for navigation, filters, pagination, quote update and operation; verify logical focus, visible/unobscured focus and no keyboard trap.
- [ ] 9.3 Complete screen-reader checks for landmarks, headings, tables/mobile cards, field errors, pending/success/error/unknown announcements and verify results in a recorded checklist.
- [ ] 9.4 Verify 200% zoom, text spacing and reflow at 320×568, 390×844, 768×1024 and 1440×1024 with long Portuguese labels and values.
- [ ] 9.5 Verify pointer targets, contrast for all themes/states and that positive/negative/unavailable meaning survives grayscale and forced-colors mode.

## 10. E2E, three-container execution and delivery evidence

- [ ] 10.1 Extend provider stubs with quote/exchange/evidence success, stale, rate-limit, invalid and unavailable fixtures and verify tests make no real financial-network request.
- [ ] 10.2 Add desktop E2E for first-use empty state, broker/action registration, simulated purchase, dashboard, portfolio, history and simulated sale; verify exact deterministic values and sources.
- [ ] 10.3 Add mobile E2E for the same journey plus navigation and responsive table alternatives; verify no page-level horizontal overflow at 390 px and 320 px.
- [ ] 10.10 Add authenticated tablet E2E at 768×1024 and verify compact navigation, two-column cards, readable tables, unobscured focus and absence of overlap.
- [ ] 10.4 Add E2E for stale data, partial failure, exchange unavailable, 409 conflict and unknown mutation outcome; verify retry never resends the original mutation.
- [ ] 10.5 Run non-interactive frontend build/unit suite and backend Maven unit/integration suite; verify both exit successfully without skipped tests hiding regressions.
- [x] 10.6 Run PostgreSQL concurrency tests for simultaneous first buys, contested sales and lock timeout; verify exact transaction/position outcomes remain compliant with TI-06.
- [ ] 10.7 Build and start exactly `postgres`, `backend` and `frontend`, wait for all healthchecks, run desktop/mobile Playwright through Nginx `/api`, and verify the isolated stack succeeds with simulated providers.
- [ ] 10.8 Record screenshots, accessibility checklist, contract examples and test commands/results; verify the academic disclaimer and demonstrative-data labels are visible in all approval artifacts.
- [ ] 10.9 Run `openspec validate --change modernize-investment-experience --strict --no-interactive` after implementation and verify zero errors/warnings before requesting archive review.
