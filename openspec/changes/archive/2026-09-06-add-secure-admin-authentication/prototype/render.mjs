import { chromium } from '../../../../gestao-acoes-ui/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 }, deviceScaleFactor: 1 });
await page.goto(`file://${path.join(dir, 'index.html')}`);
await page.screenshot({ path: path.join(dir, 'login-desktop-1440x1024.png'), fullPage: false });
await page.setViewportSize({ width: 390, height: 844 });
await page.reload();
await page.screenshot({ path: path.join(dir, 'login-mobile-390x844.png'), fullPage: false });
await browser.close();
