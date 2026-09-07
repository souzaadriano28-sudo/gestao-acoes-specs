const { chromium } = require('../../../../gestao-acoes-ui/node_modules/@playwright/test');
const path = require('node:path');

const baseURL = process.env.AUDIT_BASE_URL;
const username = process.env.AUDIT_USERNAME;
const password = process.env.AUDIT_PASSWORD;
if (!baseURL || !username || !password) throw new Error('Audit runtime variables are required.');

const outputDir = path.resolve(__dirname, 'current');
const viewports = [
  { width: 1440, height: 1024 },
  { width: 768, height: 1024 },
  { width: 720, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
];

async function login(page) {
  await page.goto(`${baseURL}/dashboard`);
  await page.getByLabel('Usuário').fill(username);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar com segurança' }).click();
  await page.waitForURL(/\/dashboard$/);
}

async function anonymize(page) {
  await page.evaluate(auditUsername => {
    for (const element of document.querySelectorAll('body *')) {
      if (element.children.length === 0 && element.textContent?.trim() === auditUsername) {
        element.textContent = 'Conta de demonstração';
      }
    }
  }, username);
}

async function capture(page, route, viewport, file = `${route}-${viewport.width}x${viewport.height}.png`) {
  await page.setViewportSize(viewport);
  await page.goto(`${baseURL}/${route}`);
  await page.waitForTimeout(250);
  await anonymize(page);
  await page.screenshot({ path: path.join(outputDir, file), fullPage: true });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${baseURL}/login`);
  for (const viewport of [viewports[0], viewports[3]]) {
    await page.setViewportSize(viewport);
    await page.screenshot({ path: path.join(outputDir, `login-${viewport.width}x${viewport.height}.png`), fullPage: true });
  }
  await login(page);

  for (const route of ['dashboard', 'carteira', 'operacoes', 'acoes', 'corretoras']) {
    for (const viewport of viewports) await capture(page, route, viewport);
  }

  const dashboardResponse = await page.request.get(`${baseURL}/api/carteira/dashboard`);
  if (!dashboardResponse.ok()) throw new Error(`Dashboard baseline failed: ${dashboardResponse.status()}`);
  const emptyDashboard = await dashboardResponse.json();
  emptyDashboard.positionCount = 0;
  emptyDashboard.positions = [];
  emptyDashboard.recentMovements = [];
  emptyDashboard.quoteSources = [];
  for (const metric of [emptyDashboard.patrimony, emptyDashboard.cost, emptyDashboard.unrealizedResult, emptyDashboard.unrealizedResultPercentage]) {
    metric.value = 0;
    metric.availability = 'AVAILABLE';
    metric.reason = null;
  }
  await page.route('**/api/carteira/dashboard', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyDashboard) }), { times: 1 });
  await capture(page, 'dashboard', viewports[0], 'dashboard-empty-1440x1024.png');
  await page.unroute('**/api/carteira/dashboard');

  await page.route('**/api/carteira/posicoes/detalhadas**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 }),
  }), { times: 1 });
  await capture(page, 'carteira', viewports[3], 'carteira-empty-390x844.png');
  await page.unroute('**/api/carteira/posicoes/detalhadas**');

  await capture(page, 'rota-inexistente', viewports[4], '404-320x568.png');
  await browser.close();
})();
