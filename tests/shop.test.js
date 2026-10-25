import test from 'node:test';
import assert from 'node:assert/strict';
import { readShopFilters, writeShopFilters, filterLocalProducts, buildShopQuery, PAGE_SIZE } from '../src/utils/shop.js';
import { categoryPresentation } from '../src/data/shopCategories.js';
import { collectionProducts } from '../src/data/products.js';
import { existsSync } from 'node:fs';

test('catalogue photo groups use existing assets and keep alternate views in one product', () => {
  assert.equal(new Set(collectionProducts.map(product => product.slug)).size, collectionProducts.length);
  const galleries = collectionProducts.filter(product => product.images.length > 1);
  assert.deepEqual(galleries.map(product => product.slug), ['blue-yellow-crochet-sunhat', 'mustard-crochet-hat-scarf-set']);
  for (const product of collectionProducts) {
    for (const image of [...product.images, product.original_image]) {
      assert.ok(existsSync(new URL(`../public${decodeURIComponent(image)}`, import.meta.url)), `Missing ${image}`);
    }
  }
});

test('the Dresses tile replaces Accessories, even when database categories still contain accessories', () => {
  const categories = categoryPresentation([{ id: 'accessories-id', slug: 'accessories', name: 'Accessories' }]);
  const dresses = categories.find(category => category.slug === 'dresses');
  assert.equal(dresses.name, 'Dresses');
  assert.equal(categories.some(category => category.slug === 'accessories'), false);
  assert.match(dresses.image, /pastel-rainbow-crochet-dress/);
});

test('shop URL state normalizes invalid input and round-trips selections', () => {
  const filters = readShopFilters(new URLSearchParams('category=bags&category=jewellery&category=bags&min=20&max=500&availability=in_stock&availability=made_to_order&sort=price-desc&page=2'));
  assert.deepEqual(readShopFilters(writeShopFilters(filters)), filters);
  assert.deepEqual(filters.categories, ['bags', 'jewellery']);
  const invalid = readShopFilters(new URLSearchParams('min=-50&max=garbage&page=Infinity&sort=price;drop&availability=anything&category=bad%22'));
  assert.equal(invalid.min, 0);
  assert.equal(invalid.max, 1500);
  assert.equal(invalid.page, 1);
  assert.equal(invalid.sort, 'featured');
  assert.deepEqual(invalid.availability, []);
  assert.deepEqual(invalid.categories, []);
});

test('local supplied collection filters category unions, prices and availability without inventing inventory', () => {
  const run = query => filterLocalProducts(collectionProducts, readShopFilters(new URLSearchParams(query)));
  assert.equal(run('category=bags').total, 7);
  assert.equal(run('category=bags&category=jewellery').total, 10);
  const dresses = run('category=dresses');
  assert.equal(dresses.total, 6);
  assert.deepEqual(dresses.items.map(item => item.slug), [
    'fuchsia-crochet-fringe-dress',
    'pastel-rainbow-crochet-dress',
    'vibrant-orange-crochet-fringe-dress',
    'white-crochet-fringe-dress',
    'red-ribbed-crochet-dress',
    'emerald-crochet-baby-dress-set',
  ]);
  assert.equal(run('max=40').total, 3);
  assert.equal(run('availability=in_stock').total, 0);
  assert.equal(run('availability=made_to_order').total, 35);
  assert.equal(run('category=unknown').total, 0);
  assert.equal(run('min=500').total, 14);
  assert.deepEqual(run('sort=price-asc').items.map(item => item.price), collectionProducts.map(item => item.price).sort((a, b) => a - b).slice(0, PAGE_SIZE));
  assert.ok(run('').items.every(item => item.preview && item.stock_status === 'made_to_order'));
});

test('the expanded local catalogue loads 20 products first, then the remaining 15', () => {
  const page = value => filterLocalProducts(collectionProducts, readShopFilters(new URLSearchParams(`page=${value}`)));
  assert.equal(collectionProducts.length, 35);
  assert.equal(page(1).items.length, PAGE_SIZE);
  assert.equal(page(1).items.length, 20);
  assert.equal(page(2).items.length, 15);
  assert.equal(page(3).items.length, 0);
  assert.equal(new Set([...page(1).items, ...page(2).items].map(item => item.id)).size, 35);
  assert.equal(page(3).total, 35);
});

test('category, price and availability filters combine and newest uses catalogue order without dates', () => {
  const filters = readShopFilters(new URLSearchParams('category=bags&min=450&max=500&availability=made_to_order&sort=price-desc'));
  const result = filterLocalProducts(collectionProducts, filters);
  assert.equal(result.total, 5);
  assert.ok(result.items.every(item => item.categories.includes('bags') && item.price >= 450 && item.price <= 500 && item.stock_status === 'made_to_order'));
  const newest = filterLocalProducts(collectionProducts, readShopFilters(new URLSearchParams('sort=newest')));
  assert.equal(newest.items[0].slug, 'rasta-crochet-hat-earring-set');
  const dated = collectionProducts.slice(0, 2).map((item, i) => ({ ...item, created_at: `2026-10-${i ? '01' : '25'}` }));
  assert.equal(filterLocalProducts(dated, readShopFilters(new URLSearchParams('sort=newest'))).items[0].id, dated[0].id);
});

test('Supabase queries use active-only reads, server filtering and deterministic 20-item pagination', () => {
  const calls = [];
  const query = new Proxy({}, { get: (_, method) => (...args) => { calls.push([method, ...args]); return query; } });
  const filters = readShopFilters(new URLSearchParams('category=bags&min=100&max=700&availability=in_stock&sort=price-asc&page=3'));
  assert.equal(buildShopQuery(query, filters, [{ id: 'category-id', slug: 'bags' }]), query);
  assert.ok(calls.some(call => call[0] === 'eq' && call[1] === 'active' && call[2] === true));
  assert.ok(calls.some(call => call[0] === 'in' && call[1] === 'category_id' && call[2][0] === 'category-id'));
  assert.ok(calls.some(call => call[0] === 'in' && call[1] === 'stock_status' && call[2][0] === 'in_stock'));
  assert.ok(calls.some(call => call[0] === 'gte' && call[2] === 100));
  assert.ok(calls.some(call => call[0] === 'lte' && call[2] === 700));
  assert.deepEqual(calls.at(-1), ['range', 2 * PAGE_SIZE, 3 * PAGE_SIZE - 1]);
  assert.deepEqual(calls.at(-2), ['order', 'id']);
  assert.equal(buildShopQuery(query, filters, []), null);
});

test('Supabase Dresses filter finds dress products even when no Dresses category row exists', () => {
  const calls = [];
  const query = new Proxy({}, { get: (_, method) => (...args) => { calls.push([method, ...args]); return query; } });
  const filters = readShopFilters(new URLSearchParams('category=dresses'));
  assert.equal(buildShopQuery(query, filters, [{ id: 'accessories-id', slug: 'accessories' }]), query);
  assert.ok(calls.some(call => call[0] === 'or' && call[1] === 'name.ilike.%dress%'));
  assert.equal(calls.some(call => call[0] === 'in' && call[1] === 'category_id'), false);
});

test('pagination and default open-ended upper price handle retain premium products', () => {
  const items = Array.from({ length: 28 }, (_, index) => ({ ...collectionProducts[0], id: `item-${index}`, price: index === 0 ? 2000 : 250, name: `Creation ${index}`, active: index !== 1 }));
  const result = filterLocalProducts(items, readShopFilters(new URLSearchParams('page=2')));
  assert.equal(result.total, 27);
  assert.equal(result.items.length, 7);
  const firstPage = filterLocalProducts(items, readShopFilters(new URLSearchParams()));
  assert.ok(firstPage.items.some(item => item.price === 2000));
  assert.equal(filterLocalProducts(items, readShopFilters(new URLSearchParams('max=1490'))).total, 26);
});
