import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Compile and exercise the actual TypeScript production helper without
// connecting to Supabase, a browser, or Production.
const source = readFileSync(new URL("../src/lib/productEditorRules.ts", import.meta.url), "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
runInNewContext(output, { exports });
const {
  LEGACY_PREVIEW_DESCRIPTION_AR: legacyAr, LEGACY_PREVIEW_DESCRIPTION_EN: legacyEn,
  initialProductDraft, isLegacyPreviewDescription, isDraftSellable,
  requiresSaleConfirmation, validateProductDraft,
} = exports;
const categories = new Set(["electronics"]);
const original = {
  id: "brand-example", store_id: "store-noormexa-official",
  category_id: "electronics", name: "اسم منتج", name_en: "Product",
  description: legacyAr, description_en: legacyEn,
  price: 0, stock: 0, image_url: "https://example.com/image.jpg",
  status: "active", created_at: "2026-10-10",
};
const draft = initialProductDraft(original, "electronics");
assert.equal(draft.description, legacyAr);
assert.equal(draft.descriptionEn, legacyEn);
assert.equal(draft.price, "0");
assert.equal(draft.stock, "0");
assert.equal(isLegacyPreviewDescription(legacyAr), true);
assert.equal(isLegacyPreviewDescription("وصف مفصل كتبه المستخدم."), false);
assert.equal(isDraftSellable(draft), false);
assert.equal(requiresSaleConfirmation(draft, original), false);
assert.equal(validateProductDraft(draft, original, categories), null);
const soldOut = { ...original, status: "out_of_stock", stock: 0 };
const soldOutDraft = initialProductDraft(soldOut, "electronics");
assert.equal(soldOutDraft.status, "out_of_stock", "sold-out status must not turn into hidden when editing");
assert.equal(isDraftSellable(soldOutDraft), false);
assert.equal(validateProductDraft(soldOutDraft, soldOut, categories), null);
assert.equal(requiresSaleConfirmation(soldOutDraft, soldOut), false);
const soldOutReactivate = { ...soldOutDraft, status: "active", price: "1200", stock: "7" };
assert.equal(requiresSaleConfirmation(soldOutReactivate, soldOut), true, "reactivated sale must be confirmed");
const candidate = { ...draft, price: "1250", stock: "3" };
assert.equal(isDraftSellable(candidate), true);
assert.equal(requiresSaleConfirmation(candidate, original), true);
assert.equal(validateProductDraft(candidate, original, categories).tab, "basic", "placeholder Arabic blocks sale");
const arabicFixed = { ...candidate, description: "سماعات لاسلكية مع مواصفات حقيقية من المنتج." };
assert.equal(validateProductDraft(arabicFixed, original, categories).tab, "basic", "placeholder English blocks sale");
const fixed = { ...arabicFixed, descriptionEn: "Genuine product details and specifications." };
assert.equal(validateProductDraft(fixed, original, categories), null);
assert.equal(requiresSaleConfirmation(fixed, { ...original, price: 1250, stock: 3 }), false);
assert.equal(requiresSaleConfirmation(fixed, { ...original, price: 1100, stock: 3 }), true);
assert.equal(validateProductDraft({ ...fixed, originalPrice: "900" }, original, categories).tab, "pricing");
assert.equal(validateProductDraft({ ...fixed, categoryId: "foreign-store-category" }, original, categories).tab, "basic");
assert.equal(validateProductDraft({ ...fixed, price: "NaN" }, original, categories).tab, "pricing");
assert.equal(validateProductDraft({ ...fixed, stock: "1.5" }, original, categories).tab, "pricing");
assert.equal(validateProductDraft({ ...fixed, imageUrl: "javascript:alert(1)" }, original, categories).tab, "media");
assert.equal(validateProductDraft({ ...fixed, imageUrl: "" }, original, categories).tab, "media");
assert.equal(validateProductDraft({ ...fixed, price: "0", stock: "9" }, original, categories), null, "preview stays editable");
assert.equal(validateProductDraft({ ...fixed, status: "hidden" }, original, categories), null, "hidden never triggers public sale validation");
assert.equal(isDraftSellable({ ...fixed, status: "hidden" }), false);
const custom = { ...original, description: "وصف مخصص لا يجوز تغييره", description_en: "Custom English description" };
const customDraft = initialProductDraft(custom, "electronics");
assert.equal(customDraft.description, custom.description);
assert.equal(customDraft.descriptionEn, custom.description_en);
assert.equal(validateProductDraft({ ...customDraft, price: "1299", stock: "6" }, custom, categories), null);
const blankEn = { ...original, description_en: null };
assert.equal(validateProductDraft({ ...initialProductDraft(blankEn, "electronics"), description: "تفاصيل حقيقية", price: "850", stock: "4" }, blankEn, categories), null);

const ui = readFileSync(new URL("../src/components/seller/ProductEditorModal.tsx", import.meta.url), "utf8");
const dashboard = readFileSync(new URL("../src/app/seller/dashboard/page.tsx", import.meta.url), "utf8");
const db = readFileSync(new URL("../src/lib/marketplace.ts", import.meta.url), "utf8");
assert(ui.includes("savingGuard.current"), "guards repeated saves");
assert(ui.includes('["active", "hidden", "out_of_stock"]'), "editor preserves all existing status options");
assert(ui.includes('if (product && !dirty) { onClose(); return; }'), "editor does not send an unchanged product to Supabase");
assert(ui.includes("beforeunload"), "protect unsaved browser navigation");
assert(ui.includes("Discard them") && ui.includes("Unsaved changes"), "warn on close");
assert(ui.includes("verifiedSale") && ui.includes("window.confirm"), "explicit sale approval");
assert(ui.includes("collapsibleUrl"), "supports compact image URLs");
assert(ui.includes("overflow-y-auto") && ui.includes("h-[100dvh]"), "mobile viewport and scrollable content");
assert(dashboard.includes("editingProduct.store_id !== currentStore.id"), "tenant precheck");
assert(dashboard.includes("persistUpdateProduct(editingProduct.id, { ...payload }, currentStore.id)"), "store-scoped DB update");
assert(db.includes("description_en?: string | null"), "preserves bilingual description");
console.log("PASS: premium editor preview, sale validation, real copy, dirty state and RLS-scoped wiring");
