import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
export default function PublicLayout() {
  const { pathname } = useLocation();
  const main = useRef(null);
  useEffect(() => { window.scrollTo(0, 0); main.current?.focus({ preventScroll: true }); }, [pathname]);
  return <><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content" ref={main} tabIndex={-1}><Outlet /></main><Footer /></>;
}
