import { formatRand } from '../../utils/money';
export default function Price({ value, from = false }) { return <span className="price">{from && 'From '}{formatRand(value)}</span>; }
