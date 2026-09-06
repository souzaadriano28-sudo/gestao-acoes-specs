import { chromium } from '../../../../gestao-acoes-ui/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 }, deviceScaleFactor: 1 });
await page.goto(`file:///${path.join(here, 'index.html').replaceAll('\\', '/')}`);
await page.screenshot({ path: path.join(here, 'dashboard-desktop-1440x1024.png'), fullPage: false });
await page.setViewportSize({ width: 768, height: 1024 });
await page.reload();
await page.screenshot({ path: path.join(here, 'dashboard-tablet-768x1024.png'), fullPage: false });
await page.setViewportSize({ width: 390, height: 844 });
await page.reload();
await page.screenshot({ path: path.join(here, 'dashboard-mobile-390x844.png'), fullPage: false });
await page.setViewportSize({ width: 1440, height: 1024 });
await page.goto(`file:///${path.join(here, 'states.html').replaceAll('\\', '/')}`);
await page.screenshot({ path: path.join(here, 'dashboard-states-1440x1024.png'), fullPage: false });
await browser.close();
