import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import Button from '../../components/common/Button';
import { EmptyState } from '../../components/common/States';
import Price from '../../components/shop/Price';
import QuantitySelector from '../../components/shop/QuantitySelector';
import { useCart } from '../../context/CartContext';
import { usePageTitle } from '../../hooks/usePageTitle';
export default function CartPage() {
  usePageTitle('Your bag');
  const { items, subtotalCents, remove, setQuantity, storageError } = useCart();
  return <PageContainer eyebrow="Your collection" title="A bag full of possibility.">
    {storageError && <p role="alert">{storageError}</p>}{!items.length ? <EmptyState title="Your bag is waiting for a little artistry." to="/shop" action="Explore creations">Find a handmade piece that feels like you.</EmptyState> : <div className="cart-layout"><ul className="cart-items">{items.map(item => <li key={item.id} className="cart-item"><div><Link to={`/shop/${item.slug}`}><h2>{item.name}</h2></Link><Price value={item.unitPriceCents / 100} /></div><QuantitySelector quantity={item.quantity} label={`quantity for ${item.name}`} onChange={quantity => setQuantity(item.id, quantity)} /><div><Price value={item.unitPriceCents * item.quantity / 100} /><button className="text-button" onClick={() => remove(item.id)}>Remove<span className="sr-only"> {item.name}</span></button></div></li>)}</ul><aside className="panel cart-summary"><h2>Your selection</h2><div className="summary-row"><span>Subtotal</span><Price value={subtotalCents / 100} /></div><div className="summary-row"><span>Delivery</span><span>At checkout</span></div><p className="muted">Estimated prices. Availability, delivery and the final total will be checked before placing an order.</p><Button to="/checkout">Continue to checkout →</Button><Link to="/shop">Continue shopping</Link></aside></div>}
  </PageContainer>;
}
