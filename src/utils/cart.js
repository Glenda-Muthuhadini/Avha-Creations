import { toCents } from './money.js';

export const CART_KEY = 'avha:cart:v1';
export const MAX_QUANTITY = 99;
export function validQuantity(value) {
  return Number.isInteger(value) && value > 0 && value <= MAX_QUANTITY;
}
export function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.slice(0, 100).filter(item => {
    if (!item || typeof item.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(item.id) || seen.has(item.id) ||
      typeof item.name !== 'string' || typeof item.slug !== 'string' || !validQuantity(item.quantity) ||
      !Number.isSafeInteger(item.unitPriceCents) || item.unitPriceCents < 0) return false;
    seen.add(item.id);
    return true;
  }).map(({ id, name, slug, quantity, unitPriceCents }) => ({ id, name, slug, quantity, unitPriceCents }));
}
export function productToCartItem(product, quantity = 1) {
  if (!validQuantity(quantity)) throw new Error('Choose a quantity between 1 and 99.');
  return { id: product.id, name: product.name, slug: product.slug, unitPriceCents: toCents(product.price), quantity };
}
export function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const existing = state.find(item => item.id === action.item.id);
      if (!existing) return normalizeCart([...state, action.item]);
      return state.map(item => item.id === action.item.id ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + action.item.quantity) } : item);
    }
    case 'quantity': return validQuantity(action.quantity) ? state.map(item => item.id === action.id ? { ...item, quantity: action.quantity } : item) : state;
    case 'remove': return state.filter(item => item.id !== action.id);
    case 'clear': return [];
    default: return state;
  }
}
export const subtotalCents = items => items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
// Only identity and quantity cross the eventual checkout trust boundary.
export const checkoutItems = items => items.map(({ id, quantity }) => ({ product_id: id, quantity }));
