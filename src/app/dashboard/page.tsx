"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Package, Plus, Store as StoreIcon, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNoormexaLanguage } from "@/lib/useLanguage";
import {
  createProduct,
  createStore,
  deleteProduct,
  getCategories,
  getMyProducts,
  getMyStore,
  updateProductStatus,
} from "@/lib/marketplace";
import type { Category, Product, Store } from "@/types/marketplace";

const copy = {
  ar: {
    loginPrompt: "لازم تسجل الدخول الأول عشان توصل للوحة التحكم.",
    loginCta: "تسجيل الدخول",
    createStoreTitle: "أنشئ متجرك",
    createStoreText: "خطوة واحدة وابدأ تعرض منتجاتك للعالم.",
    storeName: "اسم المتجر",
    storeDesc: "وصف قصير عن المتجر",
    createStoreBtn: "إنشاء المتجر",
    dashboardTitle: "لوحة تحكم المتجر",
    pendingNotice: "متجرك حاليًا قيد المراجعة من إدارة المنصة. هتقدر تعرض منتجاتك، لكن هتظهر للعملاء بعد الموافقة.",
    suspendedNotice: "متجرك موقوف مؤقتًا من إدارة المنصة. تواصل مع الدعم لمزيد من التفاصيل.",
    yourProducts: "منتجاتك",
    addProduct: "إضافة منتج",
    productName: "اسم المنتج",
    productDesc: "وصف المنتج",
    productPrice: "السعر (ج.م)",
    productStock: "الكمية المتاحة",
    productImage: "رابط صورة المنتج (اختياري)",
    productCategory: "التصنيف",
    saveProduct: "حفظ المنتج",
    noProducts: "لسه معملتش أي منتجات. ضيف أول منتج من الفورم فوق.",
    hide: "إخفاء",
    show: "إظهار",
    delete: "حذف",
    price: "ج.م",
    saving: "جارٍ الحفظ...",
  },
  en: {
    loginPrompt: "You need to sign in first to access the dashboard.",
    loginCta: "Sign in",
    createStoreTitle: "Create your store",
    createStoreText: "One step and you're ready to show your products to the world.",
    storeName: "Store name",
    storeDesc: "Short store description",
    createStoreBtn: "Create store",
    dashboardTitle: "Store dashboard",
    pendingNotice: "Your store is under review by the platform team. You can add products, but they'll be visible to customers after approval.",
    suspendedNotice: "Your store is temporarily suspended by the platform team. Contact support for details.",
    yourProducts: "Your products",
    addProduct: "Add product",
    productName: "Product name",
    productDesc: "Product description",
    productPrice: "Price (EGP)",
    productStock: "Stock",
    productImage: "Product image URL (optional)",
    productCategory: "Category",
    saveProduct: "Save product",
    noProducts: "No products yet. Add your first one from the form above.",
    hide: "Hide",
    show: "Show",
    delete: "Delete",
    price: "EGP",
    saving: "Saving...",
  },
} as const;

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const language = useNoormexaLanguage();
  const text = copy[language];

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [resolvedForId, setResolvedForId] = useState<string | null>(null);
  const checking = Boolean(user) && resolvedForId !== user?.id;
  const [saving, setSaving] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");

  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productCategory, setProductCategory] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([getMyStore(user.id), getCategories()]).then(async ([s, cats]) => {
      if (!active) return;
      setStore(s);
      setCategories(cats);
      if (s) {
        const prods = await getMyProducts(s.id);
        if (active) setProducts(prods);
      }
      setResolvedForId(user.id);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const handleCreateStore = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !storeName.trim()) return;
    setSaving(true);
    const { store: newStore } = await createStore(user.id, storeName.trim(), storeDesc.trim());
    setSaving(false);
    if (newStore) setStore(newStore);
  };

  const handleAddProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!store || !productName.trim() || !productPrice) return;
    setSaving(true);
    const { product } = await createProduct({
      store_id: store.id,
      category_id: productCategory || null,
      name: productName.trim(),
      description: productDesc.trim(),
      price: Number(productPrice),
      image_url: productImage.trim() || null,
      stock: Number(productStock) || 0,
    });
    setSaving(false);
    if (product) {
      setProducts((prev) => [product, ...prev]);
      setProductName("");
      setProductDesc("");
      setProductPrice("");
      setProductStock("");
      setProductImage("");
      setProductCategory("");
    }
  };

  const toggleProductVisibility = async (product: Product) => {
    const nextStatus = product.status === "active" ? "hidden" : "active";
    const ok = await updateProductStatus(product.id, nextStatus);
    if (ok) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p)));
    }
  };

  const removeProduct = async (product: Product) => {
    const ok = await deleteProduct(product.id);
    if (ok) setProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  if (authLoading || checking) {
    return (
      <main className="noormexa-main">
        <section className="noormexa-section" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="noormexa-main">
        <section className="noormexa-section">
          <div className="noormexa-container noormexa-empty-state">
            <p>{text.loginPrompt}</p>
            <Link href="/auth" className="noormexa-primary-button">
              {text.loginCta}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!store) {
    return (
      <main className="noormexa-main">
        <section className="noormexa-section">
          <div className="noormexa-container noormexa-dashboard-form-card">
            <div className="noormexa-section-heading">
              <h1>{text.createStoreTitle}</h1>
              <p>{text.createStoreText}</p>
            </div>
            <form onSubmit={handleCreateStore} className="noormexa-form">
              <label className="noormexa-field" htmlFor="storeName">
                <span>{text.storeName}</span>
                <input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
              </label>
              <label className="noormexa-field" htmlFor="storeDesc">
                <span>{text.storeDesc}</span>
                <textarea id="storeDesc" value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} rows={3} />
              </label>
              <button type="submit" className="noormexa-primary-button" disabled={saving}>
                {saving ? text.saving : text.createStoreBtn}
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="noormexa-main">
      <section className="noormexa-section">
        <div className="noormexa-container">
          <div className="noormexa-store-header">
            <span className="noormexa-card-icon">
              <StoreIcon size={26} />
            </span>
            <div>
              <h1>{store.name}</h1>
              <p>{text.dashboardTitle}</p>
            </div>
          </div>

          {store.status === "pending" && <div className="noormexa-status-banner noormexa-status-pending">{text.pendingNotice}</div>}
          {store.status === "suspended" && <div className="noormexa-status-banner noormexa-status-suspended">{text.suspendedNotice}</div>}

          <div className="noormexa-dashboard-form-card">
            <div className="noormexa-section-heading">
              <h2>{text.addProduct}</h2>
            </div>
            <form onSubmit={handleAddProduct} className="noormexa-form noormexa-form-grid">
              <label className="noormexa-field" htmlFor="productName">
                <span>{text.productName}</span>
                <input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} required />
              </label>
              <label className="noormexa-field" htmlFor="productCategory">
                <span>{text.productCategory}</span>
                <select id="productCategory" value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
                  <option value="">—</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {language === "ar" ? cat.name_ar : cat.name_en}
                    </option>
                  ))}
                </select>
              </label>
              <label className="noormexa-field" htmlFor="productPrice">
                <span>{text.productPrice}</span>
                <input
                  id="productPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  required
                />
              </label>
              <label className="noormexa-field" htmlFor="productStock">
                <span>{text.productStock}</span>
                <input
                  id="productStock"
                  type="number"
                  min="0"
                  value={productStock}
                  onChange={(e) => setProductStock(e.target.value)}
                />
              </label>
              <label className="noormexa-field noormexa-form-full" htmlFor="productImage">
                <span>{text.productImage}</span>
                <input id="productImage" value={productImage} onChange={(e) => setProductImage(e.target.value)} />
              </label>
              <label className="noormexa-field noormexa-form-full" htmlFor="productDesc">
                <span>{text.productDesc}</span>
                <textarea id="productDesc" value={productDesc} onChange={(e) => setProductDesc(e.target.value)} rows={3} />
              </label>
              <button type="submit" className="noormexa-primary-button noormexa-form-full" disabled={saving}>
                <Plus size={17} />
                {saving ? text.saving : text.saveProduct}
              </button>
            </form>
          </div>

          <div className="noormexa-section-heading">
            <h2>{text.yourProducts}</h2>
          </div>

          {products.length === 0 ? (
            <div className="noormexa-empty-state">
              <Package size={32} />
              <p>{text.noProducts}</p>
            </div>
          ) : (
            <div className="noormexa-product-grid">
              {products.map((product) => (
                <div key={product.id} className="noormexa-product-card noormexa-product-card-manage">
                  <div className="noormexa-product-image">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image_url} alt={product.name} />
                    ) : (
                      <Package size={28} />
                    )}
                  </div>
                  <div className="noormexa-product-info">
                    <span>{product.name}</span>
                    <strong>
                      {product.price} {text.price}
                    </strong>
                  </div>
                  <div className="noormexa-product-manage-actions">
                    <button type="button" onClick={() => toggleProductVisibility(product)}>
                      {product.status === "active" ? text.hide : text.show}
                    </button>
                    <button type="button" onClick={() => removeProduct(product)} className="noormexa-danger-button">
                      <Trash2 size={15} />
                      {text.delete}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
