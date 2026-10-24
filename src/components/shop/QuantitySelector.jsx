export default function QuantitySelector({ quantity, onChange, label = 'Quantity' }) {
  return <div className="quantity"><button type="button" aria-label={`Decrease ${label}`} disabled={quantity <= 1} onClick={() => onChange(quantity - 1)}>−</button><output aria-label={label} aria-live="polite">{quantity}</output><button type="button" aria-label={`Increase ${label}`} disabled={quantity >= 99} onClick={() => onChange(quantity + 1)}>+</button></div>;
}
