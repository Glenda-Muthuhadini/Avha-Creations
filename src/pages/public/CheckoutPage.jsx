import PageContainer from '../../components/common/PageContainer';
import { EmptyState } from '../../components/common/States';
import { usePageTitle } from '../../hooks/usePageTitle';
export default function CheckoutPage() {
  usePageTitle('Checkout');
  return <PageContainer eyebrow="The next step" title="Made for a thoughtful checkout."><EmptyState title="Online checkout is being prepared." to="/contact" action="Contact AVHA">Your bag stays saved. Secure order creation, delivery calculations and EFT payment instructions will be available in the next stage. No order or payment has been created.</EmptyState></PageContainer>;
}
