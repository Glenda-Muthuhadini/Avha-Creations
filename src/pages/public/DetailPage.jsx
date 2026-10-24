import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import Button from '../../components/common/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/States';
import Price from '../../components/shop/Price';
import QuantitySelector from '../../components/shop/QuantitySelector';
import { getCatalogueItem } from '../../services/catalogue';
import { useResource } from '../../hooks/useResource';
import { usePageTitle } from '../../hooks/usePageTitle';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';

export default function DetailPage({ kind }) {
  const { slug } = useParams();
  const load = useCallback(() => getCatalogueItem(kind, slug), [kind, slug]);
  const { data, loading, error, retry } = useResource(load, isSupabaseConfigured);
  usePageTitle(data?.name || (kind === 'products' ? 'Creation' : 'Hair service'));
  return <PageContainer title={data?.name || (kind === 'products' ? 'A creation for you' : 'Personal hair artistry')}>
    {loading ? <LoadingState /> : error ? <ErrorState error={error} retry={retry} /> : !data ? <EmptyState title="This piece isn’t available." to={kind === 'products' ? '/shop' : '/hair-services'} action="Back to the collection">It may be taking a little break. Explore the collection or contact AVHA for something personal.</EmptyState> : <ItemDetails key={data.id} item={data} product={kind === 'products'} />}
  </PageContainer>;
}
function ItemDetails({ item, product }) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const { add } = useCart();
  const available = !['out_of_stock', 'made_to_order'].includes(item.stock_status);
  return <div className="detail-grid"><div className="detail-gallery">{item.images?.length ? item.images.map((src, i) => <img key={src} src={src} alt={`${item.name}, view ${i + 1}`} />) : <div className="image-placeholder">AVHA</div>}</div><div className="detail-copy"><p className="eyebrow">{product ? 'Handmade with care' : 'Crafted around you'}</p><p className="description">{item.description}</p>{(product || item.price_from !== null) && <Price value={product ? item.price : item.price_from} from={!product} />}
    {product && available ? <><QuantitySelector quantity={quantity} onChange={setQuantity} /><Button onClick={() => { add(item, quantity); setMessage('Added to your bag.'); }}>Add to bag</Button><p role="status">{message}</p>{message && <Link to="/cart">View your bag →</Link>}</> : <Button to="/contact">{product ? 'Enquire about availability' : 'Enquire about this service'} ↗</Button>}
  </div></div>;
}
