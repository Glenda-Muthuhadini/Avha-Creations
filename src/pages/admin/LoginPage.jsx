import { useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signIn, signOut } from '../../services/auth';
import { isSupabaseConfigured } from '../../lib/supabase';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { LoadingState } from '../../components/common/States';
import { usePageTitle } from '../../hooks/usePageTitle';
import BrandLogo from '../../components/common/BrandLogo';
export default function LoginPage() {
  usePageTitle('Admin sign in');
  const { loading, session, isAdmin, error: authError } = useAuth();
  const location = useLocation();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    const form = new FormData(event.currentTarget);
    try { await signIn(form.get('email'), form.get('password')); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  if (loading) return <LoadingState>Checking your session…</LoadingState>;
  const from = location.state?.from;
  if (isAdmin) return <Navigate replace to={typeof from === 'string' && /^\/admin(?:\/|$)/.test(from) && from !== '/admin/login' ? from : '/admin'} />;
  return <main className="login-page"><BrandLogo /><section className="panel login-card"><p className="eyebrow">Business studio</p><h1>Welcome back.</h1><p>Sign in to manage your AVHA business.</p>{!isSupabaseConfigured && <p className="notice">Administrator sign in will be available once Supabase is connected. See README.md for setup.</p>}{(error || authError) && <p role="alert">{error || authError}</p>}{session ? <><p role="alert">This account does not have administrator access.</p><Button onClick={async () => { try { await signOut(); } catch (err) { setError(err.message); } }}>Sign out</Button></> : <form onSubmit={submit}><FormField id="email" label="Email address" name="email" type="email" required autoComplete="username" /><FormField id="password" label="Password" name="password" type="password" required autoComplete="current-password" /><Button type="submit" disabled={!isSupabaseConfigured || busy}>{busy ? 'Signing in…' : 'Sign in securely →'}</Button></form>}<Link className="subtle-link" to="/">← Back to the storefront</Link></section><p className="muted">For authorised AVHA administrators.</p></main>;
}
