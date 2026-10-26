import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { usePageTitle } from '../../hooks/usePageTitle';
import { hairPhotos } from '../../data/hairPhotography';

const values = [
  ['diamond', 'Authenticity', 'We celebrate individuality and thoughtful beauty.'],
  ['flower', 'Quality', 'Every piece is made with care and attention.'],
  ['heart', 'People first', 'Our clients, our community and your story matter.'],
  ['person', 'More than beauty', 'We create confidence, connection and opportunities.'],
];

export default function AboutPage() {
  usePageTitle('Our story', 'Discover the story, values and South African roots of AVHA CREATIONS.');
  return <div className="about-page">
    <section className="about-hero" aria-labelledby="about-title">
      <img className="about-hero__image" src="/images/Romantic%20Coral%20Hat%20Atelier.png" alt="A woman wearing a romantic coral crochet hat." fetchPriority="high" />
      <div className="about-hero__shade" />
      <div className="container about-hero__layout">
        <div className="about-hero__copy">
          <p className="eyebrow">Our story</p>
          <h1 id="about-title">Created<br />for <em>you.</em></h1>
          <p>A South African creative brand bringing handmade craftsmanship and personalised hair artistry together.</p>
          <a className="button" href="#our-journey">Our journey <Icon name="arrow" size={16} /></a>
        </div>
      </div>
    </section>

    <section className="about-journey container" id="our-journey" aria-labelledby="journey-title">
      <div className="about-journey__image-wrap">
        <img src="/images/products/optimized/crimson-crochet-bag-800.webp" srcSet="/images/products/optimized/crimson-crochet-bag-480.webp 480w, /images/products/optimized/crimson-crochet-bag-800.webp 800w" sizes="(min-width: 1024px) 35vw, 100vw" alt="A crimson crochet bag with textured ridges, a butterfly brooch and a gold-tone chain." loading="lazy" />
      </div>
      <div className="about-journey__copy">
        <p className="eyebrow">Our journey</p>
        <h2 id="journey-title">From a passion<br />to a purpose.</h2>
        <p>AVHA CREATIONS began with a simple belief: that creativity has the power to make people feel confident, beautiful and truly themselves.</p>
        <p>What started as a passion for handmade accessories and hair artistry has grown into a thoughtful expression of individuality, craftsmanship and care.</p>
        <p>Every hat, bag, accessory and hairstyle is created with care, attention to detail and a desire to be part of your story.</p>
      </div>
      <aside className="about-journey__note"><Icon name="heart" size={24} /><span>Handmade<br />with care</span><Icon name="diamond" size={24} /><span>Inspired by<br />African culture</span><Icon name="person" size={24} /><span>Personalised<br />for you</span><Icon name="people" size={24} /><span>Community<br />focused</span><Icon name="star" size={24} /><span>Quality<br />craftsmanship</span></aside>
    </section>

    <section className="about-purpose" aria-label="Our mission and vision">
      <div className="container about-purpose__layout">
        <article className="about-purpose__copy">
          <p className="eyebrow">Our mission</p>
          <h2>To create<br />confidence.</h2>
          <p>We exist to provide beautifully handmade creations and personalised hair artistry that help you show up as your most authentic self — at every occasion and in every season of life.</p>
          <Button to="/about#about-values">Learn more about our values <Icon name="arrow" size={16} /></Button>
        </article>
        <div className="about-purpose__seal" aria-label="Beauty, style, culture, confidence and community">
          <span>Beauty</span><span>Style</span><span>Culture</span><span>Confidence</span><span>Community</span><Icon name="diamond" size={18} /><small>AVHA CREATIONS</small>
        </div>
        <article className="about-purpose__copy">
          <p className="eyebrow">Our vision</p>
          <h2>A creative<br />community.</h2>
          <p>To be a recognised South African brand known for exceptional handmade craftsmanship, premium hair artistry and a commitment to individuality, culture and community.</p>
          <Button to="/shop">Explore our creations <Icon name="arrow" size={16} /></Button>
        </article>
      </div>
    </section>

    <section className="about-values container" id="about-values" aria-label="Our values">
      {values.map(([icon, title, description]) => <article key={title}><Icon name={icon} size={25} /><h3>{title}</h3><p>{description}</p></article>)}
    </section>

    <section className="about-roots" aria-labelledby="about-roots-title">
      <img className="about-roots__image" src={hairPhotos.decorativeLocs.src} srcSet={hairPhotos.decorativeLocs.srcSet} sizes="100vw" alt={hairPhotos.decorativeLocs.alt} loading="lazy" />
      <div className="about-roots__shade" />
      <div className="container about-roots__layout">
        <div><p className="eyebrow">Rooted in community</p><h2 id="about-roots-title">Proudly South African.</h2><p>AVHA CREATIONS is based in Olievenhoutbosch, Centurion, and we are proud to be part of a vibrant, creative community. Our work is inspired by South African culture, its people and the beauty in everyday moments.</p><Button to="/contact">Visit us <Icon name="arrow" size={16} /></Button></div>
      </div>
    </section>
  </div>;
}
