import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Price from './Price';
import ProductGallery from './ProductGallery';
import Icon from '../common/Icon';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useBusiness } from '../../context/BusinessContext';
import { enquiryUrl } from '../../config/business';
export default function ProductCard({ product, variant = 'default' }) {
  const shop = variant === 'shop';
  const to = product.preview && !shop ? `/contact?creation=${encodeURIComponent(product.name)}` : `/shop/${product.slug}`;
  return <article className={`catalogue-card catalogue-card--${variant}`}>
    <ProductGallery key={product.id} product={product} to={to} />
    {shop && <WishlistButton product={product} />}
    <div className="card-content"><Link to={to}><h3>{product.name}</h3></Link>{product.price == null ? <span className="price">Enquire for pricing</span> : <Price value={product.price} from={product.preview} unit={product.price_unit} />}
      {shop && <ProductActions product={product} />}
    </div>
  </article>;
}

function WishlistButton({ product }) {
  const { ids, toggle } = useWishlist();
  const saved = ids.includes(product.id);
  return <button type="button" className={`wishlist-button ${saved ? 'is-saved' : ''}`} aria-pressed={saved} aria-label={`${saved ? 'Remove' : 'Add'} ${product.name} ${saved ? 'from' : 'to'} wishlist`} onClick={() => toggle(product.id)}><Icon name="heart" size={20} /></button>;
}

export function ProductActions({ product }) {
  const { add } = useCart();
  const { settings } = useBusiness();
  const [message, setMessage] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const out = product.stock_status === 'out_of_stock';
  const enquiry = product.preview || product.stock_status !== 'in_stock';
  const whatsapp = enquiryUrl(settings.whatsapp_number, `Hi AVHA, I'd like to enquire about ${product.name}.`);
  if (!out && enquiry) return <div className="product-actions"><span className="product-stock">Made to order</span>{whatsapp ? <a className="button product-add" href={whatsapp} target="_blank" rel="noreferrer">Order Now</a> : <Link className="button product-add" to={`/contact?creation=${encodeURIComponent(product.name)}`}>Order Now</Link>}</div>;
  return <div className="product-actions"><span className={`product-stock ${out ? 'product-stock--out' : ''}`}>{out ? 'Out of stock' : 'In stock'}</span><button type="button" className="button product-add" disabled={out} onClick={() => {
    try {
      add(product, 1);
      setMessage('Added');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(''), 2000);
    } catch { setMessage('Please try again'); }
  }}><Icon name="cart" size={15} />{out ? 'Out of Stock' : message || 'Add to Cart'}</button><span className="sr-only" role="status">{message === 'Added' ? `${product.name} added to your bag.` : message}</span></div>;
}
