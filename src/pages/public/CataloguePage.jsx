import { useCallback } from 'react';
import PageContainer from '../../components/common/PageContainer';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/States';
import ProductGrid from '../../components/shop/ProductGrid';
import ServiceCard from '../../components/hair/ServiceCard';
import { useResource } from '../../hooks/useResource';
import { usePageTitle } from '../../hooks/usePageTitle';
import { listCatalogue } from '../../services/catalogue';
import { isSupabaseConfigured } from '../../lib/supabase';
import { collectionProducts } from '../../data/products';

export default function CataloguePage({ kind }) {
  const products = kind === 'products';
  const title = products ? 'Handmade creations' : 'Hair artistry';
  usePageTitle(title);
  const load = useCallback(() => products ? collectionProducts : listCatalogue(kind), [kind, products]);
  const { data, loading, error, retry } = useResource(load, products || isSupabaseConfigured);
  return <PageContainer eyebrow={products ? 'Made by hand. Chosen by you.' : 'Your hair. Your signature.'} title={title} intro={products ? 'Thoughtfully crafted accessories for everyday expression and special occasions.' : 'Personal attention, creative styling, and a look that feels like you.'}>
    {loading ? <LoadingState /> : error ? <ErrorState error={error} retry={retry} /> : !data?.length ? <EmptyState title={products ? 'Our collection is being prepared.' : 'Your next look is on its way.'} to="/contact" action="Enquire about a custom creation">{products ? 'We’re putting the finishing touches on our online collection. Get in touch to discuss handmade pieces.' : 'Our online service menu is being prepared. Speak to AVHA about your hair and styling ideas.'}</EmptyState> : products ? <ProductGrid products={data} /> : <div className="catalogue-grid">{data.map(service => <ServiceCard key={service.id} service={service} />)}</div>}
  </PageContainer>;
}
