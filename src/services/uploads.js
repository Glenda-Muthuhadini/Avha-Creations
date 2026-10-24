import { requireSupabase } from '../lib/supabase';
export async function uploadProductImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Choose a JPEG, PNG or WebP image under 5 MB.');
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
  const path = `${crypto.randomUUID()}.${extension}`;
  const client = requireSupabase();
  const { error } = await client.storage.from('product-images').upload(path, file, { upsert: false });
  if (error) throw error;
  return client.storage.from('product-images').getPublicUrl(path).data.publicUrl;
}
export async function getAdminProofUrl(path) {
  const { data, error } = await requireSupabase().storage.from('payment-proofs').createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}
