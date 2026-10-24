export const PAGE_SIZE = 12;
export const PRICE_LIMIT = 1500;
export const SORT_OPTIONS = [
  ['featured', 'Featured'], ['newest', 'Newest'], ['price-asc', 'Price: Low to High'],
  ['price-desc', 'Price: High to Low'], ['name', 'Name: A–Z'],
];
const unique = values => [...new Set(values)];
const number = (value, fallback) => value !== null && value !== '' && Number.isFinite(Number(value)) ? Number(value) : fallback;
export function readShopFilters(params) {
  const min = Math.max(0, Math.min(PRICE_LIMIT, number(params.get('min'), 0)));
  return {
    categories: unique(params.getAll('category').filter(value => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value))),
    min,
    max: Math.max(min, Math.min(PRICE_LIMIT, number(params.get('max'), PRICE_LIMIT))),
    availability: unique(params.getAll('availability').filter(value => ['in_stock', 'out_of_stock', 'made_to_order'].includes(value))),
    sort: SORT_OPTIONS.some(([value]) => value === params.get('sort')) ? params.get('sort') : 'featured',
    page: Math.max(1, Math.min(10000, Math.floor(number(params.get('page'), 1)))),
  };
}
export function writeShopFilters(filters) {
  const params = new URLSearchParams();
  filters.categories.forEach(value => params.append('category', value));
  if (filters.min > 0) params.set('min', filters.min);
  if (filters.max < PRICE_LIMIT) params.set('max', filters.max);
  filters.availability.forEach(value => params.append('availability', value));
  if (filters.sort !== 'featured') params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', filters.page);
  return params;
}
export const hasShopFilters = filters => filters.categories.length > 0 || filters.min > 0 || filters.max < PRICE_LIMIT || filters.availability.length > 0;
export function filterLocalProducts(products, filters) {
  const items = products.filter(product => product.active &&
    (!filters.categories.length || filters.categories.some(category => product.categories.includes(category))) &&
    Number(product.price) >= filters.min && (filters.max === PRICE_LIMIT || Number(product.price) <= filters.max) &&
    (!filters.availability.length || filters.availability.includes(product.stock_status)));
  items.sort((a, b) => {
    if (filters.sort === 'price-asc') return Number(a.price) - Number(b.price) || a.name.localeCompare(b.name);
    if (filters.sort === 'price-desc') return Number(b.price) - Number(a.price) || a.name.localeCompare(b.name);
    if (filters.sort === 'newest') return String(b.created_at || '').localeCompare(String(a.created_at || '')) || a.name.localeCompare(b.name);
    if (filters.sort === 'name') return a.name.localeCompare(b.name);
    return Number(b.featured) - Number(a.featured);
  });
  return { items: items.slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE), total: items.length, preview: true };
}

// Only known field names reach the API; URL input is never used as a column name.
export function buildShopQuery(client, filters, categories) {
  let query = client.from('products')
    .select('id,name,slug,price,images,category_id,featured,stock_status,created_at', { count: 'exact' })
    .eq('active', true).gte('price', filters.min);
  // The unadjusted upper handle means no price ceiling, including future premium pieces.
  if (filters.max < PRICE_LIMIT) query = query.lte('price', filters.max);
  if (filters.categories.length) {
    const ids = categories.filter(category => filters.categories.includes(category.slug)).map(category => category.id);
    if (!ids.length) return null;
    query = query.in('category_id', ids);
  }
  if (filters.availability.length) query = query.in('stock_status', filters.availability);
  if (filters.sort === 'featured') query = query.order('featured', { ascending: false }).order('name');
  if (filters.sort === 'newest') query = query.order('created_at', { ascending: false });
  if (filters.sort === 'price-asc') query = query.order('price', { ascending: true });
  if (filters.sort === 'price-desc') query = query.order('price', { ascending: false });
  if (filters.sort === 'name') query = query.order('name');
  return query.order('id').range((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE - 1);
}
