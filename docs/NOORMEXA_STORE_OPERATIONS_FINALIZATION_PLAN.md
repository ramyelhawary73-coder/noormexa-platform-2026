# NOORMEXA Store Operations & Multi-Team Finalization Plan

**Status:** Approved for documentation only. Implementation requires explicit phase approval.  
**Repository:** `ramyelhawary73-coder/noormexa-platform-2026`  
**Baseline main:** `5f62430a49bfca05999e3c050e91b20e845c70e9`  
**Production Supabase:** `qiqvmsjjgwdsievkrhly`  
**Official Store ID:** `store-noormexa-official`  
**Official Store canonical live slug:** `noormexa-flagship-direct`

---

## 1. Executive Goal

NOORMEXA must operate as a real multi-tenant marketplace with:

- one protected platform layer (Super Admin / Platform Admin);
- one official NOORMEXA store owned by the platform;
- independent merchant stores created by sellers;
- store-scoped teams (Owner / Manager / Editor / Support);
- server-authoritative store, product, marketing, order and team data;
- public storefronts that always read from the production database;
- real email invitations for official-store staff and merchant-store staff;
- strict tenant isolation so Store A can never read or mutate Store B private data.

The final authority must be Supabase/Postgres + RLS/RPC/server actions. Demo arrays and localStorage may remain only as development fixtures, never as production business authority.

---

## 2. Current Verified Production State

### Platform / Official Store

- Official store row exists:
  - ID: `store-noormexa-official`
  - Name: `متجر نورميكسا الرسمي`
  - Canonical slug: `noormexa-flagship-direct`
  - Status: `approved`
  - `is_official = true`
  - `is_verified = true`
- Official staff memberships are active and database-backed.
- Super Admin / Platform Admin separation is already in place.
- Vercel Production for baseline main is successful.

### Critical content state

Production currently contains:

- `products = 0`
- official-store products = `0`
- `marketing_posts = 0`
- official published marketing posts = `0`

The visible catalog/products on the website are therefore still supplied by legacy in-app demo data, while official marketing was recently switched to database authority and now correctly returns nothing because Production contains no marketing rows.

---

## 3. Confirmed Root Causes

### RC-01 — “Store Not Found” for the official NOORMEXA store

`src/app/store/[slug]/page.tsx` currently resolves a store from:

`useMarketplace().stores`

That collection is still initialized from `INITIAL_STORES` / localStorage rather than Supabase public-store RPCs.

The legacy in-code official store uses:

`slug = noormexa-official`

Production uses:

`slug = noormexa-flagship-direct`

Therefore an authorized editor can receive the real Production slug from the official workspace API, open the real URL, and the public store page still fails because it searches a stale local array.

**Correct fix:** the public store page must resolve the store from `get_public_store_by_slug` / safe public database queries, not from local state.

---

### RC-02 — Official marketing disappeared after the security cleanup

The previous website contained four legacy `INITIAL_MARKETING_POSTS`, all already tagged with:

`store_id = store-noormexa-official`

The finalization work intentionally removed localStorage/demo marketing as production authority and changed public marketing reads to Supabase.

That cutover was correct, but the legacy official posts were never backfilled to Production. As a result:

`marketing_posts = 0`

and no marketing appears.

**Correct fix:** one controlled, idempotent Production backfill of the approved official content, followed by permanent DB-only marketing authority.

---

### RC-03 — Public storefront products are also still demo-backed

The public store page filters products from `useMarketplace().products`, which is still initialized from `INITIAL_PRODUCTS` / localStorage.

Production contains zero product rows.

This means the current public catalog and the seller management database can diverge: an editor can create a real DB product but the public storefront may continue rendering a different local catalog.

**Correct fix:** migrate the intended official baseline catalog into `products`, then make public storefront/product/marketplace reads database-backed.

---

### RC-04 — Merchant team invitations are not yet the same quality as official-store invitations

The official-store invite path now sends a real Auth email and supports password setup.

The generic merchant flow `invite_store_member_by_email` currently creates a Pending membership but does not complete the same polished email onboarding flow.

**Correct fix:** unify both flows around a server-authenticated invitation service while preserving the existing database role rules.

---

### RC-05 — Store management UX is split

- Official store team: `/admin/team`
- Customer store team: `/seller/team`
- Official staff workspace: `/seller/dashboard`
- Merchant workspace: `/seller/dashboard`

The authorization model is valid, but navigation and ownership responsibilities are fragmented.

**Correct fix:** one Store Control Center experience, while keeping Platform Administration separate.

---

## 4. Target Authorization Model

### Platform layer

#### Platform Super Admin

Protected developer/platform owner.

Can:

- manage platform configuration;
- manage Platform Admins;
- manage official-store team;
- operate any store when explicitly required;
- approve/suspend merchant stores;
- access platform-wide oversight.

Cannot be modified or removed through tenant-store flows.

#### Platform Admin

Platform-wide administration only where explicitly permitted.

Platform Admin status is separate from any store membership.

A Platform Admin may also hold an independent official-store `Manager` membership.

---

### Store layer

#### Owner

Store creator / owner.

Can manage:

- store profile/settings;
- products;
- marketing posts;
- orders;
- shipments;
- team;
- financial/private settings when applicable.

Owner cannot be assigned through a normal invitation. Ownership is created by the secure store-creation workflow or a future dedicated transfer flow.

#### Manager

Can manage operational store functions:

- analytics;
- products;
- marketing;
- orders;
- shipments;
- permitted team roles.

For customer stores, Manager may invite/manage Editor and Support.

For the official store, Manager remains operational only unless separately granted Platform Admin.

#### Editor

Can manage only:

- products/catalog;
- store marketing posts/content.

No platform admin, payouts, banking, orders, shipments or team administration.

#### Support

Can manage only:

- orders;
- shipment/tracking/customer-service operations.

No catalog/marketing/financial/team/platform privileges.

---

## 5. Final Architecture

### 5.1 Public authority

Public pages must use:

- safe public store RPCs;
- public RLS on approved stores;
- active products from approved stores;
- published marketing posts only.

Public UI must never depend on:

- localStorage for business authority;
- `INITIAL_STORES`;
- `INITIAL_PRODUCTS`;
- `INITIAL_MARKETING_POSTS`.

Those constants may survive temporarily only as test/dev fixtures until deleted in cleanup.

### 5.2 Private operational authority

Seller/staff workspaces use:

- authenticated store memberships;
- RLS + private predicates;
- narrowly scoped RPCs/server routes;
- exact `store_id` filtering.

### 5.3 Platform authority

Platform-only actions remain separate from store roles.

A store Manager does not become Platform Admin.

A Platform Admin does not automatically become a store Manager.

---

# 6. Execution Roadmap

## Phase 0 — Emergency Official Store Recovery

**Priority:** P0 / immediate.

### 0A. Fix public store resolution

Refactor `/store/[slug]` so it loads the store from Supabase using the safe public-store RPC.

Requirements:

- canonical lookup by live slug;
- optional lookup by store ID for internal compatibility;
- legacy `noormexa-official` link redirects/aliases to the canonical `noormexa-flagship-direct`;
- no private owner/banking/KYC fields exposed;
- “Store Not Found” shown only after a real DB lookup fails.

### 0B. Make official store products DB-backed

Store page product list must query `products` by the resolved store ID.

Only public-safe active products should render.

### 0C. Make official store posts DB-backed

Store page marketing must query published `marketing_posts` by store ID.

No local fallback in Production.

### 0D. Backfill official content

Prepare an **idempotent additive migration/backfill** containing only approved legacy official content.

Backfill order:

1. official baseline products needed by the public catalog / featured marketing links;
2. the four existing official marketing posts;
3. preserve `store_id = store-noormexa-official`;
4. use `ON CONFLICT DO NOTHING` or equivalent idempotent safeguards;
5. do not overwrite editor-created live rows.

No Production backfill is applied until explicit approval.

### 0E. Verification

- official canonical URL opens;
- legacy official URL redirects or resolves;
- official editor can preview store;
- public visitor sees the same store;
- DB product creation appears publicly;
- Published post appears publicly;
- Draft post does not appear publicly;
- no private store fields are leaked.

**Exit criterion:** Official Store works entirely from DB authority.

---

## Phase 1 — Official Store Control Center

### 1A. Official workspace UX

When an official-store member logs in, show:

- store identity;
- role badge;
- allowed operational tabs only.

Role matrix:

- Owner: full official-store operational access;
- Manager: Analytics + Products + Marketing + Orders + Shipments;
- Editor: Products + Marketing;
- Support: Orders + Shipments.

No Official Staff gets platform administration unless separately Platform Admin.

### 1B. Official team management

Create a clear Official Store Team section.

Super Admin can:

- invite Manager / Editor / Support;
- resend invitation;
- see Pending / Active;
- remove members;
- change allowed roles;
- never demote/remove protected Super Admin through generic team flow.

### 1C. Invitation lifecycle

`Invite → Auth email → Password setup → Active membership → workspace access`

Test:

- brand-new email;
- existing NOORMEXA account;
- resend;
- expired/reused link;
- role change;
- removal.

**Exit criterion:** official staff onboarding is production-complete without manual Supabase work.

---

## Phase 2 — Merchant Store Onboarding

### 2A. Store creation

Keep `create_store_secure` as the only normal creation authority.

Client may submit business/profile data only.

Server/DB owns:

- owner identity;
- store ID;
- status;
- verification;
- official flag;
- commission;
- effective plan;
- owner membership.

### 2B. Merchant lifecycle

`Sign up → Create Store → Pending → Platform Review → Approved → Public Store`

Seller dashboard must clearly show:

- Pending;
- Approved;
- Suspended.

Pending stores must not become publicly discoverable.

### 2C. Admin approval center

Platform Admin/Super Admin can review:

- business info;
- KYC fields;
- store status;
- commission/effective plan.

Remove/disable “Create Official Store” once the one protected official store exists.

**Exit criterion:** a new merchant can create a real isolated store and wait for approval safely.

---

## Phase 3 — Multi-Team Merchant Store Management

### 3A. Unified merchant team flow

Owner can invite:

- Manager;
- Editor;
- Support.

Manager can invite:

- Editor;
- Support.

Editor / Support cannot manage team.

### 3B. Real email invitations for merchant stores

Create a server-authenticated tenant-team invite endpoint reusing the successful official invite architecture.

Requirements:

- validates caller session;
- validates caller role from DB;
- generic errors that do not disclose Platform accounts;
- creates/refreshes Pending membership through approved RPC;
- sends Auth invitation/recovery email;
- supports resend;
- supports existing-account activation;
- no client-supplied privileged identity.

### 3C. Pending invite administration

Owner/Manager can see appropriate pending invitations for their own store and:

- resend;
- cancel;
- change permitted role before activation.

Do not expose pending emails cross-tenant.

### 3D. Tenant isolation tests

Prove:

- Store A owner cannot list Store B team;
- Store A manager cannot invite into Store B;
- Editor cannot mutate orders;
- Support cannot mutate products/marketing;
- no store role can reach platform-admin data.

**Exit criterion:** team management works for any merchant store without developer assistance.

---

## Phase 4 — Public Marketplace Database Authority Cutover

### 4A. Stores

All public store cards/search/detail pages use approved stores from DB.

### 4B. Products

All public catalog/search/product/store surfaces use DB products.

Remove Production dependence on `INITIAL_PRODUCTS`.

### 4C. Marketing

Marketing model:

- every store post has a real `store_id`;
- Draft = private;
- Published = public if its store is approved;
- Official posts get official badge;
- pinned official posts may be prioritized by UI;
- merchant posts never impersonate NOORMEXA.

### 4D. Platform announcements vs store marketing

Keep these concepts separate:

**Store marketing**
- product campaigns;
- promo posts;
- store offers;
- belongs to a store.

**Platform announcement**
- maintenance;
- global marketplace notice;
- policy/service notification;
- platform promotion if intentionally global.

Do not model a global system banner as a fake merchant post.

### 4E. Legacy fixture cleanup

After DB parity is verified:

- remove Production reads from `INITIAL_STORES`;
- remove Production reads from `INITIAL_PRODUCTS`;
- remove Production reads from `INITIAL_MARKETING_POSTS`;
- remove obsolete localStorage business keys.

Keep fixtures only in explicit dev/test modules if still useful.

**Exit criterion:** refresh/new device/incognito all show identical DB-backed marketplace data.

---

## Phase 5 — Store Operations Completeness

### 5A. Product management

- create;
- edit;
- archive/hide;
- stock;
- images;
- validation;
- tenant-scoped RLS.

### 5B. Marketing management

- create Draft;
- publish;
- edit;
- archive;
- pin where authorized;
- attach product;
- attach promo code safely.

### 5C. Orders

Store roles see only authorized store orders.

Ensure legal state transitions and no cross-store updates.

### 5D. Shipments

Store-scoped shipment access.

Support/Manager operational controls only.

### 5E. Financial/private settings

Owner/authorized Manager only for customer stores.

Official operational staff must not receive banking/payout controls.

**Exit criterion:** seller operations require no local/demo state.

---

## Phase 6 — Platform Administration Cleanup

Platform Admin Center must contain only platform concerns:

- store approval/suspension;
- commissions/plans;
- Platform Admin management;
- official-store team owner controls;
- platform announcements;
- marketplace-wide oversight.

Move store-operational editing out of Platform Admin where it belongs in Store Control Center.

Preserve Super Admin protection.

---

## Phase 7 — Security / Data Integrity Final Pass

Review:

- RLS for stores/products/orders/shipments/marketing/posts/team;
- SECURITY DEFINER grants and search_path;
- server-side Service Role use;
- invitation enumeration;
- platform-account isolation;
- store ID trust boundaries;
- direct insert/update grants;
- payment/order integrity already hardened in previous phases;
- unsafe legacy functions and unused RPCs.

No destructive cleanup until backups/usage are verified.

---

## Phase 8 — End-to-End Acceptance Suite

### Official Store test

1. Super Admin login.
2. Invite fresh Editor.
3. Email received.
4. Password setup.
5. Editor badge is correct.
6. Editor opens Official Store Control Center.
7. Editor creates product.
8. Product appears in public official store.
9. Editor creates Draft post.
10. Draft is hidden publicly.
11. Editor publishes post.
12. Post appears publicly.
13. Editor cannot access Orders/Shipments/Admin/Financials.

### Merchant test

1. fresh merchant account;
2. create store;
3. status Pending;
4. platform approves it;
5. public storefront becomes visible;
6. owner adds product;
7. owner publishes marketing post;
8. owner invites Manager;
9. Manager invites Editor;
10. Editor manages catalog/marketing only;
11. Support manages orders/shipments only;
12. Store A cannot access Store B data.

### Platform test

- Super Admin protection remains intact;
- Platform Admin permissions remain as designed;
- Official Store membership remains independent from Platform Admin status.

---

## Phase 9 — Deployment Strategy

Every implementation batch follows:

`READ → ROOT CAUSE → PLAN → APPROVAL → BRANCH → IMPLEMENT → TEST → PREVIEW → USER TEST → PRE-MERGE → MERGE → PRODUCTION VERIFY`

### Recommended release order

1. **Additive Foundation**
   - safe helper/RPC additions;
   - idempotent backfill migration prepared;
   - no restrictive cutover yet.

2. **App Compatibility**
   - app learns DB-backed store/product/post reads;
   - new invite API;
   - unified team/control-center UI.

3. **Data Backfill**
   - insert approved official catalog/post baseline;
   - verify exact row counts and IDs.

4. **Authority Cutover**
   - remove local/demo Production authority;
   - enforce final safe paths.

5. **Security Cutover**
   - revoke obsolete grants/routes only after app compatibility is live.

6. **Production Verification**
   - canonical store;
   - products;
   - posts;
   - role matrix;
   - invites;
   - tenant isolation;
   - Vercel Production status.

---

## 10. Rollback Strategy

For each phase:

- migrations must be additive/idempotent where possible;
- never overwrite unknown customer data;
- backfill rows use stable known IDs and conflict-safe inserts;
- keep previous app deployment available in Vercel;
- if a cutover fails, restore previous app while additive DB structures remain harmless;
- destructive removal of legacy columns/functions is deferred until the final cleanup after production stability.

---

## 11. Immediate Next Work Package

### Work Package A — P0 Official Store Recovery

Scope:

- DB-backed `/store/[slug]`;
- canonical/legacy slug compatibility;
- DB-backed store products;
- DB-backed store published posts;
- prepare official products/posts backfill;
- Vercel Preview;
- no Production migration without approval.

Expected affected areas:

- `src/app/store/[slug]/page.tsx`
- `src/lib/marketplace.ts` or a new public-store data module
- public product/store helpers as required
- one additive/idempotent migration for official baseline content
- tests/verification scripts

### Work Package B — Store Operations & Multi-Team

After A is verified:

- unified Store Control Center;
- real merchant team email invites;
- pending invite administration;
- seller approval lifecycle;
- multi-store team tests.

### Work Package C — Marketplace Authority Cutover

After B:

- public marketplace/search/product surfaces to DB;
- legacy fixture/localStorage removal from Production authority;
- final platform/store marketing separation.

---

## 12. Stop Gates Requiring Explicit Approval

Explicit approval is required before:

- applying any Production migration/backfill;
- changing RLS/security-definer grants;
- changing Auth configuration;
- deleting/overwriting live data;
- merging to `main`;
- Production deployment changes outside normal merge deployment;
- changing Super Admin / Platform Admin permissions.

---

## 13. Definition of Done

NOORMEXA Store Operations & Multi-Team Finalization is complete only when:

- Official Store canonical URL works from DB;
- no public store/product/post relies on browser localStorage/demo authority;
- official baseline products/posts exist in DB or are intentionally replaced with approved live content;
- editor-created official content appears publicly;
- merchant-created approved-store content appears only for that store;
- all store teams use real email onboarding;
- role permissions match DB enforcement;
- cross-tenant access tests fail safely;
- platform roles remain isolated from store roles;
- Preview and Production builds pass;
- Production is manually verified with Super Admin, Platform Admin, Official Editor, Merchant Owner, Merchant Editor and Merchant Support test journeys.


---

## Implementation status update — 2026-10-09

- **P0 official store:** PR #7 merged on `main`; `noormexa-flagship-direct` reads real DB store/products/marketing. Four factual official posts published; 36 legacy demo product rows remain unimported, not sellable.
- **P0 catalog authority:** Draft PR #8 (`fix/noormexa-marketplace-catalog-authority-p0`) passes Vercel Preview. It eliminates local demo product/store authority from public marketplace/home/cart and adds server-consistent stock/cart/checkout readiness. Production unaffected; requires acceptance and merge approval.
- **B / Merchant Multi-Team core:** dependent implementation branch `feat/noormexa-store-operations-multi-team` starts from PR #8 head (not from `main`), adds server-validated tenant email invitation endpoint with role/RPC checks and pending invitation UI. No Production migrations.
- **Pending validation:** browser acceptance with active Owner, Manager, Editor, Support; SMTP Preview configuration; new/existing account invitations; cross-tenant access and Platform account protection. Do not claim E2E success from Vercel Build alone.
- **Remaining separate work packages:** complete merchant onboarding status UX; approved merchant storefront public test; catalog CRUD and real inventory; outstanding global demo/business-copy truth audit; financial/checkout contract verification; full regression/CI, user Preview approval, staged merge and Production verification.

The independent P0 and B PRs must be reviewed/merged **in order**. No work is authorized to silently merge them or execute Production migrations.
