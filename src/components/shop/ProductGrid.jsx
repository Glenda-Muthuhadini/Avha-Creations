import ProductCard from './ProductCard';
export default function ProductGrid({ products, variant = 'default' }) { return <div className={`catalogue-grid ${variant === 'shop' ? 'shop-product-grid' : ''}`}>{products.map(product => <ProductCard key={product.id} product={product} variant={variant} />)}</div>; }
