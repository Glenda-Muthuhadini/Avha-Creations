export default function CategoryScroller({ categories, selected, onSelect }) {
  return <nav className="shop-categories" aria-label="Shop by category"><div className="container category-scroller" tabIndex={0}>
    {categories.map(category => <button key={category.slug} type="button" className={`category-card ${selected.includes(category.slug) ? 'is-selected' : ''}`} aria-pressed={selected.includes(category.slug)} onClick={() => onSelect(category.slug)}>
      <span className="category-card__photo"><img src={category.image} alt="" loading="lazy" decoding="async" width="480" height="360" /></span><span>{category.name}</span>
    </button>)}
  </div></nav>;
}
