import { Link } from 'react-router-dom';
import Price from '../shop/Price';
export default function ServiceCard({ service, variant = 'default' }) {
  const to = service.preview ? `/contact?service=${encodeURIComponent(service.name)}` : `/hair-services/${service.slug}`;
  if (variant === 'text') return <article className="catalogue-card catalogue-card--service-text"><Link to={to}><h3>{service.name}</h3></Link></article>;
  return <article className={`catalogue-card catalogue-card--${variant}`}><Link to={to}>
    {service.images?.[0] ? <img src={service.images[0]} srcSet={service.image_srcset} sizes="(min-width: 1024px) 22vw, 50vw" alt={service.image_alt || service.name} loading="lazy" /> : <div className="image-placeholder" aria-hidden="true">✧</div>}
    <div className="card-content"><h3>{service.name}</h3>{variant !== 'editorial' && (service.price_from !== null ? <Price value={service.price_from} from /> : <span>Price on consultation</span>)}</div>
  </Link></article>;
}
