# NOORMEXA P0 Official Store Recovery — Deployment & Acceptance

**Implementation branch:** `fix/noormexa-p0-official-store-recovery`  
**Baseline `main`:** `5f62430a49bfca05999e3c050e91b20e845c70e9`  
**Supabase Production:** `qiqvmsjjgwdsievkrhly`  
**Official store:** `store-noormexa-official`, canonical slug `noormexa-flagship-direct`.

## Verified root causes

1. Store page read `MarketplaceContext.stores` using fixture slug `noormexa-official`, not the live canonical slug; resulted in false Store Not Found.
2. Store products read `MarketplaceContext.products`; official live products table had 0 rows.
3. Published official marketing read `marketing_posts`; live table had 0 rows after local demo authority removal.
4. Public product details silently displayed `products[0]` for unknown product IDs. That can misrepresent editor-created store products.

## Prepared repair

- `/store/[slug]` resolves through safe public Supabase RPCs, including legacy alias and ID compatibility.
- Canonical store slug normalization via router replacement; no private-store fields.
- Public store lists active products and published posts from Supabase by exact `store_id`.
- A DB lookup failure displays a temporary-unavailable error, not a false Store Not Found.
- Product-detail routes load real public active products first, and strict links from the DB-backed storefront never fall back to demo content.
- Product-detail DB records do not inherit fake local reviews or fake aggregate ratings.
- Legacy content proposal contains 36 demo product records and four marketing posts, using conflict-safe inserts only.

## Content safety decision

**The fixture inventory and promotion promises are NOT verified commercial facts.**

Prepared backfill script:

`supabase/data_phase12_official_store_legacy_backfill_REVIEW_ONLY.sql`

- adds missing product IDs only, with `status='hidden'` and `stock=0`;
- adds missing post IDs only, with `status='draft'`, zero verified engagement metrics;
- cannot overwrite edited/published existing rows (`ON CONFLICT DO NOTHING`);
- requires the expected approved official store to exist;
- does not update/delete any existing rows;
- is prepared only and MUST NOT be run automatically.

Before any public activation, owner/editor must validate actual inventory, prices, brand authorization, imagery rights, promo codes, delivery/warranty claims and featured product links. Once validated, the normal authenticated storefront editor publishes legitimate products/posts.

## Release order (separate approvals)

1. **Branch Preview / Build:** Verify Vercel preview build at exact Head.
2. **Read-only production review:** Confirm official store exists and content counts/policies are unchanged.
3. **User testing:** Canonical and alias store URLs display correct store (with empty content expected until publication); unknown slug gives a genuine not-found page; system failures give retry feedback.
4. **Content review:** Approve the exact legacy rows or choose to replace fixtures with genuine inventory/posts.
5. **Production Data Approval (separate):** Apply the review-only backfill using an explicitly authorized controlled database operation. Record counts before/after, verify no overwrites.
6. **Store Editor Acceptance:** Login as an authorized official Editor, publish one reviewed actual product and one reviewed post, confirm other stores unaffected, verify Draft remains hidden. Full Production interaction cannot be attested before this step.
7. **Pre-merge verification:** Exact branch Head, Vercel success, latest main, diff scope and rollback readiness.
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
| Editor publishes real post | Public official store displays it after DB write |
| Editor requests another store | RLS denies unauthorized writes |
| Backfill re-run | 0 duplicate IDs, no overwrites |
| Old content before editorial approval | Hidden/draft, not falsely advertised |

## Rollback

- No production migration/merge in this branch.
- Backfill is additive and does not delete/overwrite live rows.
- If app deployment misbehaves, roll back Vercel to the last verified successful deployment.
- Do not delete backfilled rows as a rollback without a verified ID/diff review.
- Keep Store/Data Authority consistent; do not reactivate demo state silently.

## Scope guardrails

No changes to Platform Super Admin, Platform Admin, RLS, Auth configuration, secrets, payment logic, global checkout, merchant onboarding or merchant team administration. That work belongs to subsequent explicitly approved packages.
