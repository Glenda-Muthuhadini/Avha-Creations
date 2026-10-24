import { Link, NavLink } from 'react-router-dom';
const routes = [['/admin', 'Overview'], ['/admin/products', 'Products'], ['/admin/categories', 'Categories'], ['/admin/services', 'Hair services'], ['/admin/orders', 'Orders'], ['/admin/settings', 'Store settings']];
export default function AdminSidebar() {
  return <aside className="admin-sidebar"><Link to="/" className="brand"><span>AVHA</span><small>BUSINESS STUDIO</small></Link><nav aria-label="Admin navigation">{routes.map(([to, name]) => <NavLink key={to} to={to} end={to === '/admin'}>{name}</NavLink>)}</nav><Link className="subtle-link" to="/">← Visit storefront</Link></aside>;
}
