import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const catalog=JSON.parse(read("data/official-preview-catalog.json"));
assert.equal(catalog.products.length,36,"must stage all 36 official products");
assert.equal(new Set(catalog.products.map(x=>x.id)).size,36,"duplicate product ID");
for(const item of catalog.products){
 assert.equal(item.store_id,"store-noormexa-official");
 assert.equal(item.price,0,"no invented price");
 assert.equal(item.stock,0,"no invented inventory");
 assert.equal(item.status,"active","official showcase visible");
 assert.equal(item.free_shipping,false,"no invented shipping guarantee");
 assert(item.name.length>3);
}
const files={
  availability:read("src/lib/productAvailability.ts"),
  catalog:read("src/lib/publicCatalog.ts"),
  storefront:read("src/lib/publicStorefront.ts"),
  storePage:read("src/app/store/[slug]/page.tsx"),
  marketplace:read("src/app/marketplace/page.tsx"),
  product:read("src/app/marketplace/[id]/page.tsx"),
  home:read("src/app/page.tsx"),
  dashboard:read("src/app/seller/dashboard/page.tsx"),
  marketplaceLib:read("src/lib/marketplace.ts"),
  workspace:read("src/lib/sellerWorkspace.ts"),
  checkout:read("src/app/api/checkout/create/route.ts"),
  importer:read("scripts/prepare-official-preview-import.mjs")
};
const conditions=[
 ["availability excludes zero price/stock checkout", files.availability.includes("Number(product.price) > 0") && files.availability.includes("Number(product.stock) > 0")],
 ["only official preview is allowed", files.availability.includes('product.store_id === OFFICIAL_STORE_ID')],
 ["public catalog allowlists approved stores", files.catalog.includes("approvedIds.has(p.store_id)")],
 ["public catalog applies safe availability", files.catalog.includes("isPublicProduct(p)")],
 ["storefront previews and real products only", files.storefront.includes("filter(isPublicProduct)")],
 ["storefront disables preview cart", files.storePage.includes("disabled={!isProductPurchasable(prod)}")],
 ["marketplace disables preview cart", files.marketplace.includes("disabled={!isProductPurchasable(product)}")],
 ["home disables preview cart", files.home.includes("disabled={!isProductPurchasable(prod)}")],
 ["detail rejects unpublished/non-approved stores", files.product.includes("publicStore && data && isPublicProduct(data as Product)")],
 ["detail has no cart checkout for preview", files.product.includes("if (!product || !isProductPurchasable(product)) return;")],
 ["seller product editor updates exact store", files.dashboard.includes("persistUpdateProduct(editingProduct.id, { ...payload }, currentStore.id)")],
 ["seller post editor updates exact store", files.dashboard.includes("updateSellerMarketingPost(editingPost.id, { ...edits }, currentStore.id)")],
 ["seller can hide/show products", files.dashboard.includes("<ProductEditorModal") && read("src/components/seller/ProductEditorModal.tsx").includes('update("status", status)')],
 ["seller can publish/draft posts", files.dashboard.includes('setPostStatus(e.target.value as "published" | "draft")')],
 ["server checkout uses DB RPC", files.checkout.includes('create_checkout_orders_secure')],
 ["SQL importer is review-only", !files.importer.includes("@supabase/supabase-js") && files.importer.includes("ON CONFLICT (id) DO NOTHING")],
 ["client directives remain first",["home","storePage","marketplace","product"].every(k=>files[k].startsWith('"use client";'))],
];
for (const [name,ok] of conditions) {console.log(`${ok?"PASS":"FAIL"}: ${name}`);}
assert(conditions.every(x=>x[1]),"official catalog regression gate failed");
console.log(`PASS: ${conditions.length} safe catalog/CRUD assertions`);
