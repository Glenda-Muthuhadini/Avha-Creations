import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { isCurrentUserAdmin } from '../services/auth';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: Boolean(supabase), session: null, isAdmin: false, error: '' });
  const revision = useRef(0);
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    async function resolve(session) {
      const request = ++revision.current;
      if (!alive) return;
      setState({ loading: true, session, isAdmin: false, error: '' });
      try {
        const admin = session ? await isCurrentUserAdmin() : false;
        if (alive && request === revision.current) setState({ loading: false, session, isAdmin: admin, error: '' });
      } catch (error) {
        if (alive && request === revision.current) setState({ loading: false, session, isAdmin: false, error: error.message });
      }
    }
    // Defer API calls outside the auth callback to avoid holding the auth lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void Promise.resolve().then(() => { if (alive) return resolve(session); });
    });
    return () => { alive = false; revision.current++; subscription.unsubscribe(); };
  }, []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
