export type CurrencyCode = "USD" | "SAR" | "AED" | "EGP" | "EUR" | "KWD" | "QAR";

export type CurrencyInfo = {
  code: CurrencyCode;
  nameAr: string;
  nameEn: string;
  symbolAr: string;
  symbolEn: string;
  rateAgainstEGP: number; // 1 EGP = X in this currency (or exchange rate relative to EGP)
};

export type Category = {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  icon: string;
  sort_order: number;
};

export type Store = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  commission_rate: number;
  plan: string;
  status: "pending" | "approved" | "suspended";
  is_verified?: boolean;
  is_official?: boolean; // Official flagship store owned by platform
  rating?: number;
  total_sales?: number;
  country?: string;
  contact_email?: string;
  contact_phone?: string;
  cr_number?: string; // Commercial Registration
  tax_number?: string;
  bank_name?: string;
  iban?: string;
  return_policy?: string;
  created_at: string;
};

export type MarketingPost = {
  id: string;
  store_id: string;
  store_name: string;
  store_logo?: string;
  title: string;
  content: string;
  image_url?: string;
  promo_code?: string;
  discount_percent?: number;
  featured_product_id?: string;
  likes_count: number;
  views_count: number;
  is_pinned?: boolean;
  status: "published" | "draft" | "archived";
  created_at: string;
};

export type StorePayout = {
  id: string;
  store_id: string;
  store_name: string;
  amount: number; // in base EGP
  status: "pending" | "approved" | "transferred" | "rejected";
  requested_at: string;
  processed_at?: string;
  bank_name: string;
  iban: string;
  transaction_ref?: string;
  notes?: string;
};

export type ProductVariant = {
  id: string;
  nameAr: string;
  nameEn: string;
  options: {
    id: string;
    labelAr: string;
    labelEn: string;
    priceDelta?: number;
    colorCode?: string;
  }[];
};

export type ProductSpec = {
  labelAr: string;
  labelEn: string;
  valueAr: string;
  valueEn: string;
};

export type Product = {
  id: string;
  store_id: string;
  store_name?: string;
  brand_id?: string;
  brand_name?: string;
  category_id: string | null;
  category_slug?: string;
  name: string;
  name_en?: string;
  description: string | null;
  description_en?: string;
  price: number; // in base EGP
  original_price?: number;
  image_url: string | null;
  gallery_images?: string[];
  stock: number;
  status: "active" | "hidden" | "out_of_stock";
  rating?: number;
  reviews_count?: number;
  is_featured?: boolean;
  is_preorder?: boolean;
  preorder_label?: string;
  free_shipping?: boolean;
  variants?: ProductVariant[];
  specs?: ProductSpec[];
  created_at: string;
};

export type PaymentGatewayKey = "applePayMada" | "stripe" | "tabbyTamara" | "paypal" | "cod";

export type PaymentGatewayConfig = {
  key: PaymentGatewayKey;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  enabled: boolean;
  icon: string;
  badge?: string;
};

export type PlatformSettings = {
  defaultCommissionRate: number; // e.g. 8%
  vatEnabled: boolean;
  vatRate: number; // e.g. 14%
  freeShippingThreshold: number; // in base EGP (e.g. 1500)
  standardShippingCost: number; // in base EGP (e.g. 50)
  priorityShippingCost: number; // in base EGP (e.g. 120)
  autoApproveProducts: boolean;
  autoApproveStores: boolean;
  gateways: Record<PaymentGatewayKey, PaymentGatewayConfig>;
};

export type PromoCode = {
  code: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number; // percentage or fixed in EGP
  minOrderValue?: number;
  descriptionAr: string;
  descriptionEn: string;
};

export type OrderTrackingStep = {
  status: "placed" | "confirmed" | "packed" | "in_transit" | "out_for_delivery" | "delivered";
  titleAr: string;
  titleEn: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
};

export type SelectedVariant = Record<string, string>; // variantId -> optionId

export type CartItem = {
  productId: string;
  name: string;
  nameEn?: string;
  price: number; // base EGP
  imageUrl: string | null;
  storeId: string;
  storeName: string;
  quantity: number;
  maxStock: number;
  selectedVariants?: SelectedVariant;
  selectedVariantsLabel?: string;
};

export type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode?: string;
  notes?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  buyer_id: string;
  store_id: string;
  store_name?: string;
  total_amount: number; // base EGP
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  vat_amount: number;
  commission_amount: number;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_method: PaymentGatewayKey;
  payment_status: "paid" | "pending" | "failed";
  shipping_speed: "standard" | "priority";
  shipping_info: ShippingAddress;
  items: {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    selected_variants_label?: string;
    image_url?: string | null;
  }[];
  tracking_steps: OrderTrackingStep[];
  created_at: string;
  carrier?: string;
};
