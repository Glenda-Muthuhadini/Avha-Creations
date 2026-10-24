import { Link } from 'react-router-dom';

export default function BrandLogo({ className = '' }) {
  return <Link className={`brand brand--official ${className}`} to="/" aria-label="AVHA Creations home">
    <img src="/Dusty Rose A Monogram Logo.png" alt="AVHA CREATIONS" width="1728" height="910" decoding="async" />
  </Link>;
}
