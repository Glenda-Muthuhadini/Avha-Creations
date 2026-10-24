import { useEffect, useId, useRef } from 'react';
import Icon from '../common/Icon';
import { formatRand } from '../../utils/money';
import { PRICE_LIMIT } from '../../utils/shop';
import { useBusiness } from '../../context/BusinessContext';
import { enquiryUrl } from '../../config/business';

export function CustomOrderCard() {
  const { settings } = useBusiness();
  const whatsapp = enquiryUrl(settings.whatsapp_number, "Hi AVHA, I have a custom creation in mind. Could we discuss a design?");
  return <article className="custom-order-card"><Icon name="bag" size={29} /><div><h3>Custom Orders</h3><p>Have something specific in mind? We do custom designs for all occasions.</p></div>{whatsapp ? <a className="button" href={whatsapp} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={18} />Chat on WhatsApp <Icon name="arrow" size={16} /></a> : <a className="button" href="/contact">Contact AVHA <Icon name="arrow" size={16} /></a>}</article>;
}

export function FilterControls({ filters, categories, onChange, onClear }) {
  const prefix = useId();
  const toggle = (key, value) => onChange({ ...filters, [key]: filters[key].includes(value) ? filters[key].filter(item => item !== value) : [...filters[key], value], page: 1 });
  return <>
    <div className="filter-panel__heading"><h2>Filters</h2><button type="button" className="filter-clear" onClick={onClear}>Clear all</button></div>
    <fieldset className="filter-group"><legend>Category</legend>{categories.map(category => <label key={category.slug} className="filter-check"><input type="checkbox" checked={filters.categories.includes(category.slug)} onChange={() => toggle('categories', category.slug)} /><span>{category.name}</span></label>)}</fieldset>
    <fieldset className="filter-group filter-price"><legend>Price Range</legend>
      <label htmlFor={`${prefix}-minimum`}>Minimum price <output>{formatRand(filters.min)}</output></label>
      <input id={`${prefix}-minimum`} type="range" min="0" max={PRICE_LIMIT} step="10" value={filters.min} onChange={event => onChange({ ...filters, min: Math.min(Number(event.target.value), filters.max), page: 1 })} />
      <label htmlFor={`${prefix}-maximum`}>Maximum price <output>{filters.max === PRICE_LIMIT ? `${formatRand(PRICE_LIMIT)}+` : formatRand(filters.max)}</output></label>
      <input id={`${prefix}-maximum`} type="range" min="0" max={PRICE_LIMIT} step="10" value={filters.max} onChange={event => onChange({ ...filters, max: Math.max(Number(event.target.value), filters.min), page: 1 })} />
      <div className="price-endpoints"><span>R0</span><span>R1,500+</span></div>
    </fieldset>
    <fieldset className="filter-group"><legend>Availability</legend>{[['in_stock', 'In Stock'], ['out_of_stock', 'Out of Stock'], ['made_to_order', 'Made to Order']].map(([value, name]) => <label key={value} className="filter-check"><input type="checkbox" checked={filters.availability.includes(value)} onChange={() => toggle('availability', value)} /><span>{name}</span></label>)}</fieldset>
    <CustomOrderCard />
  </>;
}

export function MobileFilterDrawer({ open, onClose, onApply, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    const media = window.matchMedia('(min-width: 1024px)');
    const resize = () => { if (media.matches) onClose(); };
    media.addEventListener('change', resize);
    return () => { element.close(); document.body.style.overflow = previousOverflow; media.removeEventListener('change', resize); };
  }, [open, onClose]);
  return <dialog className="filter-drawer" ref={dialog} aria-label="Filter creations" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="filter-drawer__content"><button type="button" className="filter-drawer__close" aria-label="Close filters" onClick={onClose}><Icon name="close" /></button>{children}</div>
    <div className="filter-drawer__footer"><button type="button" className="button" onClick={onApply}>Apply Filters <Icon name="arrow" size={18} /></button></div>
  </dialog>;
}
