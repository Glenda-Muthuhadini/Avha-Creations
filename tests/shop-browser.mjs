import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import assert from 'node:assert/strict';

const origin = 'http://127.0.0.1:4174';
// Test-only public endpoint; all requests are intercepted in this browser context.
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4174', '--strictPort'], {
  stdio: 'pipe', windowsHide: true,
  env: { ...process.env, VITE_SUPABASE_URL: 'https://avha-shop-test.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'test-public-key' },
});
let logs = '';
server.stdout.on('data', value => { logs += value; });
server.stderr.on('data', value => { logs += value; });
let browser;
const categories = ['hats-fascinators', 'bags', 'jewellery', 'crochet', 'accessories', 'occasion-pieces'].map((slug, index) => ({ id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`, slug, name: ['Hats & Fascinators', 'Bags', 'Jewellery', 'Crochet', 'Accessories', 'Occasion Pieces'][index] }));
const products = Array.from({ length: 27 }, (_, index) => ({
  id: `10000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
  slug: `creation-${index}`, name: `Creation ${String(index).padStart(2, '0')}`, price: String((index + 1) * 30),
  active: index !== 26, category_id: categories[index % 6].id, featured: index < 5,
  stock_status: index === 1 ? 'out_of_stock' : index === 2 ? 'made_to_order' : 'in_stock',
  images: index === 3 ? [] : ['/images/products/optimized/crimson-crochet-bag-800.webp'],
  description: 'A handmade creation from the test catalogue.', created_at: `2026-10-${String(index + 1).padStart(2, '0')}T12:00:00Z`,
}));
let mode = 'normal';
let releaseProducts;
let productGate = null;
const requests = [];
try {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(logs);
    try { if ((await fetch(origin)).ok) break; } catch { /* wait for Vite */ }
    await setTimeout(200);
  }
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await page.route('https://avha-shop-test.supabase.co/**', async route => {
    const url = new URL(route.request().url());
    const table = url.pathname.split('/').at(-1);
    const headers = { 'access-control-allow-origin': '*', 'access-control-expose-headers': 'content-range', 'content-type': 'application/json' };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { ...headers, 'access-control-allow-headers': '*' }, body: '' });
    if (table === 'categories') return route.fulfill({ headers, body: JSON.stringify(categories) });
    if (table === 'store_settings') return route.fulfill({ headers, body: JSON.stringify({ whatsapp_number: '27762123234' }) });
    if (table !== 'products') return route.fulfill({ headers, body: '[]' });
    requests.push(url);
    if (productGate) await productGate;
    if (mode === 'error') return route.fulfill({ status: 503, headers, body: JSON.stringify({ message: 'private technical error: should not appear in UI' }) });
    let rows = mode === 'empty' ? [] : products.filter(item => url.searchParams.get('active') !== 'eq.true' || item.active);
    for (const [key, value] of url.searchParams) {
      if (key === 'price' && value.startsWith('gte.')) rows = rows.filter(item => Number(item.price) >= Number(value.slice(4)));
      if (key === 'price' && value.startsWith('lte.')) rows = rows.filter(item => Number(item.price) <= Number(value.slice(4)));
      if (['category_id', 'stock_status'].includes(key) && value.startsWith('in.')) {
        const allowed = value.slice(4, -1).split(',');
        rows = rows.filter(item => allowed.includes(item[key]));
      }
      if (key === 'slug') rows = rows.filter(item => item.slug === value.slice(3));
    }
    const order = (url.searchParams.get('order') || 'id.asc').split(',');
    rows.sort((a, b) => {
      for (const entry of order) {
        const [field, direction] = entry.split('.');
        const cmp = ['price', 'featured'].includes(field) ? Number(a[field]) - Number(b[field]) : String(a[field]).localeCompare(String(b[field]));
        if (cmp) return direction === 'desc' ? -cmp : cmp;
      }
      return 0;
    });
    const total = rows.length;
    const offset = Number(url.searchParams.get('offset') || 0);
    const limit = Number(url.searchParams.get('limit') || rows.length);
    rows = rows.slice(offset, offset + limit);
    headers['content-range'] = `${offset}-${Math.max(offset, offset + rows.length - 1)}/${total}`;
    if (route.request().headers().accept?.includes('object+json')) return route.fulfill({ headers, body: JSON.stringify(rows[0] || null) });
    return route.fulfill({ headers, body: JSON.stringify(rows) });
  });
  const cards = page.locator('.catalogue-card--shop');
  const sidebar = page.locator('.shop-desktop-filters');
  // These controlled checkboxes follow an asynchronous Router URL update.
  // Wait for that update rather than requiring .check()'s immediate DOM state.
  const selectSidebarFilter = async name => {
    const input = sidebar.getByLabel(name, { exact: true });
    await input.click();
    await page.waitForFunction(element => element.checked, await input.elementHandle());
  };
  const clearSidebarFilters = async () => {
    await sidebar.getByRole('button', { name: 'Clear all', exact: true }).click();
    await page.waitForURL(url => ['category', 'availability', 'min', 'max'].every(key => !url.searchParams.has(key)));
    await page.waitForFunction(() => !document.querySelector('.shop-desktop-filters input[type="checkbox"]:checked'));
  };
  const resultCount = async expected => {
    await page.waitForFunction(expected => document.querySelectorAll('.catalogue-card--shop').length === expected, expected);
  };
  productGate = new Promise(resolve => { releaseProducts = resolve; });
  await page.goto(origin + '/shop');
  await page.getByRole('status', { name: 'Discovering creations' }).waitFor();
  releaseProducts(); productGate = null;
  await resultCount(12);
  const categoryImage = await page.locator('.category-card img').first().evaluate(image => {
    const { width, height } = image.getBoundingClientRect();
    return { width, height };
  });
  assert.ok(categoryImage.height > categoryImage.width / 1.5, 'Shop category images should use the taller crop');
  const categoryNav = page.locator('.shop-categories');
  assert.equal(await categoryNav.evaluate(element => getComputedStyle(element).position), 'sticky');
  assert.equal(await categoryNav.evaluate(element => getComputedStyle(element).marginTop), '14px');
  await page.evaluate(() => window.scrollTo(0, document.querySelector('.shop-categories').offsetTop + 100));
  assert.ok(Math.abs(await categoryNav.evaluate(element => element.getBoundingClientRect().top)) <= 1, 'Category row should stick to the top while scrolling');
  await page.evaluate(() => window.scrollTo(0, 0));
  assert.ok(requests[0].searchParams.get('select').includes('category_id'));
  assert.equal(requests[0].searchParams.get('active'), 'eq.true');
  assert.equal(requests[0].searchParams.get('limit'), '12');
  await page.getByRole('button', { name: 'Add Creation 00 to wishlist' }).click();
  await page.reload(); await resultCount(12);
  assert.equal(await page.getByRole('button', { name: 'Remove Creation 00 from wishlist' }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: 'Remove Creation 00 from wishlist' }).click();
  await cards.first().getByRole('button', { name: 'Add to Cart', exact: true }).click();
  assert.equal(await page.locator('.site-header .cart-link').count(), 0);
  assert.equal(new URL(page.url()).pathname, '/shop');
  await page.reload(); await resultCount(12);
  await page.goto(origin + '/cart');
  assert.ok((await page.locator('.cart-items').textContent()).includes('Creation 00'));
  await page.goto(origin + '/shop'); await resultCount(12);
  assert.equal(await cards.nth(1).getByRole('button', { name: 'Out of Stock' }).isDisabled(), true);
  const madeToOrder = new URL(await cards.nth(2).getByRole('link', { name: 'Enquire' }).getAttribute('href'));
  assert.equal(madeToOrder.pathname, '/27762123234');
  assert.ok(madeToOrder.searchParams.get('text').includes('Creation 02'));
  assert.equal(await cards.nth(3).locator('.product-image-fallback').count(), 1);
  await cards.first().locator('img').evaluate(image => image.dispatchEvent(new Event('error')));
  assert.equal(await cards.first().locator('.product-image-fallback').count(), 1);
  await page.getByRole('button', { name: 'Next page' }).click();
  await page.waitForURL('**/shop?page=2');
  await page.getByRole('button', { name: 'Page 2', exact: true }).waitFor();
  await page.waitForFunction(() => document.querySelector('.shop-pagination [aria-current="page"]')?.textContent === '2');
  await resultCount(12);
  await page.getByRole('button', { name: 'Next page' }).click();
  await resultCount(2);
  assert.equal(await page.getByRole('button', { name: 'Next page' }).isDisabled(), true);
  assert.equal(requests.at(-1).searchParams.get('offset'), '24');
  await page.goto(origin + '/shop'); await resultCount(12);
  await selectSidebarFilter('Bags'); await resultCount(5);
  assert.ok(new URL(page.url()).searchParams.getAll('category').includes('bags'));
  await selectSidebarFilter('Jewellery'); await resultCount(9);
  await clearSidebarFilters(); await resultCount(12);
  await selectSidebarFilter('In Stock'); await resultCount(12);
  assert.equal(requests.at(-1).searchParams.get('stock_status'), 'in.(in_stock)');
  await clearSidebarFilters();
  await sidebar.getByLabel('Maximum price').fill('100'); await resultCount(3);
  await sidebar.getByLabel('Maximum price').focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(input => input.value === '110', await sidebar.getByLabel('Maximum price').elementHandle());
  assert.equal(await sidebar.getByLabel('Maximum price').inputValue(), '110');
  await clearSidebarFilters(); await resultCount(12);
  await page.getByLabel('Sort by').selectOption('price-desc');
  await page.waitForFunction(() => document.querySelector('.catalogue-card--shop h3')?.textContent === 'Creation 25');
  await page.getByLabel('Sort by').selectOption('newest');
  await page.waitForFunction(() => document.querySelector('.catalogue-card--shop h3')?.textContent === 'Creation 25');
  await page.getByLabel('Sort by').selectOption('name');
  await page.waitForFunction(() => document.querySelector('.catalogue-card--shop h3')?.textContent === 'Creation 00');
  await page.getByLabel('Sort by').selectOption('price-asc');
  await page.waitForFunction(() => document.querySelector('.catalogue-card--shop h3')?.textContent === 'Creation 00');
  await page.getByLabel('Sort by').selectOption('featured');
  await sidebar.getByLabel('Minimum price').fill('1400');
  await page.getByRole('heading', { name: 'No creations found' }).waitFor();
  await page.getByRole('button', { name: 'Clear Filters', exact: true }).click(); await resultCount(12);
  await page.getByRole('navigation', { name: 'Shop by category' }).getByRole('button', { name: 'Bags', exact: true }).click(); await resultCount(5);
  await page.reload(); await resultCount(5);
  await page.goto(origin + '/shop'); await resultCount(12);
  await cards.first().getByRole('link', { name: 'View Creation 00', exact: true }).click();
  await page.waitForURL('**/shop/creation-0');
  await page.getByRole('heading', { name: 'Creation 00', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Add to bag' }).click();
  assert.equal(await page.locator('.site-header .cart-link').count(), 0);
  await page.goto(origin + '/cart');
  assert.ok((await page.locator('.cart-summary').textContent()).includes('R60'));
  await page.goto(origin + '/shop'); await resultCount(12);
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/shop-database-desktop.png', fullPage: true });
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 950 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Shop overflow at ${width}`);
  }
  await page.setViewportSize({ width: 375, height: 850 });
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Filter creations' });
  await drawer.waitFor();
  await drawer.getByLabel('Bags', { exact: true }).check();
  assert.equal(new URL(page.url()).searchParams.has('category'), false, 'Mobile draft waits for Apply');
  await drawer.getByRole('button', { name: 'Apply Filters' }).click(); await resultCount(5);
  assert.equal(await drawer.isVisible(), false);
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await page.keyboard.press('Escape');
  assert.equal(await drawer.isVisible(), false);
  assert.equal(await page.getByRole('button', { name: 'Filters', exact: true }).evaluate(button => button === document.activeElement), true);
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await drawer.getByRole('button', { name: 'Clear all', exact: true }).click();
  await drawer.getByRole('button', { name: 'Apply Filters' }).click(); await resultCount(12);
  await page.screenshot({ path: 'test-results/shop-database-mobile.png', fullPage: true });
  mode = 'empty'; await page.reload();
  await page.getByRole('heading', { name: 'New creations are coming soon.' }).waitFor();
  assert.equal(await page.getByRole('navigation', { name: 'Product pages' }).count(), 0);
  mode = 'error'; await page.reload();
  await page.getByRole('heading', { name: 'We couldn’t load the creations.' }).waitFor();
  assert.equal(await page.getByText('private technical error: should not appear in UI', { exact: false }).count(), 0);
  mode = 'normal';
  await page.getByRole('button', { name: 'Try Again', exact: true }).click(); await resultCount(12);
  assert.deepEqual(runtimeErrors, []);
  console.log('Shop browser checks passed: Supabase request contract, active-only inventory, pagination, categories, price/stock filters, sorting, wishlist, cart/detail flow, WhatsApp, image fallbacks, skeletons, empty/error/retry, mobile draft/Apply/Escape/focus, and six responsive widths.');
} catch (error) {
  console.log('Latest shop requests:', requests.slice(-4).map(url => url.href));
  for (const context of browser?.contexts() || []) for (const page of context.pages()) {
    console.log('Failed shop state:', page.url(), (await page.locator('.shop-results').innerText()).slice(0, 1400));
    await page.screenshot({ path: 'test-results/shop-failure.png', fullPage: true });
  }
  throw error;
} finally {
  releaseProducts?.();
  await browser?.close();
  server.kill();
}
