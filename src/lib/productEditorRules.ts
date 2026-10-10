import type { Product } from "@/types/marketplace";

export const LEGACY_PREVIEW_DESCRIPTION_AR =
  "كتالوج تعريفي قيد المراجعة. الصورة توضيحية؛ السعر والمخزون والتوافر لم تُعتمد بعد.";
export const LEGACY_PREVIEW_DESCRIPTION_EN =
  "Catalog preview under review. Illustrative image; price, stock and availability are not yet confirmed.";

export type ProductEditorDraft = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  categoryId: string;
  imageUrl: string;
  price: string;
  originalPrice: string;
  stock: string;
  status: "active" | "hidden" | "out_of_stock";
  freeShipping: boolean;
};

export function initialProductDraft(
  product: Product | null,
  firstCategoryId: string
): ProductEditorDraft {
  return {
    name: product?.name ?? "",
    nameEn: product?.name_en ?? "",
    description: product?.description ?? "",
    descriptionEn: product?.description_en ?? "",
    categoryId: product?.category_id ?? firstCategoryId,
    imageUrl: product?.image_url ?? "",
    price: String(product?.price ?? 0),
    originalPrice: product?.original_price == null ? "" : String(product.original_price),
    stock: String(product?.stock ?? 0),
    status: product?.status ?? "active",
    freeShipping: product?.free_shipping ?? false,
  };
}

export function isLegacyPreviewDescription(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? "";
  return trimmed === LEGACY_PREVIEW_DESCRIPTION_AR || trimmed === LEGACY_PREVIEW_DESCRIPTION_EN;
}

export function isDraftSellable(draft: ProductEditorDraft): boolean {
  return draft.status === "active" &&
    Number.isFinite(Number(draft.price)) &&
    Number(draft.price) > 0 &&
    Number.isInteger(Number(draft.stock)) &&
    Number(draft.stock) > 0;
}

export function requiresSaleConfirmation(draft: ProductEditorDraft, original: Product | null): boolean {
  if (!isDraftSellable(draft)) return false;
  if (!original) return true;
  return original.status !== "active" || Number(original.price) !== Number(draft.price) ||
    Number(original.stock) !== Number(draft.stock);
}

export type ProductEditorIssue = { tab: "basic" | "media" | "pricing" | "publish"; ar: string; en: string };

export function validateProductDraft(
  draft: ProductEditorDraft,
  original: Product | null,
  allowedCategoryIds: ReadonlySet<string>
): ProductEditorIssue | null {
  if (!draft.name.trim()) return { tab: "basic", ar: "اسم المنتج بالعربية مطلوب.", en: "Arabic product name is required." };
  if (!allowedCategoryIds.has(draft.categoryId)) {
    return { tab: "basic", ar: "اختر تصنيفًا صالحًا تابعًا للمتجر.", en: "Choose a valid category." };
  }
  const price = Number(draft.price), stock = Number(draft.stock);
  if (!draft.price.trim() || !Number.isFinite(price) || price < 0 ||
      !draft.stock.trim() || !Number.isInteger(stock) || stock < 0) {
    return { tab: "pricing", ar: "السعر والمخزون لازم يكونوا أرقامًا صحيحة وغير سالبة.", en: "Enter a valid non-negative price and whole-number stock." };
  }
  if (draft.originalPrice.trim()) {
    const originalPrice = Number(draft.originalPrice);
    if (!Number.isFinite(originalPrice) || originalPrice <= price || price <= 0) {
      return { tab: "pricing", ar: "سعر المقارنة يجب أن يكون أعلى من سعر البيع الحقيقي، وإلا اتركه فارغًا.", en: "The compare-at price must exceed a real positive selling price, or be blank." };
    }
  }
  if (draft.imageUrl.trim() && !/^https:\/\//i.test(draft.imageUrl.trim()) && !/^data:image\/(png|jpe?g|webp);base64,/i.test(draft.imageUrl.trim())) {
    return { tab: "media", ar: "استخدم رابط صورة HTTPS أو ارفع صورة من الجهاز.", en: "Use a HTTPS image URL or upload an image." };
  }
  if (isDraftSellable(draft)) {
    if (!draft.description.trim() || isLegacyPreviewDescription(draft.description)) {
      return { tab: "basic", ar: "لازم تستبدل وصف المعاينة العربي بوصف حقيقي قبل تفعيل البيع.", en: "Replace the Arabic preview text with a genuine product description before selling." };
    }
    if (isLegacyPreviewDescription(draft.descriptionEn) ||
      (isLegacyPreviewDescription(original?.description_en) && !draft.descriptionEn.trim())) {
      return { tab: "basic", ar: "استبدل الوصف الإنجليزي التجريبي بوصف حقيقي قبل تفعيل البيع.", en: "Replace the original English preview description with genuine copy before selling." };
    }
    if (!draft.imageUrl.trim()) {
      return { tab: "media", ar: "أضف صورة المنتج قبل السماح بالشراء.", en: "Add a product image before selling." };
    }
  }
  return null;
}
