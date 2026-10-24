import { Link } from 'react-router-dom';
export default function Button({ to, variant = 'primary', className = '', children, ...props }) {
  const styles = `button button--${variant} ${className}`;
  return to ? <Link className={styles} to={to} {...props}>{children}</Link> : <button className={styles} type="button" {...props}>{children}</button>;
}
