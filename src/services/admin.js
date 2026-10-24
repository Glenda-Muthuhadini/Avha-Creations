import { requireSupabase } from '../lib/supabase';
const allowed = new Set(['products', 'categories', 'hair_services', 'orders', 'store_settings', 'bank_settings']);
export async function listAdminRecords(table) {
  if (!allowed.has(table)) throw new Error('Unknown admin resource.');
  const { data, error } = await requireSupabase().from(table).select('*').limit(100);
  if (error) throw error;
  return data;
}
export async function getAdminOrder(id) {
  const { data, error } = await requireSupabase().from('orders').select('*, order_items(*), payment_proofs(*)').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}
