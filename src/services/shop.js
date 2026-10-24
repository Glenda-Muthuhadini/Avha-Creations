import { isSupabaseConfigured, requireSupabase } from '../lib/supabase';
import { collectionProducts } from '../data/products';
import { shopCategories } from '../data/shopCategories';
import { buildShopQuery, filterLocalProducts } from '../utils/shop';

export async function getShopCategories() {
  if (!isSupabaseConfigured) return shopCategories;
  const { data, error } = await requireSupabase().from('categories').select('id,name,slug').eq('active', true).order('name');
  if (error) throw error;
  return data;
}

export async function getShopProducts(filters, categories) {
  if (!isSupabaseConfigured) return filterLocalProducts(collectionProducts, filters);
  const query = buildShopQuery(requireSupabase(), filters, categories);
  if (!query) return { items: [], total: 0, preview: false };
  const { data, count, error } = await query;
  if (error) throw error;
  return { items: data, total: count || 0, preview: false };
}
