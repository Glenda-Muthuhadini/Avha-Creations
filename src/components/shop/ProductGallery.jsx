import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';

export default function ProductGallery({ product, to }) {
  const compact = Boolean(to);
  const images = product.images || [];
  const multiple = images.length > 1;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef(null);
  const swiped = useRef(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const cycling = multiple && !reducedMotion && !paused && !focused && (!compact || hovered);
  useEffect(() => {
    if (!cycling) return undefined;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex(current => (current + 1) % images.length);
    }, compact ? 2500 : 4000);
    return () => clearInterval(timer);
  }, [cycling, compact, images.length, index]);
  const move = delta => setIndex(current => (current + delta + images.length) % images.length);
  const choices = <div className="product-gallery__choices" aria-label="Choose a photo">{images.map((src, i) => <button key={`${src}-${i}`} type="button" className={i === index ? 'is-active' : ''} aria-label={`Show photo ${i + 1} of ${product.name}`} aria-pressed={i === index} onClick={() => setIndex(i)}>{!compact && <img src={src} alt="" loading="lazy" width="64" height="64" />}</button>)}</div>;
  const photo = <ProductImage key={images[index] || 'empty'} product={{ ...product, images: images[index] ? [images[index]] : [], image_srcset: index === 0 ? product.image_srcset : undefined }} alt={multiple ? `${product.name}, photo ${index + 1} of ${images.length}` : product.name} />;
  return <div className={`product-gallery ${compact ? 'product-gallery--card' : 'product-gallery--detail'}`} role={multiple ? 'region' : undefined} aria-roledescription={multiple ? 'carousel' : undefined} aria-label={multiple ? `${product.name} photos` : undefined}
    onMouseEnter={() => { setHovered(true); if (compact) setPaused(false); }} onMouseLeave={() => setHovered(false)}
    onFocusCapture={event => setFocused(event.target.matches(':focus-visible'))} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onClickCapture={event => { if (swiped.current) { event.preventDefault(); event.stopPropagation(); swiped.current = false; } }}
    onTouchStart={event => { swiped.current = false; touchStart.current = event.touches[0].clientX; }}
    onTouchEnd={event => {
      const distance = touchStart.current === null ? 0 : touchStart.current - event.changedTouches[0].clientX;
      touchStart.current = null;
      if (multiple && Math.abs(distance) > 40) { swiped.current = true; move(distance > 0 ? 1 : -1); setPaused(true); }
    }}>
    <div className="product-gallery__photo">{to ? <Link className="product-photo-link" to={to} aria-label={`View ${product.name}`}>{photo}</Link> : photo}
      {multiple && <span className="product-gallery__count">{index + 1}/{images.length}</span>}
      {multiple && compact && <div className="product-gallery__controls">{choices}</div>}
    </div>
    {multiple && !compact && <div className="product-gallery__controls">
      {choices}
      {!compact && !reducedMotion && <button type="button" className="product-gallery__play" aria-label={paused ? 'Play slideshow' : 'Pause slideshow'} onClick={() => setPaused(value => !value)}>{paused ? 'Play slideshow' : 'Pause slideshow'}</button>}
    </div>}
  </div>;
}
