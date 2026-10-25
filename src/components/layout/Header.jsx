import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import SocialLinks from './SocialLinks';
import BrandLogo from '../common/BrandLogo';
import { useBusiness } from '../../context/BusinessContext';
import { useWishlist } from '../../context/WishlistContext';
import Icon from '../common/Icon';

const links = [['/', 'Home'], ['/shop', 'Shop'], ['/hair-services', 'Hair artistry'], ['/about', 'Our story'], ['/contact', 'Contact']];
export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { whatsappUrl } = useBusiness();
  const { ids } = useWishlist();
  const toggle = useRef(null);
  const menuOpen = open === location.key;
  useEffect(() => {
    if (!menuOpen) return;
    function escape(event) { if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); } }
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [menuOpen]);
  return <header className="site-header"><div className="container header-inner">
    <BrandLogo />
    <button ref={toggle} className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setOpen(menuOpen ? false : location.key)}>{menuOpen ? 'Close' : 'Menu'}</button>
    <nav id="main-navigation" className={menuOpen ? 'navigation is-open' : 'navigation'} aria-label="Main navigation">{links.map(([to, label]) => <NavLink key={to} end={to === '/'} to={to}>{label}</NavLink>)}<div className="mobile-socials"><SocialLinks />{whatsappUrl ? <a className="button" href={whatsappUrl} target="_blank" rel="noreferrer">Book Now</a> : <Button to="/contact">Book Now</Button>}</div></nav>
    <div className="header-actions"><NavLink to="/favorites" className="favorites-link" aria-label={`Favorites, ${ids.length} saved ${ids.length === 1 ? 'product' : 'products'}`}><Icon name="heart" size={23} /><span className="favorites-count" aria-hidden="true">{ids.length}</span></NavLink><div className="header-socials"><SocialLinks /></div>{whatsappUrl ? <a className="button header-book" href={whatsappUrl} target="_blank" rel="noreferrer">Book Now</a> : <Button className="header-book" to="/contact">Book Now</Button>}</div>
  </div></header>;
}
