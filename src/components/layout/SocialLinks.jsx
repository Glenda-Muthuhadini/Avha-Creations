import { Link } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import Icon from '../common/Icon';
export default function SocialLinks({ text = false }) {
  const { settings, whatsappUrl } = useBusiness();
  return <div className={text ? 'social-links social-links--text' : 'social-links'}>
    <a href={settings.instagram_url} target="_blank" rel="noreferrer" aria-label="AVHA on Instagram"><Icon name="instagram" size={21} />{text && 'Instagram'}</a>
    <Link to="/contact#social" aria-label="Enquire about AVHA’s Facebook page" title="Enquire about our Facebook page"><Icon name="facebook" size={18} />{text && 'Facebook enquiries'}</Link>
    {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat with AVHA on WhatsApp"><Icon name="whatsapp" size={22} />{text && 'WhatsApp'}</a> : <Link to="/contact" aria-label="Contact AVHA"><Icon name="whatsapp" size={22} />{text && 'Contact'}</Link>}
  </div>;
}
