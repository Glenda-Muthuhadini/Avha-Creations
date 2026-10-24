import Button from './Button';
export function LoadingState({ children = 'Loading…' }) { return <div className="state" role="status"><span className="spinner" />{children}</div>; }
export function EmptyState({ title, children, to, action }) {
  return <div className="state"><span className="state-symbol" aria-hidden="true">✧</span><h2>{title}</h2><p>{children}</p>{to && <Button to={to} variant="outline">{action}</Button>}</div>;
}
export function ErrorState({ error, retry }) {
  return <div className="state" role="alert"><h2>We couldn’t load this just yet.</h2><p>{error?.message || 'Please try again.'}</p>{retry && <Button onClick={retry}>Try again</Button>}</div>;
}
