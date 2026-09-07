const { chromium } = require('../../../../gestao-acoes-ui/node_modules/@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');

const baseURL = process.env.AUDIT_BASE_URL;
const username = process.env.AUDIT_USERNAME;
const password = process.env.AUDIT_PASSWORD;
const providerBase = process.env.AUDIT_PROVIDER_URL ?? 'http://127.0.0.1:9090';

if (!baseURL || !username || !password) {
  throw new Error('AUDIT_BASE_URL, AUDIT_USERNAME and AUDIT_PASSWORD are required.');
}

const outputDir = path.resolve(__dirname, 'current');
const viewports = [
  { name: 'desktop', width: 1440, height: 1024 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'compact', width: 720, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'reflow', width: 320, height: 568 },
];

async function configureProvider(provider, scenario) {
  const response = await fetch(`${providerBase}/control/scenario?provider=${provider}&scenario=${scenario}`, { method: 'POST' });
  if (!response.ok) throw new Error(`Could not configure ${provider}/${scenario}`);
}

async function capture(page, metrics, name, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.waitForTimeout(180);
  await page.evaluate(auditUsername => {
    for (const element of document.querySelectorAll('body *')) {
      if (element.children.length === 0 && element.textContent?.trim() === auditUsername) {
        element.textContent = 'Conta de demonstração';
      }
    }
  }, username);
  const measured = await page.evaluate(() => {
    const root = document.documentElement;
    const main = document.querySelector('main');
    const heading = document.querySelector('h1');
    const cards = [...document.querySelectorAll('.summary-card, .mobile-data-card, article')];
    const visible = element => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const buttons = [...document.querySelectorAll('button')].filter(visible);
    const links = [...document.querySelectorAll('a')].filter(visible);
    return {
      url: location.pathname,
      title: document.title,
      viewport: { width: innerWidth, height: innerHeight },
      scrollWidth: root.scrollWidth,
      overflowX: root.scrollWidth > root.clientWidth,
      bodyTextLength: document.body.innerText.length,
      headings: [...document.querySelectorAll('h1,h2,h3')].filter(visible).map(node => ({ level: node.tagName, text: node.textContent.trim() })),
      main: main ? main.getBoundingClientRect().toJSON() : null,
      h1: heading ? heading.getBoundingClientRect().toJSON() : null,
      visibleButtons: buttons.length,
      visibleLinks: links.length,
      visibleCards: cards.filter(visible).length,
      fontFamily: getComputedStyle(document.body).fontFamily,
      fontSize: getComputedStyle(document.body).fontSize,
    };
  });
  metrics.push({ name, ...measured });
  await page.screenshot({ path: path.join(outputDir, `${name}-${viewport.width}x${viewport.height}.png`), fullPage: true });
}

async function login(page, returnUrl = '/dashboard') {
  await page.goto(`${baseURL}${returnUrl}`);
  await page.getByLabel('Usuário').fill(username);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar com segurança' }).click();
  await page.waitForURL(new RegExp(`${returnUrl.replace('/', '\\/')}$`));
}

async function registerOperation(page, type, asset, quantity) {
  await page.getByLabel(type === 'COMPRA' ? 'Compra simulada' : 'Venda simulada').check();
  await page.locator('#operation-asset').selectOption({ label: asset });
  await page.locator('#operation-broker').selectOption({ label: 'Corretora Teste' });
  await page.getByLabel('Quantidade inteira').fill(String(quantity));
  await page.getByRole('button', { name: new RegExp(`Revisar ${type === 'COMPRA' ? 'compra' : 'venda'}`, 'i') }).click();
  await page.getByRole('button', { name: 'Confirmar registro simulado' }).click();
  await page.getByText('Registro simulado concluído e leituras confirmadas pelo backend.').waitFor();
}

(async () => {
  await fs.mkdir(outputDir, { recursive: true });
  await fetch(`${providerBase}/control/reset`, { method: 'POST' });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const metrics = [];

  await page.goto(`${baseURL}/login`);
  await capture(page, metrics, 'login', viewports[0]);
  await capture(page, metrics, 'login', viewports[3]);
  await login(page);
  await capture(page, metrics, 'dashboard-empty', viewports[0]);
  await page.goto(`${baseURL}/carteira`);
  await capture(page, metrics, 'carteira-empty', viewports[3]);

  await page.setViewportSize({ width: viewports[0].width, height: viewports[0].height });
  await page.goto(`${baseURL}/corretoras`);
  const visibleBroker = page.locator('strong:visible', { hasText: 'Corretora Teste' }).first();
  if (await visibleBroker.count() === 0) {
    await page.getByLabel('CNPJ').fill('11.222.333/0001-81');
    await page.getByLabel('CEP').fill('01001000');
    await page.getByRole('button', { name: 'Cadastrar corretora' }).click();
  }
  await page.locator('strong:visible', { hasText: 'Corretora Teste' }).first().waitFor();

  await page.goto(`${baseURL}/acoes`);
  await page.getByLabel('Ticker').fill('PETR4');
  await page.getByLabel('Mercado').selectOption('BRASIL');
  await page.getByRole('button', { name: 'Cadastrar ativo' }).click();
  await page.getByRole('rowheader', { name: /PETR4/ }).waitFor();
  await page.getByLabel('Ticker').fill('AAPL');
  await page.getByLabel('Mercado').selectOption('AMERICANO');
  await page.getByRole('button', { name: 'Cadastrar ativo' }).click();
  await page.getByRole('rowheader', { name: /AAPL/ }).waitFor();

  await page.goto(`${baseURL}/operacoes`);
  await registerOperation(page, 'COMPRA', 'PETR4 · BRASIL', 12);
  await registerOperation(page, 'COMPRA', 'AAPL · AMERICANO', 3);
  await registerOperation(page, 'VENDA', 'PETR4 · BRASIL', 2);

  for (const route of ['dashboard', 'carteira', 'operacoes', 'acoes', 'corretoras']) {
    await page.goto(`${baseURL}/${route}`);
    for (const viewport of viewports) await capture(page, metrics, route, viewport);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/dashboard`);
  await page.route('**/api/carteira/dashboard', async route => {
    await new Promise(resolve => setTimeout(resolve, 1400));
    await route.continue();
  }, { times: 1 });
  const loadingClick = page.getByRole('button', { name: 'Atualizar dados' }).click();
  await page.waitForTimeout(120);
  await capture(page, metrics, 'dashboard-loading', viewports[3]);
  await loadingClick;
  await page.unroute('**/api/carteira/dashboard');

  await page.route('**/api/carteira/dashboard', route => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Indisponibilidade simulada para auditoria visual.' }),
  }), { times: 1 });
  await page.getByRole('button', { name: 'Atualizar dados' }).click();
  await page.waitForTimeout(400);
  await capture(page, metrics, 'dashboard-error', viewports[3]);
  await page.unroute('**/api/carteira/dashboard');

  await configureProvider('twelvedata', 'unavailable');
  await page.getByRole('button', { name: 'Atualizar dados' }).click();
  await page.waitForTimeout(400);
  await capture(page, metrics, 'dashboard-partial', viewports[0]);
  await configureProvider('all', 'stale');
  await page.getByRole('button', { name: 'Atualizar dados' }).click();
  await page.waitForTimeout(400);
  await capture(page, metrics, 'dashboard-stale', viewports[0]);
  await configureProvider('all', 'unavailable');
  await page.getByRole('button', { name: 'Atualizar dados' }).click();
  await page.waitForTimeout(400);
  await capture(page, metrics, 'dashboard-integration-unavailable', viewports[0]);
  await configureProvider('all', 'success');

  await context.clearCookies();
  await page.getByRole('button', { name: 'Atualizar dados' }).click();
  await page.getByText('Sua sessão expirou. Entre novamente para continuar.').waitFor();
  await capture(page, metrics, 'session-expired', viewports[3]);
  await login(page);
  await page.goto(`${baseURL}/rota-inexistente`);
  await capture(page, metrics, '404', viewports[4]);

  await fs.writeFile(path.join(outputDir, 'metrics.json'), JSON.stringify(metrics, null, 2));
  await browser.close();
})();
