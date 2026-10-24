import ProductCard from './ProductCard';
export default function ProductGrid({ products }) { return <div className="catalogue-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div>; }
