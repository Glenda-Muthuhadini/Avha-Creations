import { formatRand } from '../../utils/money';
export default function Price({ value, from = false, unit }) { return <span className="price">{from && !unit && 'From '}{formatRand(value)}{unit && ` ${unit}`}</span>; }
