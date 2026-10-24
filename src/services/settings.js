import { requireSupabase } from '../lib/supabase';
export async function getPublicSettings() {
  const { data, error } = await requireSupabase().from('store_settings').select('*').eq('id', true).maybeSingle();
  if (error) throw error;
  return data;
}
