# NOORMEXA P0 Official Store Recovery — Deployment & Acceptance

**Implementation branch:** `fix/noormexa-p0-official-store-recovery`  
**Baseline `main`:** `5f62430a49bfca05999e3c050e91b20e845c70e9`  
**Supabase Production:** `qiqvmsjjgwdsievkrhly`  
**Official store:** `store-noormexa-official`, canonical slug `noormexa-flagship-direct`.

## Verified root causes

1. Store page read `MarketplaceContext.stores` using fixture slug `noormexa-official`, not the live canonical slug; resulted in false Store Not Found.
2. Store products read `MarketplaceContext.products`; official live products table had 0 rows.
3. Published official marketing read `marketing_posts`; live table had 0 rows after local demo authority removal, and legacy offers used fictitious prices, quantities and coupon codes.
4. Public product details silently displayed `products[0]` for unknown product IDs. That can misrepresent editor-created store products.

## Prepared repair

- `/store/[slug]` resolves through safe public Supabase RPCs, including legacy alias and ID compatibility.
- Canonical store slug normalization via router replacement; no private-store fields.
- Public store lists active products and published posts from Supabase by exact `store_id`.
- A DB lookup failure displays a temporary-unavailable error, not a false Store Not Found.
- Product-detail routes load real public active products first, and strict links from the DB-backed storefront never fall back to demo content.
- Product-detail DB records do not inherit fake local reviews or fake aggregate ratings.
- Public homepage now renders published official-store news from `marketing_posts` in its own responsive section; no legacy fallback if there are no approved published posts.
- Content proposal contains 36 legacy demo products as hidden review-only drafts, and **four NEW truthful editorial posts** about NOORMEXA services replacing fictitious product deals.

## Content safety decision

**The fixture inventory and promotion promises are NOT verified commercial facts.**

Prepared **independent** review-only scripts (apply separately with separate explicit approvals):

- `supabase/data_phase12_official_news_drafts_REVIEW_ONLY.sql` — 4 factual editorial Drafts, with **no product insertion**.
- `supabase/data_phase12_official_store_legacy_backfill_REVIEW_ONLY.sql` — 36 historical product candidates in hidden state with stock zero; **not necessary to publish news**.

- the *products-only* file adds missing product IDs with `status='hidden'` and `stock=0`;
- the *news-only* file adds four newly authored official NOORMEXA editorial posts with stable IDs, `status='draft'`, zero engagement metrics, and no discount/promo codes or product claims;
- explicitly does not migrate any fictitious legacy `post-1` to `post-4` sales offers;
- cannot overwrite edited/published existing rows (`ON CONFLICT DO NOTHING`);
- requires the expected approved official store to exist;
- does not update/delete any existing rows;
- is prepared only and MUST NOT be run automatically.

Before any public activation, owner/editor must validate actual inventory, prices, brand authorization, imagery rights, promo codes, delivery/warranty claims and featured product links. For the four editorial posts, review wording as the site owner and publish only approved copy using the normal authenticated store editor. A published editorial post will appear on the official store and homepage; product purchase links remain absent. Product drafts never show publicly until real stock and price are approved.

## Release order (separate approvals)

1. **Branch Preview / Build:** Verify Vercel preview build at exact Head.
2. **Read-only production review:** Confirm official store exists and content counts/policies are unchanged.
3. **User testing:** Canonical and alias store URLs display correct store (with empty content expected until publication); unknown slug gives a genuine not-found page; system failures give retry feedback.
4. **Content review:** Editorial drafts are genuine platform information rather than fictional deals. Review the exact four messages; verify product inventory before enabling any product draft.
5. **Production Data Approval (separate):** Apply ONLY the four-news-draft script after explicit authorization if the goal is to publish legitimate official updates. The 36-product script stays deferred pending separate catalog review. Record counts before/after; neither script overwrites rows. Old fake offers are never imported.
6. **Store Editor Acceptance:** Login as an authorized official Editor, publish one reviewed actual product and one reviewed post, confirm other stores unaffected, verify Draft remains hidden. Full Production interaction cannot be attested before this step.
7. **Pre-merge verification:** Exact branch Head, Vercel success, latest main, diff scope, homepage official news query and rollback readiness.
8. **Merge approval (separate):** Merge after review; verify Production deployment, canonical + legacy URLs, public product/post consistency and permissions.
9. **Post-release:** Continue NOORMEXA Store Operations & Multi-Team Finalization; global marketplace catalog and other legacy demo/localStorage surfaces remain out of Work Package A.

## Acceptance Matrix

| Scenario | Expected |
| --- | --- |
| `/store/noormexa-flagship-direct` | Real official DB store (not 404) |
| `/store/noormexa-official` | Canonical official slug navigation |
| `/store/store-noormexa-official` | Canonical official slug navigation |
| Unknown store slug | Store Not Found |
| DB/API unavailable | Temporary error with Retry, no false 404 |
| Store A details | Only Store A approved active products and published posts |
| Hidden product | Not exposed on public storefront |
| Draft or archived post | Not exposed on public storefront |
| Strict link to nonexistent product | Not first fixture product |
| Editor creates product | Product stays private until active; public detail resolves DB product once active |
| Editor publishes reviewed platform-news post | Public official store and homepage display it after DB write and new visit/refresh |
| Editor requests another store | RLS denies unauthorized writes |
| Backfill re-run | 0 duplicate IDs, no overwrites |
| Old content before editorial approval | Legacy product fixtures remain hidden and out of stock; truthful new official posts remain draft |
| Legacy fake coupons/discounts | Not imported; no invalid discount is displayed in homepage news |
| Homepage when no published official posts | News section stays hidden; no fake local posts injected |

## Rollback

- No production migration/merge in this branch.
- Backfill is additive and does not delete/overwrite live rows.
- If app deployment misbehaves, roll back Vercel to the last verified successful deployment.
- Do not delete backfilled rows as a rollback without a verified ID/diff review.
- Keep Store/Data Authority consistent; do not reactivate demo state silently.

## Scope guardrails

No changes to Platform Super Admin, Platform Admin, RLS, Auth configuration, secrets, payment logic, global checkout, merchant onboarding or merchant team administration. That work belongs to subsequent explicitly approved packages.

## Phase A update — official editorial content and public news surfaces

- The site's four original demo sales campaigns (`post-1` through `post-4`) are not commercially verified and are excluded from proposed post import.
- The old `INITIAL_MARKETING_POSTS` fixture is now explicitly an empty exported array in `MarketplaceContext`: fake promotional claims cannot reappear through that old constant.
- Four independent, concise NOORMEXA editorial news entries are prepared with IDs `noormexa-official-news-2026-01` through `04`. All belong to `store-noormexa-official` and have no coupon, featured product, fake inventory, manufactured social counts or reused stock photography.
- Home: `src/components/landing/OfficialStoreUpdates.tsx` reads only published rows from Supabase, scoped to the official store. It does not render local demo content, including when the database is empty.
- Store: `/store/[slug]` displays posts as official updates, not automatic active discounts, and does not display unverifiable view/like counts.
- Catalog remains a separate commercial concern: **there are zero verified live products in Production**. The 36 legacy items stay hidden with stock zero if a backfill is explicitly approved, not advertised as genuine ready-to-buy inventory.
- Editor acceptance must include publishing one factual official news post then checking the public homepage and store after reloading; a draft must remain private. After that, real reviewed merchant/store products can be published independently.

## Independent Production data packages

The editorial news package and legacy product candidates are now completely separated. A site owner may approve **news-only draft import** while explicitly rejecting/defering historical product fixtures. This is the recommended first content action. The news package creates four drafts, then official store editor may publish the approved wording through the authenticated dashboard. No fake stock/offers are implied. Public homepage and official store only display actual published posts from Supabase.

## Production Execution Log — 2026-10-09

- **Owner authorization:** User explicitly authorized continuing the next production rollout steps on 2026-10-09.
- **Applied (content DML, not DDL):** `supabase/data_phase12_official_news_drafts_REVIEW_ONLY.sql` once against Supabase `qiqvmsjjgwdsievkrhly` via an approved connected action. The filename is a historical review gate; the SQL is idempotent and should not be applied indiscriminately again.
- **Verified immediately after apply:** exactly four `noormexa-official-news-2026-01..04` rows, all `store_id=store-noormexa-official`, `status=draft`, no promo codes or product links.
- **Products count remains 0**. The legacy product backfill was NOT applied and remains for explicit inventory/content review only.
- Next gate: verify app branch/Vercel, merge with exact Head if successful, then perform authenticated editorial publish and check that public home + store show only `published` entries.
- No changes to Auth, RLS, Secrets, platform roles or team permissions.
