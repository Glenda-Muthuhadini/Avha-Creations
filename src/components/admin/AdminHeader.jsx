import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../services/auth';
import Button from '../common/Button';
export default function AdminHeader() {
  const { session } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function logout() { setBusy(true); try { await signOut(); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <header className="admin-header"><div><p className="eyebrow">AVHA business studio</p><small>{session?.user.email}</small>{error && <p role="alert">{error}</p>}</div><Button variant="outline" disabled={busy} onClick={logout}>{busy ? 'Signing out…' : 'Sign out'}</Button></header>;
}
