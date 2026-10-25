import test from 'node:test';
import assert from 'node:assert/strict';
import { readShopFilters, writeShopFilters, filterLocalProducts, buildShopQuery, PAGE_SIZE } from '../src/utils/shop.js';
import { categoryPresentation } from '../src/data/shopCategories.js';
import { collectionProducts } from '../src/data/products.js';

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
  assert.equal(run('category=bags').total, 5);
  assert.equal(run('category=bags&category=jewellery').total, 7);
  const dresses = run('category=dresses');
  assert.equal(dresses.total, 5);
  assert.deepEqual(dresses.items.map(item => item.slug), [
    'fuchsia-crochet-fringe-dress',
    'pastel-rainbow-crochet-dress',
    'vibrant-orange-crochet-fringe-dress',
    'white-crochet-fringe-dress',
    'red-ribbed-crochet-dress',
  ]);
  assert.equal(run('max=40').total, 2);
  assert.equal(run('availability=in_stock').total, 0);
  assert.equal(run('availability=made_to_order').total, 25);
  assert.equal(run('category=unknown').total, 0);
  assert.equal(run('min=500').total, 13);
  assert.deepEqual(run('sort=price-asc').items.map(item => item.price), [30, 30, 80, 200, 250, 350, 450, 450, 450, 450, 450, 480]);
  assert.ok(run('').items.every(item => item.preview && item.stock_status === 'made_to_order'));
});

test('the expanded local catalogue loads in three 12-product pages', () => {
  const page = value => filterLocalProducts(collectionProducts, readShopFilters(new URLSearchParams(`page=${value}`)));
  assert.equal(collectionProducts.length, 25);
  assert.equal(page(1).items.length, PAGE_SIZE);
  assert.equal(page(2).items.length, PAGE_SIZE);
  assert.equal(page(3).items.length, 1);
  assert.equal(page(3).total, 25);
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
  assert.equal(result.items.length, 12);
  const firstPage = filterLocalProducts(items, readShopFilters(new URLSearchParams()));
  assert.ok(firstPage.items.some(item => item.price === 2000));
  assert.equal(filterLocalProducts(items, readShopFilters(new URLSearchParams('max=1490'))).total, 26);
});
