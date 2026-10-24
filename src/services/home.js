import { isSupabaseConfigured } from '../lib/supabase';
import { listCatalogue } from './catalogue';
import { previewServices } from '../data/homePreview';
import { collectionProducts } from '../data/products';

export async function getHomeCatalogue(kind) {
  const limit = kind === 'products' ? 5 : 6;
  if (kind === 'products' && !isSupabaseConfigured) return { items: collectionProducts.slice(0, limit), preview: true };
  if (isSupabaseConfigured) {
    const featured = await listCatalogue(kind, { featured: true });
    const records = featured.length ? featured : await listCatalogue(kind);
    if (records.length || kind === 'products') return { items: records.slice(0, limit), preview: false };
    // An empty catalogue can use editorial previews; a failed request must surface.
  }
  return { items: previewServices, preview: true };
}
