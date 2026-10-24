import { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext(null);
const KEY = 'avha:wishlist:v1';
export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(stored) ? [...new Set(stored.filter(id => typeof id === 'string'))].slice(0, 500) : [];
    } catch { return []; }
  });
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(ids)); setStorageError(''); }
    catch { setStorageError('Your wishlist is saved for this visit only.'); }
  }, [ids]);
  return <WishlistContext.Provider value={{ ids, storageError, toggle: id => setIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id].slice(-500)) }}>{children}</WishlistContext.Provider>;
}
export const useWishlist = () => useContext(WishlistContext);
