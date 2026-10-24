import { useParams } from 'react-router-dom';
import { EmptyState } from '../../components/common/States';
import { usePageTitle } from '../../hooks/usePageTitle';
export default function ProductEditorPage() {
  const { id } = useParams();
  usePageTitle(id ? 'Edit product' : 'New product');
  return <><p className="eyebrow">Collection management</p><h1>{id ? 'Edit a creation.' : 'A new creation.'}</h1><EmptyState title="The product editor is being prepared." to="/admin/products" action="Back to products">This protected route is ready for image uploads, category selection, prices, stock status and publishing controls. Product editing will be implemented in the next stage.</EmptyState></>;
}
