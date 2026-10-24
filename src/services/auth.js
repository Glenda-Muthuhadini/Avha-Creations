import { requireSupabase } from '../lib/supabase';
export async function isCurrentUserAdmin() {
  const { data, error } = await requireSupabase().rpc('is_admin');
  if (error) throw error;
  return data === true;
}
export async function signIn(email, password) {
  const { error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
}
export async function signOut() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}
