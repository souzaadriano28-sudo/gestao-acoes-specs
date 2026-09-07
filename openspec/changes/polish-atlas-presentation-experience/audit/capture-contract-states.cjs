const { chromium } = require('../../../../gestao-acoes-ui/node_modules/@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');

const baseURL = process.env.AUDIT_BASE_URL;
const username = process.env.AUDIT_USERNAME;
const password = process.env.AUDIT_PASSWORD;
if (!baseURL || !username || !password) throw new Error('Audit runtime variables are required.');
const outputDir = path.resolve(__dirname, 'current');
const viewport = { width: 1440, height: 1024 };

const clone = value => JSON.parse(JSON.stringify(value));
const unavailableMoney = (metric, reason) => ({ ...metric, availability: 'UNAVAILABLE', value: null, reason });
const unavailableProvenance = (source, reason) => ({ ...source, availability: 'UNAVAILABLE', rate: source.rate === undefined ? undefined : null, sourceType: null, provider: null, referenceAt: null, fetchedAt: null, referenceKind: null, reason });

async function login(page) {
  await page.goto(`${baseURL}/dashboard`);
  await page.getByLabel('Usuário').fill(username);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar com segurança' }).click();
  await page.waitForURL(/\/dashboard$/);
}

async function captureFixture(page, id, fixture) {
  await page.goto(`${baseURL}/acoes`);
  await page.route('**/api/carteira/dashboard', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture) }), { times: 1 });
  await page.goto(`${baseURL}/dashboard`);
  await page.waitForTimeout(300);
  await page.evaluate(auditUsername => {
    for (const element of document.querySelectorAll('body *')) {
      if (element.children.length === 0 && element.textContent?.trim() === auditUsername) {
        element.textContent = 'Conta de demonstração';
      }
    }
  }, username);
  const text = await page.locator('main').innerText();
  await page.screenshot({ path: path.join(outputDir, `${id}-1440x1024.png`), fullPage: true });
  await page.unroute('**/api/carteira/dashboard');
  return { id, syntheticAuditFixture: true, text };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await login(page);
  const response = await page.request.get(`${baseURL}/api/carteira/dashboard`);
  if (!response.ok()) throw new Error(`Dashboard baseline failed: ${response.status()}`);
  const baseline = await response.json();

  const partial = clone(baseline);
  partial.patrimony = unavailableMoney(partial.patrimony, 'EXCHANGE_RATE_UNAVAILABLE');
  partial.unrealizedResult = unavailableMoney(partial.unrealizedResult, 'EXCHANGE_RATE_UNAVAILABLE');
  partial.unrealizedResultPercentage = { ...partial.unrealizedResultPercentage, availability: 'UNAVAILABLE', value: null, reason: 'EXCHANGE_RATE_UNAVAILABLE' };
  partial.exchangeSource = unavailableProvenance(partial.exchangeSource, 'EXCHANGE_RATE_UNAVAILABLE');
  const usd = partial.positions.find(position => position.nativeCurrency === 'USD');
  if (usd) {
    usd.currentQuote = unavailableMoney(usd.currentQuote, 'QUOTE_UNAVAILABLE');
    usd.marketValue = unavailableMoney(usd.marketValue, 'QUOTE_UNAVAILABLE');
    usd.unrealizedResult = unavailableMoney(usd.unrealizedResult, 'QUOTE_UNAVAILABLE');
    usd.quoteProvenance = unavailableProvenance(usd.quoteProvenance, 'QUOTE_UNAVAILABLE');
  }

  const stale = clone(baseline);
  for (const metric of [stale.patrimony, stale.cost, stale.unrealizedResult, stale.unrealizedResultPercentage]) metric.availability = 'STALE';
  for (const position of stale.positions) {
    position.currentQuote.availability = 'STALE';
    position.marketValue.availability = 'STALE';
    position.unrealizedResult.availability = 'STALE';
    position.quoteProvenance.availability = 'STALE';
  }
  for (const source of stale.quoteSources) source.availability = 'STALE';
  stale.exchangeSource.availability = 'STALE';

  const unavailable = clone(baseline);
  unavailable.patrimony = unavailableMoney(unavailable.patrimony, 'QUOTE_UNAVAILABLE');
  unavailable.unrealizedResult = unavailableMoney(unavailable.unrealizedResult, 'QUOTE_UNAVAILABLE');
  unavailable.unrealizedResultPercentage = { ...unavailable.unrealizedResultPercentage, availability: 'UNAVAILABLE', value: null, reason: 'QUOTE_UNAVAILABLE' };
  unavailable.positions = unavailable.positions.map(position => ({
    ...position,
    currentQuote: unavailableMoney(position.currentQuote, 'QUOTE_UNAVAILABLE'),
    marketValue: unavailableMoney(position.marketValue, 'QUOTE_UNAVAILABLE'),
    unrealizedResult: unavailableMoney(position.unrealizedResult, 'QUOTE_UNAVAILABLE'),
    quoteProvenance: unavailableProvenance(position.quoteProvenance, 'QUOTE_UNAVAILABLE'),
  }));
  unavailable.quoteSources = unavailable.quoteSources.map(source => unavailableProvenance(source, 'PROVIDER_UNAVAILABLE'));
  unavailable.exchangeSource = unavailableProvenance(unavailable.exchangeSource, 'EXCHANGE_RATE_UNAVAILABLE');

  const evidence = [];
  evidence.push(await captureFixture(page, 'dashboard-partial', partial));
  evidence.push(await captureFixture(page, 'dashboard-stale', stale));
  evidence.push(await captureFixture(page, 'dashboard-integration-unavailable', unavailable));
  await fs.writeFile(path.join(outputDir, 'contract-state-evidence.json'), JSON.stringify(evidence, null, 2));
  await browser.close();
})();
