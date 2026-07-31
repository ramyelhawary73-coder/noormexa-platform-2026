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
  commission_rate: number;
  plan: string;
  status: "pending" | "approved" | "suspended";
  created_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  status: "active" | "hidden" | "out_of_stock";
  created_at: string;
};
