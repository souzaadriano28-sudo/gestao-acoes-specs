const { chromium } = require('../../../../gestao-acoes-ui/node_modules/@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const output = path.resolve(__dirname, 'screenshots');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const base = pathToFileURL(path.resolve(__dirname, 'index.html')).href;
  const screens = ['login', 'dashboard', 'carteira', 'operacoes'];
  const viewports = [{ width: 1440, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 568 }];
  const metrics = [];
  for (const screen of screens) {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(`${base}?screen=${screen}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      metrics.push({ screen, ...viewport, overflow });
      await page.screenshot({ path: path.join(output, `${screen}-${viewport.width}x${viewport.height}.png`), fullPage: true });
    }
  }
  await fs.writeFile(path.join(output, 'metrics.json'), JSON.stringify(metrics, null, 2));
  await browser.close();
})();
