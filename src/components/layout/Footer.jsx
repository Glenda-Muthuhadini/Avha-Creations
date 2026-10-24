import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks';
import BrandLogo from '../common/BrandLogo';
export default function Footer() {
  return <footer className="site-footer"><div className="container footer-grid">
    <div className="footer-intro"><BrandLogo /><p>Made with care.<br />Worn with confidence.</p></div>
    <nav aria-label="Footer navigation"><p className="eyebrow">Explore AVHA</p><Link to="/shop">Shop Creations</Link><Link to="/hair-services">Hair Artistry</Link><Link to="/about">Our Story</Link><Link to="/contact">Contact & appointments</Link></nav>
    <div><p className="eyebrow">Stay connected</p><SocialLinks text /></div>
  </div><div className="container footer-bottom"><span>© {new Date().getFullYear()} AVHA CREATIONS</span><span>Designed and developed by <a href="https://hadiniholdings.co.za" target="_blank" rel="noreferrer">Hadini Holdings</a>.</span></div></footer>;
}
