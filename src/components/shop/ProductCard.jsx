import { Link } from 'react-router-dom';
import Price from './Price';
export default function ProductCard({ product }) {
  return <article className="catalogue-card"><Link to={`/shop/${product.slug}`}>
    {product.images?.[0] ? <img src={product.images[0]} alt={product.name} loading="lazy" /> : <div className="image-placeholder" aria-hidden="true">A</div>}
    <div className="card-content"><h3>{product.name}</h3><Price value={product.price} /></div>
  </Link></article>;
}
