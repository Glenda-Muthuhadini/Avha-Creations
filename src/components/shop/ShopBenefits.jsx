import Icon from '../common/Icon';

export default function ShopBenefits() {
  return <section className="shop-benefits" aria-label="The AVHA experience"><div className="container">{[
    ['truck', 'Nationwide Delivery', 'Reliable delivery across South Africa.'],
    ['diamond', 'Custom Made', 'Have a unique idea? We bring it to life.'],
    ['gift', 'Perfect for Occasions', 'Weddings, traditional celebrations, functions and more.'],
  ].map(([icon, title, copy]) => <article key={title}><Icon name={icon} size={42} /><div><h2>{title}</h2><p>{copy}</p></div></article>)}</div></section>;
}
