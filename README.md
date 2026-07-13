EditImages is a [Next.js](https://nextjs.org) static-export project for focused e-commerce product image workflows at `https://editimages.app`.

## Marketplace Image Pack MVP

Open `/marketplace-image-fixer/` to use the local browser workflow: add up to 25 images, select Amazon/Etsy/eBay output packs, review deterministic square JPG previews, and download a ZIP containing platform folders plus `manifest.json`. Images are processed in the browser and are not uploaded to a third-party service.

Open `/edit-text-in-product-image/` to upload an image locally, position a replacement text overlay, adjust font size, colors, and alignment, then export PNG or JPG. The MVP does not automatically restore original fonts, textures, or backgrounds.

The local MVP only resizes onto a white canvas and converts to JPG. It does not remove backgrounds, generate scenes, or make visual compliance decisions. The local ZIP remains free and does not consume credits.

## Account, credits, and payment skeleton

The Next.js site remains an `output: "export"` static build. Runtime account and billing routes are implemented by the Cloudflare Pages Worker in `public/_worker.js`, backed by a development D1 database using `migrations/0001_billing.sql`.

- Development login is available only when `AUTH_MODE=development`; the committed Pages configuration sets `AUTH_MODE=disabled`, and production OAuth is intentionally not faked.
- `/account/` is protected by an HttpOnly signed session and displays real D1-backed empty states, orders, exports, plan, and balance.
- Checkout returns `503 CHECKOUT_UNAVAILABLE` unless `PAYMENT_PROVIDER=mock`. The mock contract creates a pending order but never charges money.
- Credits are granted only by a valid signed `checkout.completed` webhook. Duplicate webhook IDs are idempotent.
- Failed export records cost zero. A completed server-side export consumes one credit once per idempotency key. The current browser ZIP does not call that endpoint.

Local setup (safe placeholders only):

```bash
cp .env.example .env.local
npx wrangler d1 migrations apply ai-product-photo-dev --local
npx wrangler pages dev out
```

For local testing only, set Wrangler secrets with non-production development values for `SESSION_SECRET` and `WEBHOOK_SECRET`, then override `AUTH_MODE=development`. A real payment adapter, OAuth credentials, D1 database ID, and production OAuth remain external configuration gaps and were not created by this change.

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
