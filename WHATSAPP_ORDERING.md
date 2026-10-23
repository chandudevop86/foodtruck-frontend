# WhatsApp Pickup Ordering (Phase 1)

Standalone customer-facing page: `public/whatsapp-order/index.html`. Vite copies this to `dist/whatsapp-order/index.html`; under the existing /foodtruck/ deployment base it should be served at `/foodtruck/whatsapp-order/` if the host preserves this path.

## Configuration

Use an owner-generated URL with `?business=91XXXXXXXXXX` (India country code, digits only). **Do not publish a link before configuring the number.** The number is public in the ordering link by design.

## What works

Menu selection, quantity controls, customer contact validation, pickup-time preference, live subtotal and an order message opened in WhatsApp. A receipt preview is shown locally.

## What does not work yet

This is a **pickup request**, not an automatically accepted order. The customer must tap Send in WhatsApp; the owner must confirm manually. No backend order persistence, unique order IDs, payment capture, payment verification, inventory locking, slot capacity, kitchen alerts, automated WhatsApp replies, or Meta Cloud API integration is included. No automatic payment should be requested or assumed. Prices are placeholders requiring owner approval.

## Phase 2 (requires backend + credentials)

- Secure server-side catalog, stock, pricing, taxes, packing fees and time-slot capacities.
- Persistent orders with idempotency keys, server-generated order IDs, status transitions and customer receipts.
- Razorpay or Cashfree hosted UPI checkout, verified webhook signatures, payment reconciliation and refund handling.
- WhatsApp Business Platform Coexistence onboarding, Cloud API webhook signature verification, secure token storage, approved utility templates, retries and consent.
- Mobile kitchen dashboard with authenticated access and resilient notifications.
- Automated tests for tampered prices, duplicates, payment failures, full slots and cancellation.

Never place Meta access tokens or payment secret keys in the frontend. Deploy to staging, test end-to-end, and only then enable live ordering.
