# NOORMEXA Official Catalog Import & CRUD — Stage 1

**Work package:** P0 Official Showcase Recovery.  
**Base:** main `4540cc2a0b6d1aa33036fc72aac605c1b7788517`.  
**Branch:** `feat/noormexa-official-preview-catalog-crud`.  
**Status (historical Stage 1):** PR #12 merged into main on 2026-10-10; authorized Production import completed with 36 preview-only products. Stage 2 Premium Product Editor is under review on an independent branch; no Stage 2 Production changes authorized.

## Staged catalog
- All 36 original product IDs and names are preserved in `data/official-preview-catalog.json` and assigned to `store-noormexa-official`.
- Original illustration images are illustrative and require replacement / usage-rights review. Unverified old brand warranties, reviews, marketing claims and product discount claims are **not** copied.
- Every staged row uses `price=0`, `stock=0`, `status='active'`, `free_shipping=false`. An approved official storefront can display this inventory as **preview only**.
- The public catalog rejects zero-price or zero-stock rows for all non-official stores. The official-only exception does not bypass store approval.
- The live `private.create_checkout_orders_core` SQL was independently inspected read-only: it requires `price>0` and `stock>=requested quantity`; zero-value listings cannot be ordered even by a crafted checkout request.
- Category slugs are mapped to public category UUIDs when present; old data with an unresolvable category is left uncategorized, for seller correction.
- SQL is **generated only**: `node scripts/prepare-official-preview-import.mjs --sql`. It uses insert-only `ON CONFLICT (id) DO NOTHING` and has a guard for the approved official store. It must **not** run against Production without new approval. Existing product edits are never overwritten.

## Seller Center
- Owner/Manager/Editor of the selected store can add/edit/delete products and marketing posts using their existing RLS-enforced session. The writes are restricted by `store_id` and require a returned database record.
- Seller can switch product visibility `active/hidden`, or post visibility `published/draft`. No unverified stock or price is seeded for new products.
- When both verified price and stock become positive, switching to `active` enables immediate checkout; the editor warns and requires confirmation.
- Official staff use existing `/seller/dashboard` roles, not a Service Role key exposed to the browser. Protected owner/Platform permissions remain unchanged.
- No schema, Auth, Secrets, migrations, SMTP, RLS or real customer operations are changed by this code package.

## Acceptance checklist
- [ ] npm dry-run generates exactly 36 unique rows, prices/stocks zero, safe SQL.
- [ ] `node scripts/check-official-showcase.mjs`, TypeScript, ESLint, build / CI pass.
- [ ] Vercel Preview Ready; desktop/mobile: home, marketplace, official store, details, cart disabled.
- [ ] Owner and Editor can edit/hide/show/delete allowed product/post. Support cannot. Tenant B cannot mutate A; platform protected.
- [ ] Attempted checkout with zero-stock official item fails via live secure RPC (test safely on isolated fixture/tenant with explicit authorization; do not create real orders).
- [ ] Owner signoff on images/branding, stock/price and actual buy activation.
- [ ] Separate approval for Production data INSERT; separate approval for Merge.

**Known limitation:** Until the reviewed import is applied to an authorized Supabase environment, a Preview connected to the existing empty Production database will also show zero official products. A successful Vercel Preview deploy alone does not seed data.

## Stage 2 — Premium Product Editor & Catalog Activation P0 (2026-10-10)

- New implementation: `src/components/seller/ProductEditorModal.tsx`, `src/lib/productEditorRules.ts`.
- A four-section desktop/mobile editor replaces the cramped single-sheet modal; header/footer stay visible, form content scrolls independently, RTL/LTR is respected.
- Existing product IDs, images, Arabic/English descriptions and other persisted fields remain unchanged unless an authorized merchant explicitly edits and saves.
- All 36 imported catalog previews retain their legacy description in Production until users make corrections; no automated SQL or mass text replacement.
- Sale activation is blocked in the editor while either old preview placeholder remains, price/stock are invalid, the image is missing, or compare-at price is misleading.
- A merchant confirms genuine price, stock, image rights, and copy before enabling immediate checkout. Visibility `hidden` versus `active` is retained; zero price/stock stay preview-only.
- Duplicate save requests are blocked, dirty-form close/navigation emits a warning, English descriptions can be edited, existing image URL can be collapsed without changing the image.
- Product writes remain backed by Supabase session/RLS and scoped to current `store_id`; no new database RLS/permissions/migration, Auth, SMTP, Secrets or Production mutations.
- Automated smoke tests exercise the **actual TS rules** via `node scripts/test-premium-product-editor.mjs`; check full TS, lint, build in CI.
- Security limitation: client editor confirmation can be bypassed by an authorized user calling Supabase directly; enforcing description and release approval for all database writes would require a separately approved database/RPC policy design. Do not claim it is a server-enforced publishing workflow.
- Approval gates: GitHub CI, Vercel Preview, role-specific RLS E2E, real desktop/mobile interaction, explicit separate Merge, then post-merge Production verification. No automatic Product DB updates.

The Master Store Operations roadmap currently exists on open Draft PR #10, not on main; the Stage 2 handoff is separately documented here and should be reconciled with that roadmap only after approval, without changing PR #10.
