export const PAYMENT_STATUSES = ['awaiting_payment', 'proof_uploaded', 'payment_confirmed', 'payment_rejected'];
export const ORDER_STATUSES = ['pending', 'preparing', 'ready_for_collection', 'dispatched', 'completed', 'cancelled'];
export const statusLabel = status => status.replaceAll('_', ' ');
