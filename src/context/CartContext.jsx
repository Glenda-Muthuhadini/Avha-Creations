import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { CART_KEY, cartReducer, normalizeCart, productToCartItem, subtotalCents } from '../utils/cart';

const CartContext = createContext(null);
export function CartProvider({ children }) {
  const [storageError, setStorageError] = useState('');
  const [items, dispatch] = useReducer(cartReducer, [], () => {
    try { return normalizeCart(JSON.parse(localStorage.getItem(CART_KEY) || '[]')); }
    catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); setStorageError(''); }
    catch { setStorageError('Your browser could not save this cart. Keep this tab open to retain your selections.'); }
  }, [items]);
  const value = {
    items, storageError, subtotalCents: subtotalCents(items), count: items.reduce((sum, item) => sum + item.quantity, 0),
    add: (product, quantity) => dispatch({ type: 'add', item: productToCartItem(product, quantity) }),
    remove: id => dispatch({ type: 'remove', id }),
    setQuantity: (id, quantity) => dispatch({ type: 'quantity', id, quantity }),
    clear: () => dispatch({ type: 'clear' }),
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider.');
  return value;
}
