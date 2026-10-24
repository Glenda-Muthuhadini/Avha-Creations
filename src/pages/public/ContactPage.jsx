import PageContainer from '../../components/common/PageContainer';
import { ErrorState, LoadingState } from '../../components/common/States';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useResource } from '../../hooks/useResource';
import { getPublicSettings } from '../../services/settings';
import { isSupabaseConfigured } from '../../lib/supabase';
export default function ContactPage() {
  usePageTitle('Contact & appointments');
  const { data, loading, error, retry } = useResource(getPublicSettings, isSupabaseConfigured);
  const digits = data?.whatsapp_number?.replace(/\D/g, '');
  const whatsappReady = /^\d{10,15}$/.test(digits || '');
  return <PageContainer eyebrow="Let’s create your look" title="A conversation away." intro="For custom creations, hair appointments, and something a little different.">
    {loading ? <LoadingState /> : error ? <ErrorState error={error} retry={retry} /> : <div className="contact-grid"><section className="panel"><p className="eyebrow">Visit AVHA</p><h2>Rooted in Centurion.</h2><p>{data?.physical_address || 'Olievenhoutbosch, Centurion, South Africa'}</p><p className="muted">Please arrange your visit or hair appointment in advance.</p></section><section className="panel"><p className="eyebrow">Get in touch</p><h2>Made personal.</h2>{whatsappReady ? <a className="button" href={`https://wa.me/${digits}?text=${encodeURIComponent('Hi AVHA, I’d like to enquire about a creation or hair appointment.')}`} target="_blank" rel="noreferrer">Chat on WhatsApp ↗</a> : <p>Our online contact details are being prepared. Please check back for appointment enquiries.</p>}{data?.email && <p><a href={`mailto:${data.email}`}>{data.email}</a></p>}</section></div>}
  </PageContainer>;
}
