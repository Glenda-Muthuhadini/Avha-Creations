import { isSupabaseConfigured, requireSupabase } from '../lib/supabase';
import { collectionProducts } from '../data/products';

const tables = { products: 'products', categories: 'categories', services: 'hair_services' };
export async function listCatalogue(kind, { featured = false } = {}) {
  if (!tables[kind]) throw new Error('Unknown catalogue.');
  let query = requireSupabase().from(tables[kind]).select('*').eq('active', true).order('name').limit(100);
  if (featured) query = query.eq('featured', true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
export async function getCatalogueItem(kind, slug) {
  if (!['products', 'services'].includes(kind)) throw new Error('Unknown catalogue.');
  if (kind === 'products' && !isSupabaseConfigured) return collectionProducts.find(product => product.slug === slug) || null;
  const { data, error } = await requireSupabase().from(tables[kind]).select('*').eq('slug', slug).eq('active', true).maybeSingle();
  if (error) throw error;
  return data;
}
