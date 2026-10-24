import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getAdminOrder } from '../../services/admin';
import { useResource } from '../../hooks/useResource';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ErrorState, EmptyState, LoadingState } from '../../components/common/States';
import StatusBadge from '../../components/admin/StatusBadge';
import Price from '../../components/shop/Price';
export default function OrderDetailPage() {
  const { id } = useParams();
  usePageTitle('Order details');
  const load = useCallback(() => getAdminOrder(id), [id]);
  const { data, loading, error, retry } = useResource(load);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} retry={retry} />;
  if (!data) return <EmptyState title="Order not found." to="/admin/orders" action="Back to orders">Check the order link and try again.</EmptyState>;
  return <><p className="eyebrow">Order details</p><h1>{data.order_number}</h1><div className="panel"><StatusBadge status={data.payment_status} /> <StatusBadge status={data.order_status} /><p>{data.customer_name}</p><p>{data.customer_phone}</p><ul>{data.order_items.map(item => <li key={item.id}>{item.product_name} × {item.quantity} — <Price value={item.total_price} /></li>)}</ul><p>Total: <Price value={data.total} /></p><p className="muted">Payment review, secure proof viewing and fulfilment controls will be added in the next stage.</p></div></>;
}
