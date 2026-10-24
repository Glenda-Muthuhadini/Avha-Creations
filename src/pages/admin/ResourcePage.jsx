import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listAdminRecords } from '../../services/admin';
import { useResource } from '../../hooks/useResource';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ErrorState, EmptyState, LoadingState } from '../../components/common/States';
import StatusBadge from '../../components/admin/StatusBadge';
import Button from '../../components/common/Button';
const resources = {
  products: { title: 'Products', table: 'products', description: 'Your handmade collection, thoughtfully organised.' },
  categories: { title: 'Categories', table: 'categories', description: 'A clear home for every kind of creation.' },
  services: { title: 'Hair services', table: 'hair_services', description: 'Your menu of personal hair artistry.' },
  orders: { title: 'Orders', table: 'orders', description: 'Customer orders and their fulfilment progress.' },
};
export default function ResourcePage({ resource }) {
  const config = resources[resource];
  usePageTitle(config.title);
  const load = useCallback(() => listAdminRecords(config.table), [config.table]);
  const { data, loading, error, retry } = useResource(load);
  return <><p className="eyebrow">Business studio</p><h1>{config.title}</h1><p>{config.description}</p>{resource === 'products' && <Button to="/admin/products/new">Product editor foundation →</Button>}{loading ? <LoadingState /> : error ? <ErrorState error={error} retry={retry} /> : !data?.length ? <EmptyState title={`No ${config.title.toLowerCase()} yet.`}>Your live records will appear here. Management workflows are being prepared.</EmptyState> : <><p className="muted">Showing up to 100 records. Search and pagination are planned.</p><ul className="record-list">{data.map(item => <li className="panel record" key={item.id}><div><h2>{resource === 'orders' ? <Link to={`/admin/orders/${item.id}`}>{item.order_number}</Link> : item.name}</h2>{resource === 'orders' ? <StatusBadge status={item.payment_status} /> : <StatusBadge status={item.active ? 'active' : 'archived'} />}</div>{resource === 'products' && <Link to={`/admin/products/${item.id}/edit`}>Open editor foundation →</Link>}</li>)}</ul></>}</>;
}
