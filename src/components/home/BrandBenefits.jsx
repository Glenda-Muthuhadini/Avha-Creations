import Icon from '../common/Icon';
const benefits = [['diamond', 'Handmade', 'with care'], ['person', 'Custom made', 'just for you'], ['flower', 'Perfect for', 'any occasion'], ['heart', 'Beauty & style', 'in one place']];
export default function BrandBenefits() {
  return <section className="brand-benefits" aria-label="The AVHA promise"><div className="container brand-benefits__grid">{benefits.map(([icon, first, second]) => <div key={icon}><Icon name={icon} size={35} /><p>{first}<br />{second}</p></div>)}</div></section>;
}
