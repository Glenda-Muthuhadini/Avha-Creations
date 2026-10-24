import { useState } from 'react';
import Icon from '../common/Icon';

export default function ProductImage({ product, ...props }) {
  const [failed, setFailed] = useState(false);
  if (failed || !product.images?.[0]) return <div className="product-image-fallback" role="img" aria-label={`${product.name}, photograph coming soon`}><Icon name="flower" size={48} /><span>AVHA CREATIONS</span><small>Photograph coming soon</small></div>;
  return <img src={product.images[0]} srcSet={product.image_srcset} sizes="(min-width: 1100px) 23vw, (min-width: 700px) 30vw, 48vw" alt={product.name} loading="lazy" decoding="async" width="800" height="900" onError={() => setFailed(true)} {...props} />;
}
