import test from 'node:test';
import assert from 'node:assert/strict';
import { readShopFilters, writeShopFilters, filterLocalProducts, buildShopQuery, PAGE_SIZE } from '../src/utils/shop.js';
import { collectionProducts } from '../src/data/products.js';

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
  assert.equal(run('category=bags').total, 4);
  assert.equal(run('category=bags&category=jewellery').total, 6);
  assert.equal(run('max=40').total, 2);
  assert.equal(run('availability=in_stock').total, 0);
  assert.equal(run('availability=made_to_order').total, 9);
  assert.equal(run('category=unknown').total, 0);
  assert.equal(run('min=500').total, 0);
  assert.deepEqual(run('sort=price-asc').items.map(item => item.price), [30, 30, 80, 200, 250, 450, 450, 450, 450]);
  assert.ok(run('').items.every(item => item.preview && item.stock_status === 'made_to_order'));
});

test('Supabase queries use active-only reads, server filtering and deterministic 12-item pagination', () => {
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

test('pagination and default open-ended upper price handle retain premium products', () => {
  const items = Array.from({ length: 28 }, (_, index) => ({ ...collectionProducts[0], id: `item-${index}`, price: index === 0 ? 2000 : 250, name: `Creation ${index}`, active: index !== 1 }));
  const result = filterLocalProducts(items, readShopFilters(new URLSearchParams('page=2')));
  assert.equal(result.total, 27);
  assert.equal(result.items.length, 12);
  const firstPage = filterLocalProducts(items, readShopFilters(new URLSearchParams()));
  assert.ok(firstPage.items.some(item => item.price === 2000));
  assert.equal(filterLocalProducts(items, readShopFilters(new URLSearchParams('max=1490'))).total, 26);
});
