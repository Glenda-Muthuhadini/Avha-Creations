import test from 'node:test';
import assert from 'node:assert/strict';
import { cartReducer, normalizeCart, productToCartItem, subtotalCents, checkoutItems } from '../src/utils/cart.js';
import { formatRand } from '../src/utils/money.js';
import { orderWhatsAppUrl } from '../src/utils/whatsapp.js';

const product = { id: '11111111-1111-4111-8111-111111111111', name: 'Crochet bag', slug: 'crochet-bag', price: 450 };
test('cart adds, combines, bounds quantity, updates and removes selections', () => {
  let cart = cartReducer([], { type: 'add', item: productToCartItem(product) });
  cart = cartReducer(cart, { type: 'add', item: productToCartItem(product, 99) });
  assert.equal(cart[0].quantity, 99);
  cart = cartReducer(cart, { type: 'quantity', id: product.id, quantity: 2 });
  assert.equal(subtotalCents(cart), 90000);
  assert.deepEqual(checkoutItems(cart), [{ product_id: product.id, quantity: 2 }]);
  assert.equal(cartReducer(cart, { type: 'quantity', id: product.id, quantity: -3 })[0].quantity, 2);
  assert.deepEqual(cartReducer(cart, { type: 'remove', id: product.id }), []);
});
test('cart rejects corrupted local data and strips unneeded persisted properties', () => {
  const item = productToCartItem(product);
  assert.deepEqual(normalizeCart({}), []);
  assert.deepEqual(normalizeCart([null, {}, { ...item, quantity: 1.5 }, { ...item, unitPriceCents: -1 }]), []);
  assert.deepEqual(normalizeCart([{ ...item, secret: 'discard' }, item]), [item]);
});
test('Rand formatting and decimal calculations retain cents', () => {
  assert.equal(formatRand(1250), 'R1,250');
  assert.equal(formatRand(250), 'R250');
  assert.equal(subtotalCents([productToCartItem({ ...product, price: 10.15 }, 3)]), 3045);
});
test('WhatsApp handoff uses saved order snapshots and configured number', () => {
  const order = { order_number: 'AVHA-1047', customer_name: 'Customer Name', total: 610, delivery_fee: 100, fulfilment_method: 'delivery', order_items: [
    { product_name: 'Crochet Bag', quantity: 1, total_price: 450 },
    { product_name: 'Beaded Earrings', quantity: 2, total_price: 60 },
  ] };
  const url = new URL(orderWhatsAppUrl(order, '+27 12 345 6789'));
  assert.equal(url.pathname, '/27123456789');
  assert.match(url.searchParams.get('text'), /Beaded Earrings × 2 — R60/);
  assert.match(url.searchParams.get('text'), /Total: R610/);
  assert.match(url.searchParams.get('text'), /Reference: AVHA-1047/);
  assert.throws(() => orderWhatsAppUrl(null, '27123456789'));
  assert.throws(() => orderWhatsAppUrl(order, ''));
});
