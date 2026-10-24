import PageContainer from '../../components/common/PageContainer';
import { EmptyState } from '../../components/common/States';
import { usePageTitle } from '../../hooks/usePageTitle';
export default function OrderSuccessPage() {
  usePageTitle('Order information');
  return <PageContainer title="Your order, kept personal."><EmptyState title="Order information isn’t available here yet." to="/contact" action="Contact AVHA">Order details require a secure order access link. An order number alone does not give access to customer information or confirm a payment.</EmptyState></PageContainer>;
}
