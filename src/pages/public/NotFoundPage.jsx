import PageContainer from '../../components/common/PageContainer';
import { EmptyState } from '../../components/common/States';
import { usePageTitle } from '../../hooks/usePageTitle';
export default function NotFoundPage() {
  usePageTitle('Page not found');
  return <PageContainer eyebrow="404" title="A little off the beaten path."><EmptyState title="This page couldn’t be found." to="/" action="Back to AVHA">Let’s take you somewhere beautiful.</EmptyState></PageContainer>;
}
