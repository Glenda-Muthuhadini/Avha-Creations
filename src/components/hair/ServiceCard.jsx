import { Link } from 'react-router-dom';
import Price from '../shop/Price';
export default function ServiceCard({ service }) {
  return <article className="catalogue-card"><Link to={`/hair-services/${service.slug}`}>
    {service.images?.[0] ? <img src={service.images[0]} alt={service.name} loading="lazy" /> : <div className="image-placeholder" aria-hidden="true">✧</div>}
    <div className="card-content"><h3>{service.name}</h3>{service.price_from !== null ? <Price value={service.price_from} from /> : <span>Price on consultation</span>}</div>
  </Link></article>;
}
