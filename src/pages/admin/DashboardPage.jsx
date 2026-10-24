import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listAdminRecords } from '../../services/admin';
import { useResource } from '../../hooks/useResource';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ErrorState, LoadingState } from '../../components/common/States';
export default function DashboardPage() {
  usePageTitle('Business overview');
  const load = useCallback(async () => {
    const [products, services, orders] = await Promise.all(['products', 'hair_services', 'orders'].map(listAdminRecords));
    return { products, services, orders };
  }, []);
  const { data, loading, error, retry } = useResource(load);
  return <><p className="eyebrow">Your creative business</p><h1>Welcome to your studio.</h1><p>One place for your creations, clients and next chapter.</p>{loading ? <LoadingState /> : error ? <ErrorState error={error} retry={retry} /> : <div className="stats-grid">{[['products', 'Products', '/admin/products'], ['services', 'Hair services', '/admin/services'], ['orders', 'Orders', '/admin/orders']].map(([key, label, to]) => <Link to={to} className="panel stat" key={key}><span>{label}</span><strong>{data[key].length}{data[key].length === 100 ? '+' : ''}</strong><small>View {label.toLowerCase()} →</small></Link>)}</div>}<section className="panel"><h2>A considered foundation.</h2><p>Catalogue and order lists are connected to Supabase. Editing workflows, business metrics, payment verification and checkout are planned for the next stage.</p></section></>;
}
