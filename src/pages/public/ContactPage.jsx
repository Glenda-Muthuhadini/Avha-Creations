import PageContainer from '../../components/common/PageContainer';
import { ErrorState, LoadingState } from '../../components/common/States';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useBusiness } from '../../context/BusinessContext';
import SocialLinks from '../../components/layout/SocialLinks';
import { useSearchParams } from 'react-router-dom';
import { enquiryUrl } from '../../config/business';
export default function ContactPage() {
  usePageTitle('Contact & appointments');
  const { settings, whatsappUrl: generalUrl, loading, error, retry } = useBusiness();
  const [params] = useSearchParams();
  const interest = params.get('creation') || params.get('service');
  const whatsappUrl = interest ? enquiryUrl(settings.whatsapp_number, `Hi AVHA, I’d like to enquire about ${interest.slice(0, 160)}.`) : generalUrl;
  return <PageContainer eyebrow="Let’s create your look" title="A conversation away." intro="For custom creations, hair appointments, and something a little different.">
    {loading && <LoadingState>Loading current contact details…</LoadingState>}
    {error && <ErrorState error={error} retry={retry} />}
    <div className="contact-grid"><section className="panel"><p className="eyebrow">Visit AVHA</p><h2>Rooted in Centurion.</h2><p>{settings.physical_address}</p><p className="muted">Please arrange your visit or hair appointment in advance.</p></section><section className="panel"><p className="eyebrow">Get in touch</p><h2>Made personal.</h2>{whatsappUrl ? <a className="button" href={whatsappUrl} target="_blank" rel="noreferrer">Chat on WhatsApp ↗</a> : <p>WhatsApp is unavailable. Please use our other contact details.</p>}{settings.email && <p><a href={`mailto:${settings.email}`}>{settings.email}</a></p>}<div id="social" className="contact-social"><SocialLinks text /><p className="muted">Ask us on WhatsApp for our current Facebook page.</p></div></section></div>
  </PageContainer>;
}
