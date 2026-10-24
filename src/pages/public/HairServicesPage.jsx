import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/States';
import { previewServices } from '../../data/homePreview';
import { isSupabaseConfigured } from '../../lib/supabase';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useResource } from '../../hooks/useResource';
import { listCatalogue } from '../../services/catalogue';
import { useBusiness } from '../../context/BusinessContext';

const serviceDetails = {
  braids: 'Timeless protective styles, finished with care.',
  cornrows: 'Neat, detailed looks made for everyday confidence.',
  'wig-making-installation': 'Custom fit, natural finish and a style that feels like you.',
  'hair-dyeing': 'Vibrant colour to express your own signature.',
  'hair-washing': 'A gentle refresh for healthy, beautiful hair.',
  'custom-styling': 'A considered finish for your moment and your mood.',
};
const values = [
  ['diamond', 'Quality products', 'Care for your hair'],
  ['heart', 'Personalised service', 'Styles made just for you'],
  ['flower', 'Special occasions', 'Thoughtful details, beautiful results'],
  ['sparkle', 'Experienced hands', 'Attention in every detail'],
  ['star', 'Beauty & creativity', 'Hair and accessories in one place'],
];
const work = [
  ['/images/braids.webp', 'Long, detailed braids'],
  ['/images/cornrows.webp', 'Sculpted cornrow braids'],
  ['/images/wig-installation.webp', 'Elegant wig styling'],
  ['/images/hair-colour.webp', 'Warm dimensional hair colour'],
  ['/images/hair-washing.webp', 'A relaxing hair wash'],
  ['/images/custom-styling.webp', 'A polished custom hairstyle'],
];

export default function HairServicesPage() {
  usePageTitle('Hair artistry', 'Explore personalised hair styling, braids, colour and care by AVHA Creations.');
  const load = useCallback(() => isSupabaseConfigured ? listCatalogue('services') : Promise.resolve(previewServices), []);
  const { data, loading, error, retry } = useResource(load);
  const { settings } = useBusiness();
  const services = data || [];

  return <div className="hair-page">
    <section className="hair-hero" aria-labelledby="hair-title">
      <img className="hair-hero__image" src="/images/Glamorous%20Braids%20in%20Golden%20Light.png" alt="" fetchPriority="high" />
      <div className="hair-hero__shade" />
      <div className="container hair-hero__layout">
        <div className="hair-hero__copy">
          <p className="eyebrow">Hair artistry</p>
          <h1 id="hair-title">Your hair.<br /><em>Your signature.</em></h1>
          <p>Professional. Personalised. Creative.<br />Styles that celebrate you.</p>
          <div className="hair-hero__actions">
            <Button to="/contact">Book an appointment <Icon name="arrow" size={16} /></Button>
            <a className="button button--outline" href="#hair-services-list">Explore services</a>
          </div>
        </div>
        <p className="hair-hero__signature" aria-hidden="true">Beautiful<br />Hair.<br />Your Style.</p>
        <div className="hair-hero__benefits" aria-label="The AVHA hair experience">
          <div><Icon name="diamond" size={25} /><span>Quality care<br />for your hair</span></div>
          <div><Icon name="flower" size={25} /><span>Style for<br />every occasion</span></div>
          <div><Icon name="heart" size={25} /><span>Made for you<br />with care</span></div>
          <div><Icon name="sparkle" size={25} /><span>Beautiful looks<br />that feel like you</span></div>
        </div>
      </div>
    </section>

    <section className="hair-services container" id="hair-services-list" aria-labelledby="hair-services-title">
      <header className="hair-section-heading">
        <div><p className="eyebrow">Find your look</p><h2 id="hair-services-title">Our Hair Services</h2><p>From everyday styles to special occasions, we bring your hair vision to life.</p></div>
        <Button to="/contact" variant="outline">View all services <Icon name="arrow" size={16} /></Button>
      </header>
      {loading ? <LoadingState>Discovering hair artistry…</LoadingState> : error ? <ErrorState error={error} retry={retry} /> : !services.length
        ? <EmptyState title="Your next look is on its way." to="/contact" action="Enquire about an appointment">Our online service menu is being prepared. Speak to AVHA about your hair and styling ideas.</EmptyState>
        : <div className="hair-service-grid">{services.map(service => <HairServiceCard key={service.id} service={service} />)}</div>}
    </section>

    <section className="hair-confidence" aria-labelledby="hair-confidence-title">
      <img className="hair-confidence__image" src="/images/custom-styling.webp" alt="A beautifully finished custom hairstyle" loading="lazy" />
      <div className="hair-confidence__shade" />
      <div className="container hair-confidence__layout">
        <div className="hair-confidence__copy"><p className="eyebrow">More than a style</p><h2 id="hair-confidence-title">Healthy hair.<br /><em>Lasting confidence.</em></h2><p>We combine skill, creativity and care to give you styles that feel good, look beautiful and feel good to wear.</p><Button to="/contact">Learn more about our hair artistry <Icon name="arrow" size={16} /></Button></div>
        <ul className="hair-values">{values.map(([icon, title, description]) => <li key={title}><Icon name={icon} size={21} /><span><strong>{title}</strong><small>{description}</small></span></li>)}</ul>
      </div>
    </section>

    <section className="hair-work" aria-labelledby="hair-work-title">
      <div className="container">
        <header className="hair-section-heading hair-work__heading">
          <div><p className="eyebrow">A look at some of our recent styles and transformations</p><h2 id="hair-work-title">Our Work</h2></div>
          <a className="button button--outline" href={settings.instagram_url} target="_blank" rel="noreferrer"><Icon name="instagram" size={17} />Follow us on Instagram</a>
        </header>
        <div className="hair-work__gallery" role="region" aria-label="Hair artistry gallery, scroll for more" tabIndex={0}>{work.map(([src, alt]) => <a key={src} href={settings.instagram_url} target="_blank" rel="noreferrer" aria-label={`${alt} — visit AVHA on Instagram`}><img src={src} alt={alt} loading="lazy" /><span><Icon name="instagram" size={22} /></span></a>)}</div>
      </div>
    </section>
  </div>;
}

function HairServiceCard({ service }) {
  const to = service.preview ? `/contact?service=${encodeURIComponent(service.name)}` : `/hair-services/${service.slug}`;
  return <article className="hair-service-card"><Link to={to} aria-label={`${service.name} — enquire`}>
    {service.images?.[0] ? <img src={service.images[0]} alt="" loading="lazy" /> : <div className="hair-service-card__fallback" aria-hidden="true"><Icon name="sparkle" size={32} /></div>}
    <span className="hair-service-card__shade" />
    <span className="hair-service-card__copy"><strong>{service.name}</strong><small>{serviceDetails[service.slug] || 'A personalised style, thoughtfully created just for you.'}</small></span>
    <span className="hair-service-card__arrow"><Icon name="arrow" size={16} /></span>
  </Link></article>;
}
