import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';

const origin = 'http://127.0.0.1:4173';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: 'pipe', windowsHide: true });
let logs = '';
server.stdout.on('data', data => { logs += data; });
server.stderr.on('data', data => { logs += data; });
let browser;
try {
  let ready = false;
  for (let i = 0; i < 40; i++) {
    if (server.exitCode !== null) throw new Error(logs);
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch { /* server starting */ }
    await setTimeout(250);
  }
  if (!ready) throw new Error(`Preview did not become ready: ${logs}`);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const publicRoutes = ['/', '/shop', '/shop/unavailable', '/hair-services', '/hair-services/unavailable', '/about', '/contact', '/cart', '/checkout', '/order-success/AVHA-1047', '/missing-page'];
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of publicRoutes) {
      await page.goto(origin + route);
      await page.locator('h1').waitFor();
      assert.ok((await page.title()).includes('AVHA CREATIONS'));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}: ${route}`);
    }
  }
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(origin);
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.locator('#main-navigation').getByRole('link', { name: 'Shop', exact: true }).click();
  assert.equal(new URL(page.url()).pathname, '/shop');
  assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).getAttribute('aria-expanded'), 'false');

  for (const route of ['/admin', '/admin/products', '/admin/products/new', '/admin/products/123/edit', '/admin/categories', '/admin/services', '/admin/orders', '/admin/orders/123', '/admin/settings']) {
    await page.goto(origin + route);
    await page.waitForURL('**/admin/login');
    assert.equal(await page.getByRole('button', { name: 'Sign in securely' }).isDisabled(), true);
  }

  await page.goto(origin + '/cart');
  await page.evaluate(() => localStorage.setItem('avha:cart:v1', JSON.stringify([{ id: '11111111-1111-4111-8111-111111111111', slug: 'test-bag', name: 'Test bag', quantity: 1, unitPriceCents: 45000 }])));
  await page.reload();
  await page.getByRole('button', { name: 'Increase quantity for Test bag' }).click();
  await page.reload();
  assert.equal(await page.locator('output').textContent(), '2');
  assert.ok((await page.locator('.cart-summary').textContent()).includes('R900'));
  await page.getByRole('button', { name: 'Remove Test bag' }).click();
  await page.getByRole('heading', { name: 'Your bag is waiting for a little artistry.' }).waitFor();
  await page.evaluate(() => localStorage.setItem('avha:cart:v1', '{broken-json'));
  await page.reload();
  await page.getByRole('heading', { name: 'Your bag is waiting for a little artistry.' }).waitFor();

  await mkdir('test-results', { recursive: true });
  await page.goto(origin);
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  assert.deepEqual(errors, [], `Browser console errors: ${errors.join('\n')}`);
  console.log('Browser checks passed: public routes at 375/768/1440px, admin protection, mobile navigation, persisted cart, invalid storage, no console errors.');
} finally {
  await browser?.close();
  server.kill();
}
