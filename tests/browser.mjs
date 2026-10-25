import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';

const origin = 'http://127.0.0.1:4173';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', ...(process.env.AVHA_TEST_PRODUCTION === '1' ? ['preview'] : []), '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: 'pipe', windowsHide: true });
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
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 950 });
    let sharedHeaderStyle;
    for (const route of publicRoutes) {
      await page.goto(origin + route);
      await page.locator('h1').waitFor();
      assert.ok((await page.title()).includes('AVHA CREATIONS'));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}: ${route}`);
      const header = page.locator('.site-header');
      assert.equal(await header.getAttribute('class'), 'site-header', `Inconsistent header at ${width}: ${route}`);
      assert.equal(await header.locator('.cart-link').count(), 0, `Bag shown in header at ${width}: ${route}`);
      assert.equal(await header.evaluate(element => getComputedStyle(element).position), 'sticky', `Header should be sticky at ${width}: ${route}`);
      assert.equal(await header.evaluate(element => getComputedStyle(element).top), '12px', `Floating header gap at ${width}: ${route}`);
      for (const bookingLink of await header.getByRole('link', { name: 'Book Now', exact: true }).all()) {
        assert.match(await bookingLink.getAttribute('href'), /^https:\/\/wa\.me\/27762123234\?/);
        assert.equal(await bookingLink.getAttribute('target'), '_blank');
      }
      const logo = page.locator('.site-header .brand--official img');
      await logo.evaluate(image => image.decode());
      await page.evaluate(() => document.fonts.ready);
      const headerStyle = await header.evaluate(element => {
        const style = getComputedStyle(element);
        return { background: style.backgroundColor, position: style.position, blur: style.backdropFilter, corners: style.borderRadius, height: element.getBoundingClientRect().height };
      });
      if (!sharedHeaderStyle) sharedHeaderStyle = headerStyle;
      assert.deepEqual(headerStyle, sharedHeaderStyle, `Header appearance differs at ${width}: ${route}`);
      const brandLayout = await logo.evaluate(image => {
        const rect = image.getBoundingClientRect();
        return { ratio: rect.width / rect.height, naturalRatio: image.naturalWidth / image.naturalHeight, height: rect.height };
      });
      assert.ok(Math.abs(brandLayout.ratio - brandLayout.naturalRatio) < .01, `Logo distortion at ${width}`);
      assert.ok(brandLayout.height <= 110, `Logo height at ${width}`);
    }
  }
  for (const [rel, count] of [['icon', 3], ['apple-touch-icon', 1]]) {
    const paths = await page.locator(`head link[rel="${rel}"]`).evaluateAll(links => links.map(link => link.getAttribute('href')));
    assert.equal(paths.length, count);
    for (const path of paths) {
      const response = await page.request.get(origin + path);
      assert.equal(response.status(), 200);
      assert.ok(response.headers()['content-type'].includes('image/png'));
    }
  }
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(origin);
  await page.evaluate(() => window.scrollTo(0, 500));
  assert.ok(Math.abs(await page.locator('.site-header').evaluate(element => element.getBoundingClientRect().top) - 12) <= 1, 'Header should remain sticky while scrolling');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.locator('#main-navigation').getByRole('link', { name: 'Shop', exact: true }).click();
  assert.equal(new URL(page.url()).pathname, '/shop');
  assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).getAttribute('aria-expanded'), 'false');

  await page.goto(origin + '/hair-services');
  await page.locator('#hair-title').waitFor();
  assert.equal(await page.locator('.hair-service-card').count(), 6);
  assert.equal(await page.locator('.hair-work__gallery img').count(), 6);
  assert.equal(await page.locator('.site-footer a[href="https://hadiniholdings.co.za"]').textContent(), 'Hadini Holdings');

  await page.goto(origin + '/about');
  await page.locator('#about-title').waitFor();
  assert.equal(await page.locator('.about-hero__signature').count(), 0);
  assert.equal(await page.locator('.about-values article').count(), 4);
  await page.getByRole('heading', { name: 'From a passion to a purpose.' }).waitFor();
  await page.getByRole('heading', { name: 'A creative community.' }).waitFor();
  await page.getByRole('heading', { name: 'Proudly South African.' }).waitFor();
  assert.equal(await page.locator('.site-header').evaluate(element => getComputedStyle(element).position), 'sticky');
  assert.equal(await page.locator('.site-footer a[href="https://hadiniholdings.co.za"]').textContent(), 'Hadini Holdings');

  for (const route of ['/admin', '/admin/products', '/admin/products/new', '/admin/products/123/edit', '/admin/categories', '/admin/services', '/admin/orders', '/admin/orders/123', '/admin/settings']) {
    await page.goto(origin + route);
    await page.getByRole('heading', { name: 'Welcome back.' }).waitFor();
    assert.equal(new URL(page.url()).pathname, '/admin/login');
    assert.equal(await page.getByRole('button', { name: 'Sign in securely' }).isDisabled(), true);
  }

  await page.goto(origin + '/shop');
  await page.locator('.catalogue-card').first().waitFor();
  assert.equal(await page.locator('.shop-signature').count(), 0);
  assert.equal(await page.locator('.catalogue-card').count(), 20);
  await page.locator('.shop-load-more').scrollIntoViewIfNeeded();
  await page.getByRole('heading', { name: 'Rasta Crochet Hat & Earring Set', exact: true }).waitFor();
  assert.equal(await page.locator('.catalogue-card').count(), 35);
  assert.equal(await page.locator('.shop-preview-note').count(), 0);
  assert.equal(await page.getByText('Estimated starting prices', { exact: false }).count(), 0);
  for (const [name, price] of [['Turquoise Crochet Bikini', 'From R200'], ['Crocheted Sunflower Scrunchie Pair', 'From R25']]) {
    const product = page.locator('.catalogue-card').filter({ has: page.getByRole('heading', { name, exact: true }) });
    assert.equal(await product.count(), 1);
    assert.ok((await product.textContent()).includes(price));
  }
  for (const [name, price] of [
    ['Chunky Pink Crochet Tassel Tote', 'From R550'],
    ['Coral Crochet Boho Two-Piece Set', 'From R480'],
    ['Crochet Chevron Two-Piece Set', 'From R800'],
    ['Crocheted Red and Cream Rose Bouquet', 'R30 each rose'],
    ['Fuchsia Crochet Fringe Dress (Swim Cover)', 'From R650'],
    ['Hot Pink Crochet Ruffle Set', 'From R500'],
    ['Pastel Pink and Grey Fringe Skirt', 'From R450'],
    ['Pastel Rainbow Crochet Dress', 'From R800'],
    ['Vibrant Orange Waffle Stitch Crochet Fringe Dress', 'From R800'],
    ['White Waffle Stitch Crochet Fringe Dress', 'From R800'],
    ['Crochet Green Crop Top & Striped Skirt Set', 'From R600'],
    ['Pink & Purple Crochet Fringe Ensemble', 'From R650'],
    ['Pastel Crochet Fairy Tutu', 'From R500'],
    ['Pink Crochet Ruffled Romper', 'From R550'],
    ['Pink Crochet Top & Pastel Skirt Set', 'From R600'],
    ['Red Ribbed Crochet Dress', 'From R800'],
  ]) {
    const product = page.locator('.catalogue-card').filter({ has: page.getByRole('heading', { name, exact: true }) });
    assert.equal(await product.count(), 1);
    assert.ok((await product.textContent()).includes(price));
  }
  for (const image of await page.locator('.catalogue-card img').all()) {
    assert.ok((await image.getAttribute('src')).startsWith('/images/products/'));
    await image.evaluate(element => element.decode());
  }
  const prices = await page.locator('.catalogue-card .price').allTextContents();
  assert.equal(prices.filter(price => /^From R250/.test(price)).length, 1);
  assert.equal(prices.filter(price => /^From R450/.test(price)).length, 7);
  assert.equal(prices.filter(price => /^From R30(?:\D|$)/.test(price)).length, 2);

  const sunhat = page.locator('.catalogue-card').filter({ has: page.getByRole('heading', { name: 'Blue & Yellow Crochet Sunhat', exact: true }) });
  await sunhat.scrollIntoViewIfNeeded();
  assert.equal(await sunhat.locator('.product-gallery__count').textContent(), '1/2');
  await sunhat.locator('.product-gallery__photo').hover();
  await page.waitForFunction(() => document.querySelector('a[href="/shop/blue-yellow-crochet-sunhat"] img')?.getAttribute('src').includes('-worn-'));
  await sunhat.getByRole('button', { name: 'Show photo 1 of Blue & Yellow Crochet Sunhat' }).click();
  assert.equal(await sunhat.locator('.product-gallery__count').textContent(), '1/2');
  await sunhat.getByRole('link', { name: 'View Blue & Yellow Crochet Sunhat', exact: true }).click();
  const gallery = page.locator('.product-gallery--detail');
  await gallery.waitFor();
  await page.mouse.move(0, 0);
  await page.waitForFunction(() => document.querySelector('.product-gallery--detail .product-gallery__count')?.textContent === '2/2');
  await gallery.getByRole('button', { name: 'Pause slideshow' }).click();
  await gallery.getByRole('button', { name: 'Show photo 1 of Blue & Yellow Crochet Sunhat' }).click();
  assert.equal(await gallery.locator('.product-gallery__count').textContent(), '1/2');
  const detailPhoto = gallery.locator('.product-gallery__photo > img');
  assert.ok((await detailPhoto.getAttribute('srcset')).includes('480.webp'));
  await gallery.getByRole('button', { name: 'Show photo 2 of Blue & Yellow Crochet Sunhat' }).click();
  assert.equal(await detailPhoto.getAttribute('srcset'), null);
  await detailPhoto.evaluate(image => image.decode());
  await page.waitForTimeout(4200);
  assert.equal(await gallery.locator('.product-gallery__count').textContent(), '2/2');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(origin + '/shop/mustard-crochet-hat-scarf-set');
  await gallery.waitFor();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(4200);
  assert.equal(await gallery.locator('.product-gallery__count').textContent(), '1/2');
  assert.equal(await gallery.getByRole('button', { name: 'Pause slideshow' }).count(), 0);
  await gallery.getByRole('button', { name: 'Show photo 2 of Mustard Crochet Hat & Scarf Set' }).click();
  assert.equal(await gallery.locator('.product-gallery__count').textContent(), '2/2');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: 'test-results/product-gallery-mobile.png', fullPage: true });
  await page.goto(origin + '/shop/black-crochet-fringe-bag');
  await gallery.waitFor();
  assert.equal(await gallery.locator('button').count(), 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  // Exercise the actual supplied catalogue through each category tile.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(origin + '/shop');
  await page.locator('.catalogue-card').first().waitFor();
  const categoryNav = page.getByRole('navigation', { name: 'Shop by category' });
  for (const [name, slug, total] of [
    ['Hats & Fascinators', 'hats-fascinators', 7], ['Bags', 'bags', 7],
    ['Jewellery', 'jewellery', 3], ['Crochet', 'crochet', 33],
    ['Dresses', 'dresses', 6], ['Occasion Pieces', 'occasion-pieces', 21],
  ]) {
    const tile = categoryNav.getByRole('button', { name, exact: true });
    await tile.click();
    await page.waitForFunction(button => button.getAttribute('aria-pressed') === 'true', await tile.elementHandle());
    await page.waitForFunction(total => document.querySelector('.shop-result-meta p')?.textContent === `${Math.min(total, 20)} of ${total} creations`, total);
    assert.equal(new URL(page.url()).searchParams.get('category'), slug);
    assert.equal(await categoryNav.getByRole('button', { name, exact: true }).getAttribute('aria-pressed'), 'true');
  }
  // Toggling the selected tile off resets pagination instead of appending old results.
  await categoryNav.getByRole('button', { name: 'Occasion Pieces', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.shop-result-meta p')?.textContent === '20 of 35 creations');
  assert.equal(new URL(page.url()).searchParams.has('category'), false);
  await page.locator('.shop-load-more').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelectorAll('.catalogue-card--shop').length === 35);
  assert.equal(new Set(await page.locator('.catalogue-card--shop h3').allTextContents()).size, 35);
  await categoryNav.getByRole('button', { name: 'Bags', exact: true }).click();
  await page.waitForFunction(() => document.querySelectorAll('.catalogue-card--shop').length === 7);
  assert.equal(await page.locator('.shop-load-more').count(), 0);
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll('.catalogue-card--shop').length === 7);
  await page.goto(origin + '/shop?category=bags&min=450&max=500&availability=made_to_order');
  await page.waitForFunction(() => document.querySelectorAll('.catalogue-card--shop').length === 4);
  await page.goto(origin + '/shop?category=bags&availability=in_stock');
  await page.getByRole('heading', { name: 'No creations found' }).waitFor();
  await page.getByRole('button', { name: 'Clear Filters', exact: true }).click();
  await page.waitForFunction(() => document.querySelectorAll('.catalogue-card--shop').length === 20);
  await page.getByLabel('Sort by').selectOption('newest');
  await page.waitForFunction(() => document.querySelector('.catalogue-card--shop h3')?.textContent === 'Rasta Crochet Hat & Earring Set');
  await page.setViewportSize({ width: 375, height: 900 });

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
  await page.locator('.showcase-track--products .catalogue-card').first().waitFor();
  assert.equal(await page.locator('.showcase-track--products .catalogue-card').count(), 5);
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const productTrack = page.locator('.showcase-track--products');
    const sizing = await productTrack.evaluate(element => {
      const card = element.querySelector('.catalogue-card--showcase');
      const image = card.querySelector('.product-photo-link img');
      const cardRect = card.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      const trackStyle = getComputedStyle(element);
      return {
        cardWidth: cardRect.width,
        imageWidth: imageRect.width,
        imageHeight: imageRect.height,
        columnWidth: trackStyle.gridAutoColumns,
        trackWidth: element.clientWidth,
      };
    });
    assert.ok(Math.abs(sizing.imageWidth - sizing.imageHeight) <= 1, `Featured image should be square at ${width}px`);
    if (width === 375) assert.ok(Math.abs(sizing.cardWidth - sizing.trackWidth) <= 3, 'Mobile featured cards should scroll one at a time');
  }
  assert.equal(await page.locator('.showcase-track--services .catalogue-card').count(), 6);
  assert.equal(await page.locator('.campaign-hero img').getAttribute('fetchpriority'), 'high');
  assert.equal(await page.locator('.campaign-hero img').getAttribute('loading'), null);
  assert.equal(await page.locator('.hero-signature').count(), 0);
  assert.equal(await page.locator('.campaign-hero').getByRole('link', { name: 'Shop Creations' }).getAttribute('href'), '/shop');
  assert.equal(await page.locator('.campaign-hero').getByRole('link', { name: 'Book Hair Services' }).getAttribute('href'), '/hair-services');
  await page.setViewportSize({ width: 375, height: 900 });
  for (const selector of ['.showcase-track--products', '.showcase-track--services', '.social-gallery__track']) {
    const track = page.locator(selector);
    assert.ok(await track.evaluate(element => element.scrollWidth > element.clientWidth), `Mobile scrolling: ${selector}`);
    await track.evaluate(element => { element.scrollLeft = element.clientWidth; });
    await page.waitForTimeout(150);
    assert.ok(await track.evaluate(element => element.scrollLeft > 0));
    await track.evaluate(element => { element.scrollLeft = 0; });
  }
  for (const [selector, parameter] of [['.showcase-track--products', 'creation'], ['.showcase-track--services', 'service']]) {
    const links = await page.locator(`${selector} a`).evaluateAll(elements => elements.map(element => element.getAttribute('href')));
    for (const href of links) {
      assert.match(href, new RegExp(`^/contact\\?${parameter}=`));
      await page.goto(origin + href);
      await page.locator('h1').waitFor();
      const whatsapp = new URL(await page.getByRole('link', { name: 'Chat on WhatsApp', exact: false }).getAttribute('href'));
      assert.equal(whatsapp.pathname, '/27762123234');
      assert.ok(whatsapp.searchParams.get('text').includes(new URL(origin + href).searchParams.get(parameter)));
    }
    await page.goto(origin);
    await page.locator('.showcase-track--products .catalogue-card').first().waitFor();
  }
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).getAttribute('aria-expanded'), 'false');
  assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).evaluate(element => element === document.activeElement), true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.campaign-contact').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('.journey-card').first().evaluate(element => getComputedStyle(element).transitionDuration), '0s');
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
    await Promise.all(Array.from(document.images, image => image.decode()));
    await document.fonts.ready;
  });
  assert.equal(await page.evaluate(() => Array.from(document.images).every(image => image.complete && image.naturalWidth > 0)), true);
  assert.equal(await page.evaluate(() => document.fonts.check('16px "DM Sans"')), true);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true, animations: 'disabled' });
  await page.screenshot({ path: 'test-results/hero-mobile.png', animations: 'disabled' });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true, animations: 'disabled' });
  await page.screenshot({ path: 'test-results/hero-desktop.png', animations: 'disabled' });
  await page.locator('.creations-preview').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/collections-desktop.png', animations: 'disabled' });
  assert.deepEqual(errors, [], `Browser console errors: ${errors.join('\n')}`);
  console.log('Browser checks passed: routes at 375/768/1024/1440/1920px; hero and loaded images; product/service enquiries; WhatsApp; mobile scrolling; keyboard menu; reduced motion; admin protection; persisted cart; no console errors.');
} finally {
  await browser?.close();
  server.kill();
}
