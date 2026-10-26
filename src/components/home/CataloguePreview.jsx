import { useCallback, useId } from 'react';
import { useResource } from '../../hooks/useResource';
import { getHomeCatalogue } from '../../services/home';
import ProductCard from '../shop/ProductCard';
import ServiceCard from '../hair/ServiceCard';
import Button from '../common/Button';
import Icon from '../common/Icon';
import { ErrorState, LoadingState } from '../common/States';

export default function CataloguePreview({ kind }) {
  const products = kind === 'products';
  const titleId = useId();
  const load = useCallback(() => getHomeCatalogue(kind), [kind]);
  const { data, loading, error, retry } = useResource(load);
  return <section className={`container campaign-section catalogue-preview ${products ? 'creations-preview' : 'hair-preview'}`} aria-labelledby={titleId}>
    <header className="campaign-section__heading"><div><h2 id={titleId}>{products ? 'Featured Creations' : 'Hair Services'}</h2><p>{products ? 'Handmade pieces to complete your look.' : 'Professional, personalised and creative hair artistry.'}</p></div><Button to={products ? '/shop' : '/hair-services'} variant="outline">View All {products ? 'Products' : 'Services'} <Icon name="arrow" size={17} /></Button></header>
    {loading ? <LoadingState>Discovering {products ? 'creations' : 'hair artistry'}…</LoadingState> : error ? <ErrorState error={error} retry={retry} /> : <>
      <div className={`showcase-track ${products ? 'showcase-track--products' : 'showcase-track--services'}`} tabIndex={0} role="region" aria-label={`${products ? 'Creations' : 'Hair services'} gallery, scroll for more`}>{data?.items.map(item => products ? <ProductCard key={item.id} product={item} variant="showcase" /> : <ServiceCard key={item.id} service={item} variant="text" />)}</div>
      {data?.preview && <p className="preview-caption">{products ? 'Explore our handmade collection. Enquire for pricing and availability.' : 'Every appointment is tailored to your hair and style.'}</p>}
    </>}
  </section>;
}
