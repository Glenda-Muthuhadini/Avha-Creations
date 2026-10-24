import { Link } from 'react-router-dom';
export default function Footer() {
  return <footer className="site-footer"><div className="container footer-grid"><div><Link to="/" className="footer-brand">AVHA CREATIONS</Link><p>Made with care. Worn with confidence.</p></div><div><p className="eyebrow">Find us</p><p>Olievenhoutbosch, Centurion<br />South Africa</p></div><div><p className="eyebrow">Let’s create your look</p><Link to="/contact">Get in touch ↗</Link><br /><Link to="/admin/login" className="subtle-link">Admin sign in</Link></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} AVHA CREATIONS</span><span>Handmade. Personal. Unmistakably you.</span></div></footer>;
}
