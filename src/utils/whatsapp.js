import { formatRand } from './money.js';

// Accept a persisted, server-priced order; never construct an order from cart totals.
export function orderWhatsAppUrl(order, number) {
  const digits = String(number || '').replace(/\D/g, '');
  if (!/^\d{10,15}$/.test(digits)) throw new Error('A valid store WhatsApp number is required.');
  if (!order?.order_number || !Array.isArray(order.order_items) || !order.order_items.length) throw new Error('A saved order is required.');
  const lines = order.order_items.map(item => `${item.product_name} × ${item.quantity} — ${formatRand(item.total_price)}`);
  const message = ["Hi AVHA,", "", "I'd like to complete my order.", "", `Order: ${order.order_number}`, "", ...lines, "",
    `${order.fulfilment_method === 'delivery' ? 'Delivery' : 'Collection'} — ${formatRand(order.delivery_fee)}`, "",
    `Total: ${formatRand(order.total)}`, "", `Name: ${order.customer_name}`, 'Payment method: EFT', `Reference: ${order.order_number}`].join('\n');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
