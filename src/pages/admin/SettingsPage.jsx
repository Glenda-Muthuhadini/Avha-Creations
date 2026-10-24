import { EmptyState } from '../../components/common/States';
import { usePageTitle } from '../../hooks/usePageTitle';
export default function SettingsPage() {
  usePageTitle('Store settings');
  return <><p className="eyebrow">Your business, your details</p><h1>Store settings.</h1><EmptyState title="Your settings workspace is ready to grow.">Business contacts, WhatsApp and delivery fees will be managed here. Banking details have a separate admin-only table and will have a dedicated protected editor.</EmptyState></>;
}
