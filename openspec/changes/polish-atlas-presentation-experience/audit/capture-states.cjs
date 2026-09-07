const { chromium } = require('../../../../gestao-acoes-ui/node_modules/@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');

const baseURL = process.env.AUDIT_BASE_URL;
const username = process.env.AUDIT_USERNAME;
const password = process.env.AUDIT_PASSWORD;
const providerBase = process.env.AUDIT_PROVIDER_URL ?? 'http://127.0.0.1:9090';
if (!baseURL || !username || !password) throw new Error('Audit runtime variables are required.');

const outputDir = path.resolve(__dirname, 'current');
const desktop = { width: 1440, height: 1024 };
const mobile = { width: 390, height: 844 };

async function login(page) {
  await page.goto(`${baseURL}/dashboard`);
  await page.getByLabel('Usuário').fill(username);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar com segurança' }).click();
  await page.waitForURL(/\/dashboard$/);
}

async function scenario(provider, value) {
  const response = await fetch(`${providerBase}/control/scenario?provider=${provider}&scenario=${value}`, { method: 'POST' });
  if (!response.ok) throw new Error(`Could not set ${provider}/${value}`);
}

async function inspect(page, name, viewport) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(300);
  await page.evaluate(auditUsername => {
    for (const element of document.querySelectorAll('body *')) {
      if (element.children.length === 0 && element.textContent?.trim() === auditUsername) {
        element.textContent = 'Conta de demonstração';
      }
    }
  }, username);
  const metric = await page.evaluate(() => ({
    name: document.title,
    path: location.pathname,
    viewport: { width: innerWidth, height: innerHeight },
    scrollWidth: document.documentElement.scrollWidth,
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    text: document.body.innerText.slice(0, 6000),
    headings: [...document.querySelectorAll('h1,h2,h3')].filter(node => node.getClientRects().length).map(node => `${node.tagName}:${node.textContent.trim()}`),
    mainRect: document.querySelector('main')?.getBoundingClientRect().toJSON() ?? null,
    controls: [...document.querySelectorAll('button,input,select,a')].filter(node => node.getClientRects().length).length,
  }));
  await page.screenshot({ path: path.join(outputDir, `${name}-${viewport.width}x${viewport.height}.png`), fullPage: true });
  return { id: name, ...metric };
}

(async () => {
  await fs.mkdir(outputDir, { recursive: true });
  await fetch(`${providerBase}/control/reset`, { method: 'POST' });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const metrics = [];
  await login(page);

  for (const width of [1440, 768, 720, 390, 320]) {
    const viewport = { width, height: width === 1440 ? 1024 : width === 768 ? 1024 : width === 720 ? 900 : width === 390 ? 844 : 568 };
    for (const route of ['dashboard', 'carteira', 'operacoes', 'acoes', 'corretoras']) {
      await page.goto(`${baseURL}/${route}`);
      metrics.push(await inspect(page, `measure-${route}-${width}`, viewport));
    }
  }

  await page.setViewportSize(mobile);
  await page.goto(`${baseURL}/acoes`);
  await page.route('**/api/carteira/dashboard', async route => {
    await new Promise(resolve => setTimeout(resolve, 1600));
    try {
      await route.continue();
    } catch (error) {
      if (!String(error).includes('Route is already handled')) throw error;
    }
  }, { times: 1 });
  const loadingNavigation = page.goto(`${baseURL}/dashboard`);
  await page.waitForTimeout(180);
  metrics.push(await inspect(page, 'dashboard-loading', mobile));
  await loadingNavigation;
  await page.unroute('**/api/carteira/dashboard');

  await page.goto(`${baseURL}/acoes`);
  await page.route('**/api/carteira/dashboard', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Indisponibilidade simulada para auditoria visual.' }) }), { times: 1 });
  await page.goto(`${baseURL}/dashboard`);
  await page.waitForTimeout(400);
  metrics.push(await inspect(page, 'dashboard-error', mobile));
  await page.unroute('**/api/carteira/dashboard');

  await scenario('twelvedata', 'unavailable');
  await page.goto(`${baseURL}/acoes`);
  await page.goto(`${baseURL}/dashboard`);
  metrics.push(await inspect(page, 'dashboard-partial', desktop));

  await scenario('all', 'stale');
  await page.goto(`${baseURL}/acoes`);
  await page.goto(`${baseURL}/dashboard`);
  metrics.push(await inspect(page, 'dashboard-stale', desktop));

  await scenario('all', 'unavailable');
  await page.goto(`${baseURL}/acoes`);
  await page.goto(`${baseURL}/dashboard`);
  metrics.push(await inspect(page, 'dashboard-integration-unavailable', desktop));
  await scenario('all', 'success');

  await context.clearCookies();
  await page.getByRole('button', { name: 'Atualizar dados' }).click();
  await page.waitForURL(/\/login/);
  metrics.push(await inspect(page, 'session-expired', mobile));
  await login(page);
  await page.goto(`${baseURL}/rota-inexistente`);
  metrics.push(await inspect(page, '404', { width: 320, height: 568 }));

  await fs.writeFile(path.join(outputDir, 'metrics.json'), JSON.stringify(metrics, null, 2));
  await browser.close();
})();
