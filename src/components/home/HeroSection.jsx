import Button from '../common/Button';
import Icon from '../common/Icon';

export default function HeroSection() {
  return <section className="campaign-hero" aria-labelledby="hero-title">
    <img className="campaign-hero__image" src="/images/avha-hero-1536.webp" srcSet="/images/avha-hero-768.webp 768w, /images/avha-hero-1024.webp 1024w, /images/avha-hero-1536.webp 1536w" sizes="100vw" alt="A woman wearing a statement mauve crochet hat, floral earrings and a soft blush blouse." width="1536" height="1024" fetchPriority="high" />
    <div className="campaign-hero__shade" />
    <div className="container campaign-hero__layout"><div className="campaign-hero__copy">
      <p className="eyebrow">Handmade <span>•</span> Personal <span>•</span> Unmistakably you</p>
      <h1 id="hero-title" className="hero-wordmark"><span>AVHA</span><small>CREATIONS</small></h1>
      <p className="campaign-hero__description">Handcrafted accessories.<br />Distinctive style. Hair artistry.</p>
      <p className="campaign-hero__occasion">Creations for every occasion</p>
      <div className="button-row"><Button to="/shop">Shop Creations <Icon name="arrow" size={18} /></Button><Button to="/hair-services" variant="outline">Book Hair Services</Button></div>
    </div>
    </div>
    <div className="campaign-hero__bottom"><span>Handcrafted in South Africa</span><span>Discover the world of AVHA <span aria-hidden="true">↓</span></span></div>
  </section>;
}
