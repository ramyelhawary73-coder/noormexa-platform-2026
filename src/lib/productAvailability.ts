import type { Product } from "@/types/marketplace";

export const OFFICIAL_STORE_ID = "store-noormexa-official";
type Availability = Pick<Product, "store_id" | "status" | "price" | "stock">;
// A public official showcase listing is never purchasable while stock or price is unverified.
export function isOfficialShowcaseProduct(product: Availability): boolean {
  return product.store_id === OFFICIAL_STORE_ID &&
    product.status === "active" &&
    (!Number.isFinite(Number(product.price)) || Number(product.price) <= 0 ||
      !Number.isFinite(Number(product.stock)) || Number(product.stock) <= 0);
}
export function isProductPurchasable(product: Availability): boolean {
  return product.status === "active" &&
    Number.isFinite(Number(product.price)) && Number(product.price) > 0 &&
    Number.isInteger(Number(product.stock)) && Number(product.stock) > 0;
}
export function isPublicProduct(product: Availability): boolean {
  return isProductPurchasable(product) || isOfficialShowcaseProduct(product);
}
