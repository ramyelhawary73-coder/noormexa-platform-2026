// Regression checks for production commercial authority. No external services required.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const homepage = read("src/app/page.tsx");
const admin = read("src/app/admin/page.tsx");
const context = read("src/context/MarketplaceContext.tsx");
const publicCatalog = read("src/lib/publicCatalog.ts");
const checkout = read("src/app/api/checkout/create/route.ts");
const checks = [
  ["fictional testimonials are not rendered", !homepage.includes("text.testimonials.reviews.map")],
  ["no fictional numerical marketplace proof", !homepage.includes('value: "+500"') && !homepage.includes('value: "+120k"') && !homepage.includes('value: "500+"')],
  ["no static partner brand showcase", !homepage.includes("<GlobalBrandsShowcase")],
  ["realistic marketplace principles", homepage.includes("A Marketplace Built on Real Data")],
  ["admin orders read from Supabase", admin.includes('supabase.from("orders").select("*")')],
  ["admin never uses context demo order data", !/const\s*\{[^}]*\borders\b[^}]*\}\s*=\s*useMarketplace\(/s.test(admin)],
  ["no fake analytics insights", !admin.includes("42.6%") && !admin.includes("1,482") && !admin.includes("NOORMEXA2026")],
  ["admin disables local-only order edits", admin.includes("allowStatusChanges={false}")],
  ["admin has no fake payout actions", !admin.includes("updatePayoutStatus(")],
  ["context does not seed sample orders", !context.includes("generateInitialDemoOrders")],
  ["context ignores legacy payout and shipment cache", !context.includes("setPayoutsState(parsed)") && !context.includes("setShipmentsState(parsed)")],
  ["public catalog approved and stocked only", publicCatalog.includes('supabase.rpc("list_public_stores")') && publicCatalog.includes('.gt("stock", 0)')],
  ["checkout uses authoritative secure RPC", checkout.includes("create_checkout_orders_secure")],
];
let failed = 0;
for (const [name, pass] of checks) {
  console.log(`${pass ? "PASS" : "FAIL"}: ${name}`);
  if (!pass) failed++;
}
assert.equal(failed, 0, `${failed} commercial truth assertions failed`);
console.log(`PASS: all ${checks.length} commercial authority regression assertions`);
