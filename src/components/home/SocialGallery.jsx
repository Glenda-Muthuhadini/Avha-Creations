import Icon from '../common/Icon';
import { useBusiness } from '../../context/BusinessContext';
import { hairPhotos } from '../../data/hairPhotography';
const images = [
  ['/images/avha-hero-768.webp', 'Statement mauve crochet hat'],
  ['/images/crochet-bag.webp', 'Handmade pink crochet handbag'],
  [hairPhotos.cornrowBun.src, hairPhotos.cornrowBun.alt],
  ['/images/fascinator.webp', 'Champagne occasion fascinator'],
  ['/images/crochet-bow.webp', 'Black and cream crochet hair bow'],
  ['/images/story-portrait.webp', 'Natural straw hat with black details'],
];
export default function SocialGallery() {
  const { settings } = useBusiness();
  return <section className="social-gallery" aria-labelledby="social-title"><div className="container"><header className="campaign-section__heading"><div><h2 id="social-title">Follow Our Journey</h2><p>Get inspired by our latest creations, styles and client looks.</p></div><a className="instagram-handle" href={settings.instagram_url} target="_blank" rel="noreferrer"><Icon name="instagram" />{settings.instagram_handle}</a></header><div className="social-gallery__track" role="region" aria-label="AVHA inspiration gallery, scroll for more" tabIndex={0}>{images.map(([src, alt]) => <a key={src} href={settings.instagram_url} target="_blank" rel="noreferrer" aria-label={`${alt} — visit AVHA on Instagram`}><img src={src} alt={alt} loading="lazy" width="400" height="500" /><span><Icon name="instagram" /></span></a>)}</div><p className="social-gallery__caption">A glimpse of the AVHA mood · Editorial inspiration, with more on Instagram.</p></div></section>;
}
