import Icon from '../common/Icon';
import { useBusiness } from '../../context/BusinessContext';

export function ShopLoadingState() {
  return <div className="shop-product-grid shop-skeletons" role="status" aria-label="Discovering creations">{Array.from({ length: 8 }, (_, index) => <div className="shop-skeleton" key={index} aria-hidden="true"><div /><span /><span /><span /></div>)}</div>;
}
export function ShopErrorState({ retry }) {
  return <div className="shop-state" role="alert"><Icon name="flower" size={40} /><h3>We couldn’t load the creations.</h3><p>Please try again in a moment.</p><button type="button" className="button" onClick={retry}>Try Again <Icon name="arrow" size={18} /></button></div>;
}
export function ShopEmptyState({ filtered, onClear }) {
  const { whatsappUrl } = useBusiness();
  return <div className="shop-state"><Icon name="flower" size={40} /><h3>{filtered ? 'No creations found' : 'New creations are coming soon.'}</h3><p>{filtered ? 'Try adjusting your filters or explore another collection.' : 'AVHA is preparing something special.'}</p>{filtered ? <button type="button" className="button" onClick={onClear}>Clear Filters</button> : <a className="button" href={whatsappUrl || '/contact'} target={whatsappUrl ? '_blank' : undefined} rel="noreferrer">Chat With Us on WhatsApp <Icon name="arrow" size={18} /></a>}</div>;
}
