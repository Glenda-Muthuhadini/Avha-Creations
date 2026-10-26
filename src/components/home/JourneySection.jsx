import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import { hairPhotos } from '../../data/hairPhotography';
const journeys = [
  { to: '/shop', image: '/images/crochet-bag.webp', alt: 'A dusty pink crochet handbag with a gold chain.', title: 'Shop Creations', lines: <>Hats · Bags · Jewellery<br />Crochet · Occasion Pieces<br />and more</> },
  { to: '/hair-services', image: hairPhotos.geometricBraids.src, alt: hairPhotos.geometricBraids.alt, title: 'Hair Artistry', lines: <>Braids · Cornrows · Wigs<br />Colour · Styling · And more</> },
];
export default function JourneySection() {
  return <section className="container campaign-section journey-section" aria-labelledby="journey-title"><header className="campaign-section__heading"><div><p className="eyebrow">Two worlds. One creative spirit.</p><h2 id="journey-title">Find your expression.</h2></div><p>Made by hand.<br />Worn your way.</p></header>
    <div className="journey-grid">{journeys.map((item, i) => <Link key={item.to} to={item.to} className="journey-card"><img src={item.image} alt={item.alt} loading="lazy" width="800" height="1000" /><div className="journey-card__shade" /><div className="journey-card__copy"><span className="eyebrow">0{i + 1} / The AVHA collection</span><h3>{item.title}</h3><p>{item.lines}</p><span className="journey-card__explore"><span className="circle-arrow"><Icon name="arrow" size={19} /></span> Explore</span></div></Link>)}</div>
  </section>;
}
