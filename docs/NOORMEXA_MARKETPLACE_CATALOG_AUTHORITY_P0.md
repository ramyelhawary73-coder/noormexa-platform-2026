# NOORMEXA — Marketplace Catalog Authority P0

Status: implementation ready for Preview review only; NO MERGE / NO PRODUCTION DATABASE MUTATION.

Baseline `main`: `e026206372ff445ad724fecdc625f40fa26963c5`.
Branch: `fix/noormexa-marketplace-catalog-authority-p0`.

## Root causes

- Public `MarketplaceContext.products` was initially populated with the 36 `INITIAL_PRODUCTS` demo entries.
- Previously saved `noormexa_products_v5` and `noormexa_stores_v4` browser data could override the production catalog.
- The homepage promoted fictional 35% discounts, urgency counters, coupons and buyer stories, while Production had zero products.
- Saved cart items persisted obsolete prices, stock and product references. The server-side `create_checkout_orders_secure` RPC remained protected, but the user interface was inconsistent.

## Work completed

- `src/lib/publicCatalog.ts`: read the public approved-store RPC and Supabase products with `active` status, positive stock and positive price. Filter using approved store IDs, even for logged-in operators who may have private tenant SELECT permissions.
- `MarketplaceContext`: start public catalog as empty, ignore demo/localStorage product and store keys, load database catalog, expose `catalogStatus` + retry, reconcile old carts against live product IDs, prices, stock and store identity.
- Legacy product mutations no longer insert optimistic fake merchandise into public state; database RLS verifies writes.
- Cart and checkout display a loading/error gate; checkout refuses to submit until live catalog has been verified.
- Homepage has a genuine live-product section plus official-store editorial discovery when there are no sellable products. Removed unverified flash quantities, coupon promos and alleged verified buyer videos from the public homepage.
- Marketplace now shows real inventory, honest empty/error states, no invented coupons, no fake 5-star fallback; official-only filter matches the actual official store.

## Test evidence

- Vercel Preview TypeScript/build: SUCCESS at final checked code head (see PR status).
- Static authority/security checks: 15 passed.
- Read-only Supabase anonymous-role verification: 1 approved public store, 0 live sellable products and 4 published official news posts at time of review.
- No Production migration, product seed, RLS/Auth/team change or merge.

## Acceptance cases for Preview

1. Fresh browser sees no fictional sellable catalog and sees official-store news/CTA.
2. Browser previously containing `noormexa_products_v5` still sees DB-only catalog.
3. Legacy saved cart with nonexistent product is pruned after catalog load; checkout cannot proceed with it.
4. Data/network error shows retry, not a real product offer.
5. Product creation by authorized store editor becomes publicly visible only after a valid DB insert with positive stock and active status.
6. Anonymous user never sees pending/suspended store, private/draft products or other tenants' content.
7. Official store posts remain visible under `/store/noormexa-flagship-direct`.
8. Server checkout rejects invalid inventory and never trusts browser prices.

## Known pending scope / release gates

- Current Production has zero real sellable products. **Do not fabricate stock or claim products are on sale.** Content requires genuine merchant/official inventory.
- Category artwork, brand marketing copy, legacy platform settings, and B2B/contact demo flows need separate validation before full marketplace release. No destructive removal during this P0.
- Do not merge before owner Preview acceptance. Do not change Production DB, RLS or Auth.
- Next dependent work package: `NOORMEXA Store Operations & Multi-Team Finalization`, including real merchant-store invitations and pending team listing, then merchant onboarding E2E tests. Use an independent branch based on this P0 branch until P0 is approved/merged.
