export default function ShopPagination({ page, pages, onChange }) {
  if (pages < 2) return null;
  const visible = [...new Set([1, ...Array.from({ length: 5 }, (_, i) => page - 2 + i).filter(value => value > 1 && value < pages), pages])].sort((a, b) => a - b);
  return <nav className="shop-pagination" aria-label="Product pages"><button type="button" disabled={page <= 1} aria-label="Previous page" onClick={() => onChange(page - 1)}>←</button>{visible.map((value, index) => <span key={value}>{index > 0 && value - visible[index - 1] > 1 && <span className="pagination-ellipsis">…</span>}<button type="button" aria-current={value === page ? 'page' : undefined} aria-label={`Page ${value}`} onClick={() => onChange(value)}>{value}</button></span>)}<button type="button" disabled={page >= pages} aria-label="Next page" onClick={() => onChange(page + 1)}>→</button></nav>;
}
