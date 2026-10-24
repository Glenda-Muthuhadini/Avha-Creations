import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../common/Button';

const links = [['/', 'Home'], ['/shop', 'Shop'], ['/hair-services', 'Hair artistry'], ['/about', 'Our story'], ['/contact', 'Contact']];
export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { count } = useCart();
  const menuOpen = open === location.key;
  return <header className="site-header"><div className="container header-inner">
    <Link className="brand" to="/" aria-label="AVHA Creations home"><span>AVHA</span><small>CREATIONS</small></Link>
    <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setOpen(menuOpen ? false : location.key)}>{menuOpen ? 'Close' : 'Menu'}</button>
    <nav id="main-navigation" className={menuOpen ? 'navigation is-open' : 'navigation'} aria-label="Main navigation">{links.map(([to, label]) => <NavLink key={to} end={to === '/'} to={to}>{label}</NavLink>)}</nav>
    <div className="header-actions"><Link className="cart-link" to="/cart" aria-label={`Shopping bag, ${count} items`}>Bag <span>{count}</span></Link><Button className="header-book" to="/contact">Enquire <span aria-hidden="true">↗</span></Button></div>
  </div></header>;
}
