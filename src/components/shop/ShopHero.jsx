import Icon from '../common/Icon';

export default function ShopHero() {
  return <section className="shop-hero" aria-labelledby="shop-title">
    <img className="shop-hero__image" src="/Luxury%20Pink%20Crochet%20Handbag%20Glow.png" alt="Luxury pink crochet handbag" width="800" height="1000" fetchPriority="high" />
    <div className="shop-hero__shade" />
    <div className="container shop-hero__layout"><div className="shop-hero__copy">
      <p className="eyebrow">Shop our</p><h1 id="shop-title">CREATIONS</h1>
      <p>Handmade pieces. Distinctive style.<br />For every occasion.</p>
      <a className="button" href="#all-creations">Explore Collections <Icon name="arrow" size={18} /></a>
    </div></div>
  </section>;
}
