# NOORMEXA — Store Operations & Multi-Team Master Roadmap

**Updated:** 2026-10-10  
**Status:** Work Package A1 rebased via merge commit onto PR #11's merged `main`; automated checks pass; Preview browser and role acceptance remain open. No A1 production deployment, database changes or merge authorized.  
**Source:** latest `main` at start of A1: `ae968f093a9f3d8fc533de7edad02f7407107ff9`.  
**Implementation branch:** `fix/noormexa-a1-production-commercial-truth`.  
**Supabase:** `qiqvmsjjgwdsievkrhly`. **Official store:** `store-noormexa-official` / `noormexa-flagship-direct`.  

## Governance

READ → ROOT CAUSE → PLAN → APPROVAL → BRANCH → IMPLEMENT → TEST → PREVIEW → USER ACCEPTANCE → PRE-MERGE → APPROVED MERGE → PRODUCTION VERIFY.

No direct edits to `main`, production DB changes, RLS/Authentication/SMTP/secrets changes, invitations, real messages, purchases or destructive cleanup without separately scoped authorization. Branch commits and Draft PR do **not** imply acceptance. A failed test or missing Preview is an open gate, never a success. Data authority: live Supabase + RLS/RPC/server checks, not `localStorage` or bundled fixtures.

## Verified evidence vs outstanding acceptance

- PR #7 — Official Store Recovery: merged; public canonical and legacy official URLs now resolve from Supabase according to merged implementation. Browser acceptance is still required.
- PR #8 — Marketplace Catalog Authority P0: merged as `ae968f093a9f3d8fc533de7edad02f7407107ff9`. Catalog now uses approved, sellable, positive-price/stock DB inventory; legacy cart is reconciled against current inventory. Full browser acceptance is outstanding.
- PR #11 — React Hooks Lint Baseline: **MERGED** into `main` on 2026-10-10, merge SHA `4540cc2a0b6d1aa33036fc72aac605c1b7788517`. TypeScript / full ESLint / Next build passed, deployment status succeeded; interactive browser role tests remain pending.
- PR #9 — Merchant Email Invitations: **OPEN DRAFT**, not merged. Based on former catalog feature branch; must be reviewed/rebased or retargeted safely on current `main`, retested and accepted separately. Do not discard its code.
- Documentation branch `docs/noormexa-store-operations-finalization-plan` exists at `4dec69be0a85525a6c705f729472b7fee67a6936`; it describes an older state (before 4 official posts and before catalog repair). Preserve branch unchanged as historical source; this document becomes the canonical roadmap after approval and merge.
- Production read-only check (2026-10-09): one approved official store; 0 products; 4 published official `marketing_posts`; 0 orders; 0 shipments; 3 active official members (owner/manager/editor). All principal business tables inspected have RLS enabled.
- Vercel connected account available to this session did not list NOORMEXA; no independent deployment inspection, browser E2E, or functional role tests have been completed in A1.
- Security Advisor follow-up: `order_items` RLS with no policies; public/authenticated `SECURITY DEFINER` RPC execution surfaces; leaked-password protection disabled. Findings require targeted analysis, not blanket permission revocation.
- Known remaining code risks before A1: fabricated homepage testimonials/stats; browser-seeded fake operational orders/payouts/shipments; fabricated admin analytics; local-only order/payout decisions.

## Phase A — Catalog / Commercial Truth Final Gate

### A1 — Commercial Truth and Roadmap (current branch; P0)
- [x] Read-only repository and Supabase diagnosis.
- [x] Prepare truthful replacement for fictional homepage testimonials / platform scale figures / brand-partner display; keep strong responsive sections.
- [x] Stop demo orders, shipments and payouts from hydrating browser business state; preserve legacy localStorage keys without deleting data.
- [x] Read platform orders from RLS-backed `orders` and stop display of fabricated analytics or payout transactions.
- [x] Add regression assertions for authority boundaries.
- [x] `node scripts/check-production-commercial-truth.mjs`: 18/18 assertions passed (GitHub Actions run `37985604510`).
- [x] `npx tsc --noEmit`: passed in run `37985604510`.
- [x] `npm run build`: passed in run `37985604510`; Vercel Preview also reported Ready for code SHA `c26ce6d41cb0371f4b9fb0e106b6b2425fba6c74`.
- [x] `npm run lint`: passed on the reconciled A1 branch after PR #11 was merged (GitHub Actions runs `38024426868` and `38024426814`). Historical A1 run `37985604510` failed on inherited hook errors before PR #11; those are no longer a release blocker.
- [ ] Browser role tests/Preview inspection remain outstanding. Vercel project is under `ramyelhawary73-coders-projects`, not the connected Vercel team, so only GitHub's deployment status/Preview link could be verified.
- [ ] Verify Preview desktop/mobile, public empty/error/catalog states, old cached cart, restricted admin reads; review final diff, receive user's acceptance.
- [ ] Separate merge approval, production smoke check, no regression.
**Exit:** no demo sales or testimonials are presented as commercial evidence; real admin metrics are never replaced by demo browser data; checks, Preview and review pass.

### A2 — Catalog Authority Browser Acceptance
- Cover home, marketplace, categories, search, filtering, canonical/legacy store URLs, invalid product IDs, cart reconciliation, checkout negative cases, network failure/retry, private drafts.
- Explicitly inspect remaining marketing text and genuine stock, ratings, discounts, currencies/shipping representations. Separate code branch if new defects found.
**Exit:** executable browser evidence, no fake sale and no checkout trust of client prices.

## Phase B — Store Control Center
- Align `/seller/dashboard` and role-aware navigation. Use server-authorized store list and scoped RLS reads.
- Owner: store operations/settings/team; Manager: allowed operations and allowed team roles; Editor: catalog/marketing; Support: orders/shipments.
- No official store staff access to banking/payout or platform Admin by implicit membership.
- Real order, stock, marketing and performance counts only. Responsive/mobile acceptance.
**Exit:** UI + API tests prove every role sees and operates only allowed views and store IDs.
**DB:** none initially; add only after evidence of missing authority.

## Phase C — Merchant Application and Platform Approval
- Preserve `create_store_secure`: derive owner from `auth.uid()`, set `pending`, never trust client `approved`, `is_official`, `is_verified`, commission or owner membership.
- Exercise Signup → Pending Application → Platform Review → Approved → Store Workspace.
- Pending/suspended storefronts must not leak into public catalog. Protected official store creation remains inaccessible to merchants.
**Exit:** actual isolated merchant onboarding in non-production fixture environment, negative elevation tests.
**DB:** only if missing workflows/policies shown by tests. Production mutations need separate approval.

## Phase D — Merchant Multi-Team / Real Invites
- Evaluate and preserve existing Draft PR #9. No duplicate implementation.
- Invite via server verified session, store ID and DB role ceiling. Owner can invite Manager/Editor/Support; Manager only Editor/Support; Editor/Support cannot invite; never invite as Owner.
- Plan states Pending → Accepted → Active, resend, expiry/replay, revoke/remove, existing vs new account, reporting failures.
- Current `store_members.status`: `pending`, `active`, `disabled`. Dedicated acceptance/expiry tracking **may require** an additive migration; design must be approved separately.
- Real email requires explicit SMTP/Auth/delivery test approval. No real invitation sent by automated acceptance without it.
**Exit:** fresh accounts and both stores pass invite and negative access suite with email evidence.
**DB:** possible additive migration, plus separate Auth/SMTP changes if required.

## Phase E — Official Store Operational Acceptance
- Confirm official Editor lands in `/seller/dashboard` on the actual official store; can add genuine products / draft and publish owned posts only.
- Confirm Editor cannot see orders, finance, other stores, platform admin; protected Super Admin cannot be demoted through store flows.
- Limit official workspace response to role-required fields; remove finance/plan leaks as needed.
**Exit:** real constrained account E2E; server-side permission tests.
**DB:** no planned migration until specific gap identified.

## Phase F — Real Product Launch
- Enter genuinely authorized catalog with approved name, imagery/license, price, currency, stock, warranty/delivery and seller ownership.
- `products` remains zero until authorized staff create verified merchandise. Never publish the 36 historical fixture products automatically.
- Review `createProduct()` currently writes `status='active'` directly; add explicit draft/review gate if required before selling.
- Verify an approved product appears, can be purchased under protected checkout stock/price conditions; test only in isolated environment without actual payment.
**Exit:** genuine launch checklist signed off; separate approval for Production content changes.

## Phase G — Security / Acceptance / Launch Gate
- Principal set: Super Admin, Platform Admin, Official Manager, Official Editor, Merchant Owner/Manager/Editor/Support, anonymous.
- Verify RLS, cross-tenant reads/writes, IDOR, role escalation, invitation replay, session revocation, protected platform accounts, products/posts, checkout price/stock races, orders/shipping, no secret exposure.
- Use two independent test tenants in non-production. Security Advisor review. Full browser desktop/mobile, TypeScript/lint/build/CI/Preview.
**Exit:** all P0/P1 defects resolved or explicitly deferred with risk approval; approved pre-merge and post-deploy verification.

## A1 validation record — 2026-10-09

- GitHub Draft PR: https://github.com/ramyelhawary73-coder/noormexa-platform-2026/pull/10
- GitHub Actions: https://github.com/ramyelhawary73-coder/noormexa-platform-2026/actions/runs/37985604510
- Preview reported Ready: https://noormexa-platform-202-git-bf3d8e-ramyelhawary73-coders-projects.vercel.app
- Repo `main` remained `ae968f093a9f3d8fc533de7edad02f7407107ff9` during A1. PR #9 remains separate and open.
- **Historical gate:** On 2026-10-09, Full ESLint failed on inherited baseline violations, and there was no browser E2E or Vercel inspection. See the updated 2026-10-10 validation below; do not interpret this historical record as the latest check.

## A1 revalidation after PR #11 merge — 2026-10-10

- Source `main`: `4540cc2a0b6d1aa33036fc72aac605c1b7788517` (PR #11, React Hooks baseline). Preserved all its changes through a two-parent merge into the PR #10 branch.
- A1 integration commit: `b3b24651f6d98413b76306ea3f75d0da2f64d231`, before this documentation-only follow-up. Compared against `main`, only seven A1-related files differ; no React Hooks regression was overwritten.
- **Commercial Authority Regression, TypeScript, Full ESLint, Next.js Build**: all passed for integration commit in both GitHub Actions runs:
  - https://github.com/ramyelhawary73-coder/noormexa-platform-2026/actions/runs/38024426868
  - https://github.com/ramyelhawary73-coder/noormexa-platform-2026/actions/runs/38024426814
- Vercel deployment for integration commit: **Success / Preview Ready** according to GitHub Vercel status. Preview: https://noormexa-platform-202-git-bf3d8e-ramyelhawary73-coders-projects.vercel.app ; not independently browsed.
- **Remaining approval gates:** user-led browser acceptance on desktop/mobile; sign-in, Platform Admin/Super Admin RLS views, seller store switch/roles, stale cart and checkout negative paths; final CI and Preview status at the exact approved PR head after any further commits; explicit merge authorization. No A1 Production deployment or Supabase change has occurred.

## Work-package and PR discipline

1. Each package starts by checking latest `main`, active PRs, connected Supabase/Vercel reality and known integration dependencies.
2. Each commits smallest correct change to independent branch; do not overwrite PR #9 or documentation history.
3. Each documents files changed, source of truth, tests actually run, exact HEAD, CI, Preview and remaining gaps.
4. Any Supabase DDL, data mutation, Auth/SMTP configuration, real send, merge, Production promotion or broad architecture expansion has an explicit independent approval gate.
5. Only claim a phase closed after verified acceptance. On conflict/errors, stop and report; do not force update or delete.
