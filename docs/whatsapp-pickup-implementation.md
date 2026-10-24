# WhatsApp pickup ordering — implementation contract

This feature is **pickup only** and uses the existing Food Truck website and the owner's existing WhatsApp Business number. Never hardcode the business number, Meta tokens or payment secrets.

## Architecture
1. Customer opens a WhatsApp chat via the official Cloud API number or the website's order link.
2. Meta sends signed inbound webhooks to `POST /foodtruck-api/whatsapp/webhook`. Verify `X-Hub-Signature-256` using the raw request body and `META_APP_SECRET`; reject invalid signatures.
3. Persist messages and conversation state keyed by WhatsApp sender ID. Deduplicate by Meta message ID, and acknowledge webhooks quickly. Process asynchronously with bounded retries.
4. Build the cart from **server-side current menu, price and availability**, never from client totals. Confirm quantities, total, pickup time and payment method before order creation.
5. On confirmation, atomically create one order with a unique order number and idempotency key, then send a receipt and pickup instructions through the WhatsApp Cloud API. If delivery fails, retain the order and retry sending; never create another order.
6. Payment defaults to **cash on pickup** or **UPI on pickup**. Mark payment as received only after verified payment-provider callback or an authenticated owner action; never infer payment from a WhatsApp message.
7. Owner Android phone uses the existing mobile-friendly Food Truck dashboard with audible/visual pending-order alerts, order acceptance, preparation, ready and collected statuses. Protect admin routes with authentication.
8. Apply business hours in Asia/Kolkata, default 07:00–12:00, configurable per day; reject unavailable items and closed hours politely.
9. Collect minimum customer data, encrypt secrets, restrict log PII, and implement retention/deletion controls. Follow Meta's 24-hour customer-service messaging window and approved templates for outbound messages outside it.

## Configuration (server only)
`WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `META_APP_SECRET`, `WHATSAPP_GRAPH_API_VERSION`, `PUBLIC_ORDER_URL`. Do not enable live automation until the owner completes Meta registration, webhook verification, app review where applicable, and number migration/coexistence checks.

## Auto-update agent (safe mode)
Use a scheduled GitHub Actions workflow to check dependency/security updates, run lint/build/tests and open a **pull request** with the report. Require review and green checks before merge. Never auto-deploy untested code, change secrets, or modify payments/order state without approval.

## Acceptance tests
- Webhook challenge and signature pass/fail; duplicate inbound messages.
- Empty cart, unavailable item, changed price, closed hours, malformed input.
- One confirmation produces exactly one persisted order and receipt.
- Provider outage queues receipt retry without duplicate orders.
- Owner authorization, status changes and payment verification.
- Automated update PR does not bypass protected branch checks.

## Owner Meta setup
1. In Meta for Developers create a Business app and add WhatsApp.
2. Link the existing WhatsApp Business number only after checking Meta's supported coexistence or migration path; avoid disrupting the live number.
3. Set callback to `https://YOUR_DOMAIN/foodtruck-api/whatsapp/webhook`, create a private verify token and subscribe to messages.
4. Configure a system-user access token with appropriate WhatsApp permissions; store secrets in server environment, never Git.
5. Test with an authorized test recipient, then configure business profile, message templates and production permissions.
