# Checkout implementation contract — next stage

Checkout is intentionally unavailable in stage 1. `createOrder()` fails closed, and RLS/SQL grants prohibit browser inserts into orders, items and payment proofs. Do not enable a broad anonymous INSERT policy to make checkout work.

The next stage should implement a rate-limited Supabase Edge Function backed by an atomic database transaction. Only the server gets privileged credentials. A narrowly scoped internal database function may be required to run that transaction; keep it outside exposed schemas and revoke PUBLIC/anon/authenticated execution.

## Create order

Request: `{items: [{product_id, quantity}], customer_name, customer_phone, customer_email?, fulfilment_method, delivery_address?, customer_notes?, idempotency_key}`. No client price, fee, payment status or order number is authoritative.

1. Apply request size limits, strict validation, anti-abuse controls and idempotency. Decide retention and consent for customer data before launch.
2. Check every product is active, belongs to an active category when assigned, and is available; reject duplicate IDs, noninteger quantities and oversized carts. Decide made-to-order lead times explicitly.
3. Load and lock authoritative products as appropriate. Read delivery settings; reject disabled delivery and missing addresses. Collection fee is zero.
4. Calculate all prices with exact decimals/integer cents; atomically create order and immutable item snapshots. Sequence creates AVHA-1001 style references; gaps are normal. Initial statuses must be `awaiting_payment` / `pending`.
5. Issue a cryptographically random, scoped, expiring order-access capability. Persist its hash only. Never treat sequential order numbers, UUIDs or customer email as authorization. Add access-token persistence through a reviewed migration.
6. Return the saved order, exact totals and a curated bank-instructions snapshot through the authorized endpoint. Do not expose `bank_settings` publicly. Avoid leaking tokens in logs, referrers or analytics; use no-store responses.

## Read order / EFT instructions

Verify capability and expiry for every read, including after refresh. Select only that order and its items; no list endpoint. Use order snapshots and decide banking-instruction versioning before launch. UI must say payment is awaiting verification, never confirmed automatically.

## Proof upload

1. Validate order capability, eligible order state, MIME signature, size and upload count. Scan/reject unsafe content.
2. Server mints a short-lived upload authorization for a random path under the private `payment-proofs` bucket. No public bucket URLs and no arbitrary client-selected path.
3. After upload, server verifies the object, atomically creates proof metadata and changes payment status to `proof_uploaded`. Define cleanup/retry behavior for orphaned objects. Do not permit replacing an existing object.
4. Admin obtains an expiring signed read URL (existing helper uses 60 seconds), checks proof, and confirms/rejects payment. Implement atomic proof/order status transitions and an audit trail.

## WhatsApp

`orderWhatsAppUrl(savedOrder, settings.whatsapp_number)` already builds the message from persisted snapshots and totals. It returns a link; opening it requires the customer's action, and WhatsApp still requires them to send. Do not send messages automatically or put the order-access token in the WhatsApp message.

## Required acceptance checks

Tampered totals/fees; inactive and out-of-stock products; duplicate submissions; expired/wrong-order tokens; guessable order references; negative/huge/fractional quantities; unauthorized proof reads and writes; oversized/spoofed uploads; failed transactions; interrupted uploads; admin revocation; genuine admin payment confirmation; collection/delivery totals; cart cleared only after persisted success.
