EditImages is a [Next.js](https://nextjs.org) static-export project for focused e-commerce product image workflows at `https://editimages.app`.

## Marketplace Image Pack MVP

Open `/marketplace-image-fixer/` to use the local browser workflow: add up to 25 images, select Amazon/Etsy/eBay output packs, review deterministic square JPG previews, and download a ZIP containing platform folders plus `manifest.json`. Images are processed in the browser and are not uploaded to a third-party service.

Open `/edit-text-in-product-image/` to upload an image locally, position a replacement text overlay, adjust font size, colors, and alignment, then export PNG or JPG. The MVP does not automatically restore original fonts, textures, or backgrounds.

The local MVP only resizes onto a white canvas and converts to JPG. It does not remove backgrounds, generate scenes, or make visual compliance decisions. The local ZIP remains free and does not consume credits.

## Account, credits, and payment skeleton

The Next.js site remains an `output: "export"` static build. Runtime account and billing routes are implemented by the Cloudflare Pages Worker in `public/_worker.js`, backed by a development D1 database using the ordered SQL files under `migrations/`.

- Development login is available only for a local host when an explicit local override sets `AUTH_MODE=development`; the committed Pages configuration sets `AUTH_MODE=disabled`, and the Worker rejects development login on non-local hostnames even if a deployment environment is misconfigured.
- `/account/` is protected by an HttpOnly signed session and displays real D1-backed empty states, orders, exports, plan, and balance.
- Checkout returns `503 CHECKOUT_UNAVAILABLE` unless `PAYMENT_PROVIDER=mock`. The mock contract creates a pending order but never charges money.
- Credits are granted only by a valid signed `checkout.completed` webhook. Duplicate webhook IDs are idempotent.
- Failed export records cost zero. A completed server-side export consumes one credit once per idempotency key. The current browser ZIP does not call that endpoint.

## Commercial validation funnel

The homepage keeps the working local tools free and presents a clearly labeled, non-purchasable `$9/month` Seller pricing test. The `Register paid interest` CTA submits email, price intent, and an optional workflow problem to `POST /api/early-access`; the Pages Worker validates and upserts the lead in D1 instead of showing a false success state. GA4 records the pricing CTA and form success/failure when `NEXT_PUBLIC_GA_ID` is configured.

Apply `migrations/0001_billing.sql` first and then the incremental `migrations/0002_early_access.sql` to the EditImages D1 database before deploying this change. Do not edit or reapply `0001` on a database that has already recorded it. This repository does not run production migrations automatically.

The anonymous endpoint fails closed with `503 SIGNUP_UNAVAILABLE` when the `DB` binding or Cloudflare-provided `CF-Connecting-IP` is unavailable. The Worker enforces JSON-only requests, a 2 KiB body limit, two server-validated honeypot fields, and a D1-backed fixed window of five requests per Cloudflare client IP per hour. The IP is SHA-256 hashed with the window start before storage; raw IP addresses are not persisted. Cloudflare Pages Worker isolates and module memory are not globally durable, so an in-memory counter would only be a best-effort per-isolate guard. D1 makes the counter shared and its single-statement upsert atomic, at the cost of a D1 operation per accepted non-bot attempt. The bounded opportunistic cleanup may leave expired buckets temporarily, but expired buckets never affect a new window.

Real checkout remains disabled until a payment provider adapter is implemented and the following external inputs exist: a provider account, an approved product/price ID, webhook signing secret, production session/OAuth configuration, and the EditImages D1 binding. Do not set `PAYMENT_PROVIDER=mock` or `AUTH_MODE=development` in production.

Local setup (safe placeholders only):

```bash
cp .env.example .env.local
npx wrangler d1 migrations apply ai-product-photo-dev --local
npx wrangler pages dev out
```

For local testing only, set Wrangler secrets with non-production development values for `SESSION_SECRET` and `WEBHOOK_SECRET`, then explicitly override `AUTH_MODE=development` in the local Pages dev environment (for example with `wrangler pages dev --var AUTH_MODE:development out`). Never put that override in the committed `wrangler.jsonc`; the Worker also rejects it on non-local hostnames. A real payment adapter, OAuth credentials, D1 database ID, and production OAuth remain external configuration gaps and were not created by this change.

### KindReply reference audit

Reviewed `/root/kindreply-api/package.json`, `/root/kindreply-api/src/index.ts`, `/root/kindreply-api/wrangler.jsonc`, and its clean Git `main` checkout. Reused the proven separation between a static frontend/API proxy and a Cloudflare Worker billing boundary, session endpoint semantics, protected checkout, D1-backed user lookup, credit consumption/refund boundary, and provider-unavailable responses. Did not copy KindReply credentials, production bindings/data, Google OAuth configuration, OpenRouter integration, billing API keys, or production service-binding values. This project uses a self-contained development Worker because those external services are not authorized or configured here.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The product scene demo remains at `/`; marketplace packs are at `/marketplace-image-fixer/`; text editing is at `/edit-text-in-product-image/`.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

This project uses Next.js static export with trailing slashes and unoptimized images for hosting on static platforms.
