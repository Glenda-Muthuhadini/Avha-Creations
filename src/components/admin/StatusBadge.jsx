import { statusLabel } from '../../lib/statuses';
export default function StatusBadge({ status }) { return <span className="status-badge">{statusLabel(status)}</span>; }
