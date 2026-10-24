import PageContainer from '../../components/common/PageContainer';
import Button from '../../components/common/Button';
import { usePageTitle } from '../../hooks/usePageTitle';
export default function AboutPage() {
  usePageTitle('Our story');
  return <PageContainer eyebrow="Local hands. Limitless creativity." title="Our story" intro="Beauty is personal. We believe the things you wear should be, too."><div className="prose panel"><h2>Made with care, in Centurion.</h2><p>AVHA CREATIONS is a South African creative brand based in Olievenhoutbosch, Centurion. We bring together handmade accessories and personalised hair services, celebrating individuality, artistry and craftsmanship.</p><p>From a crochet bag for everyday life to a fascinator for a special occasion, from braids to a fresh new style, our work is about helping you feel like yourself.</p><Button to="/contact">Create something personal ↗</Button></div></PageContainer>;
}
