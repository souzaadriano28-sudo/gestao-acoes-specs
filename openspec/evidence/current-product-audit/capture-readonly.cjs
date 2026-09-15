const { chromium } = require('../../../gestao-acoes-ui/node_modules/@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');

const baseURL = process.env.AUDIT_BASE_URL;
const username = process.env.AUDIT_USERNAME;
const password = process.env.AUDIT_PASSWORD;

if (!baseURL || !username || !password) {
  throw new Error('AUDIT_BASE_URL, AUDIT_USERNAME and AUDIT_PASSWORD are required.');
}

const outputDir = path.resolve(__dirname, 'captures');
const desktop = { width: 1440, height: 1024 };
const mobile = { width: 390, height: 844 };

async function redactAccount(page) {
  await page.evaluate(auditUsername => {
    for (const element of document.querySelectorAll('body *')) {
      if (element.children.length === 0 && element.textContent?.trim() === auditUsername) {
        element.textContent = 'Conta de inspeção';
      }
    }
  }, username);
}

async function capture(page, name, viewport, metrics) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(150);
  await redactAccount(page);
  const measurement = await page.evaluate(() => {
    const rect = selector => {
      const element = document.querySelector(selector);
      return element ? element.getBoundingClientRect().toJSON() : null;
    };
    const tables = [...document.querySelectorAll('table')].map(table => ({
      clientWidth: table.parentElement?.clientWidth ?? null,
      scrollWidth: table.parentElement?.scrollWidth ?? null,
      tableWidth: table.getBoundingClientRect().width,
    }));
    return {
      path: location.pathname,
      viewport: { width: innerWidth, height: innerHeight },
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyText: document.body.innerText,
      fields: {
        cnpj: rect('#broker-cnpj'),
        cep: rect('#broker-cep'),
        ticker: rect('#asset-ticker'),
        market: rect('#asset-market'),
        operationAsset: rect('#operation-asset'),
        operationBroker: rect('#operation-broker'),
        operationQuantity: rect('#operation-quantity'),
      },
      tables,
    };
  });
  metrics.push({ name, ...measurement });
  await page.screenshot({ path: path.join(outputDir, `${name}-${viewport.width}x${viewport.height}.png`), fullPage: true });
}

async function login(page) {
  await page.goto(`${baseURL}/login`);
  await page.locator('#usuario').fill(username);
  await page.locator('#senha').fill(password);
  await page.getByRole('button', { name: 'Entrar com segurança' }).click();
  await page.waitForURL(/\/dashboard$/);
}

(async () => {
  await fs.mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: desktop });
  const page = await context.newPage();
  const metrics = [];

  await page.goto(`${baseURL}/login`);
  await page.screenshot({ path: path.join(outputDir, 'login-empty-1440x1024.png'), fullPage: true });
  await login(page);

  for (const route of ['corretoras', 'acoes', 'operacoes']) {
    await page.goto(`${baseURL}/${route}`);
    await capture(page, route, desktop, metrics);
    await capture(page, route, mobile, metrics);
  }

  await page.setViewportSize(desktop);
  await page.goto(`${baseURL}/operacoes`);
  await page.locator('#operation-asset').selectOption({ index: 1 });
  await page.locator('#operation-broker').selectOption({ index: 1 });
  await page.locator('#operation-quantity').fill('10');
  await page.getByRole('button', { name: /Revisar compra simulada/i }).click();
  await capture(page, 'operacoes-revisao-sem-preco', desktop, metrics);

  await page.goto(`${baseURL}/dashboard`);
  await page.locator('details.quality').evaluate(element => { element.open = true; });
  await capture(page, 'dashboard-qualidade-tecnica', desktop, metrics);

  await page.goto(`${baseURL}/acoes`);
  let releaseRequest;
  const requestMayFinish = new Promise(resolve => { releaseRequest = resolve; });
  await page.route('**/api/acoes', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    await requestMayFinish;
    await route.abort('timedout');
  });
  await page.locator('#asset-ticker').fill('AAPL');
  await page.locator('#asset-market').selectOption('AMERICANO');
  const pendingSubmit = page.getByRole('button', { name: 'Cadastrar ativo' }).click();
  await page.getByRole('button', { name: 'Consultando…' }).waitFor();
  await page.waitForTimeout(2500);
  await capture(page, 'ativo-americano-espera-controlada', desktop, metrics);
  releaseRequest();
  await pendingSubmit.catch(() => undefined);
  await page.unroute('**/api/acoes');

  const safeMetrics = metrics.map(entry => ({
    ...entry,
    bodyText: entry.bodyText.replaceAll(username, 'Conta de inspeção'),
  }));
  await fs.writeFile(path.join(outputDir, 'metrics.json'), JSON.stringify(safeMetrics, null, 2));
  await browser.close();
})().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
