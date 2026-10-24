export class CheckoutNotReadyError extends Error {
  constructor() { super('Online checkout is being prepared. No order has been created.'); }
}
// Stage 2: invoke a rate-limited server endpoint with product IDs and quantities.
// It must price from PostgreSQL and atomically persist the order and snapshots.
export async function createOrder() { throw new CheckoutNotReadyError(); }
