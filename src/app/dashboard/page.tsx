"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { Package, Plus, Store as StoreIcon, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNoormexaLanguage } from "@/lib/useLanguage";
import {
  getStoreOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
  createProduct,
  createStore,
  deleteProduct,
  getAnnouncements,
  getCategories,
  getMyProducts,
  getMyStore,
  updateProductStatus,
  uploadProductImage,
  type Announcement,
} from "@/lib/marketplace";
import type { Category, Product, Store } from "@/types/marketplace";

const copy = {
  ar: {
    loginPrompt: "لازم تسجل الدخول الأول عشان توصل للوحة التحكم.",
    loginCta: "تسجيل الدخول",
    createStoreTitle: "أنشئ متجرك",
    createStoreText: "خطوة واحدة وابدأ تعرض منتجاتك للعالم.",
    customerBlockedTitle: "الصفحة دي مخصصة للبائعين والمتاجر",
    customerBlockedText: "حسابك مسجّل كمتسوق. لو عايز تبيع منتجاتك، تقدر تغيّر نوع حسابك.",
    switchToSeller: "أنا عايز أبيع كمان",
    browseInstead: "تصفح السوق",
    storeName: "اسم المتجر",
    storeDesc: "وصف قصير عن المتجر",
    createStoreBtn: "إنشاء المتجر",
    genericError: "حصل خطأ غير متوقع، جرّب تاني بعد شوية.",
    dashboardTitle: "لوحة تحكم المتجر",
    pendingNotice: "متجرك حاليًا قيد المراجعة من إدارة المنصة. هتقدر تعرض منتجاتك، لكن هتظهر للعملاء بعد الموافقة.",
    suspendedNotice: "متجرك موقوف مؤقتًا من إدارة المنصة. تواصل مع الدعم لمزيد من التفاصيل.",
    yourProducts: "منتجاتك",
    addProduct: "إضافة منتج",
    productName: "اسم المنتج",
    productDesc: "وصف المنتج",
    productPrice: "السعر (ج.م)",
    productStock: "الكمية المتاحة",
    productImage: "صورة المنتج",
    uploading: "جاري رفع الصورة...",
    uploadHint: "JPG أو PNG، حتى 5 ميجا",
    changeImage: "تغيير الصورة",
    productCategory: "التصنيف",
    saveProduct: "حفظ المنتج",
    noProducts: "لسه معملتش أي منتجات. ضيف أول منتج من الفورم فوق.",
    ordersTitle: "طلبات متجري",
    noOrders: "لسه معملتش أي طلب.",
    orderNumber: "طلب رقم",
    total: "الإجمالي",
    currency: "ج.م",
    orderStatus: {
      pending: "قيد المراجعة",
      paid: "مدفوع",
      shipped: "تم الشحن",
      completed: "تم التسليم",
      cancelled: "ملغي",
    } as Record<string, string>,
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
    customerBlockedTitle: "This page is for sellers and stores",
    customerBlockedText: "Your account is registered as a shopper. If you want to sell, you can switch your account type.",
    switchToSeller: "I want to sell too",
    browseInstead: "Browse the market",
    storeName: "Store name",
    storeDesc: "Short store description",
    createStoreBtn: "Create store",
    genericError: "Something went wrong, please try again shortly.",
    dashboardTitle: "Store dashboard",
    pendingNotice: "Your store is under review by the platform team. You can add products, but they'll be visible to customers after approval.",
    suspendedNotice: "Your store is temporarily suspended by the platform team. Contact support for details.",
    yourProducts: "Your products",
    addProduct: "Add product",
    productName: "Product name",
    productDesc: "Product description",
    productPrice: "Price (EGP)",
    productStock: "Stock",
    productImage: "Product image",
    uploading: "Uploading image...",
    uploadHint: "JPG or PNG, up to 5MB",
    changeImage: "Change image",
    productCategory: "Category",
    saveProduct: "Save product",
    noProducts: "No products yet. Add your first one from the form above.",
    ordersTitle: "Store orders",
    noOrders: "No orders yet.",
    orderNumber: "Order",
    total: "Total",
    currency: "EGP",
    orderStatus: {
      pending: "Pending review",
      paid: "Paid",
      shipped: "Shipped",
      completed: "Delivered",
      cancelled: "Cancelled",
    } as Record<string, string>,
    hide: "Hide",
    show: "Show",
    delete: "Delete",
    price: "EGP",
    saving: "Saving...",
  },
} as const;

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const language = useNoormexaLanguage();
  const text = copy[language];

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [resolvedForId, setResolvedForId] = useState<string | null>(null);
  const checking = Boolean(user) && resolvedForId !== user?.id;
  const [saving, setSaving] = useState(false);
  const [storeError, setStoreError] = useState("");

  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");

  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productImage, setProductImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [productCategory, setProductCategory] = useState("");

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([getMyStore(user.id), getCategories(), getAnnouncements()]).then(
      async ([s, cats, ann]) => {
        if (!active) return;
        setStore(s);
        setCategories(cats);
        setAnnouncements(ann);
        if (s) {
          const [prods, storeOrders] = await Promise.all([getMyProducts(s.id), getStoreOrders(s.id)]);
          if (active) {
            setProducts(prods);
            setOrders(storeOrders);
          }
        }
        setResolvedForId(user.id);
      }
    );
    return () => {
      active = false;
    };
  }, [user]);

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    const ok = await updateOrderStatus(orderId, status);
    if (ok) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    }
  };

  const handleCreateStore = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !storeName.trim() || saving) return;
    setSaving(true);
    setStoreError("");
    const { store: newStore, error } = await createStore(user.id, storeName.trim(), storeDesc.trim());
    if (newStore) {
      setStore(newStore);
      setSaving(false);
      return;
    }

    // لو فشل الإنشاء (مثلاً لأن متجر اتعمل بالفعل لنفس الحساب من محاولة
    // سابقة)، نجيب المتجر الموجود فعليًا بدل ما نسيب المستخدم عالق.
    const existing = await getMyStore(user.id);
    setSaving(false);
    if (existing) {
      setStore(existing);
    } else {
      setStoreError(error || text.genericError);
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploadError("");
    setUploadingImage(true);
    const { url, error } = await uploadProductImage(file, user.id);
    setUploadingImage(false);
    if (url) {
      setProductImage(url);
    } else {
      setUploadError(error || "");
    }
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
      setUploadError("");
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
    const accountType = (profile?.account_type as string | undefined) ?? "customer";

    if (accountType === "customer") {
      return (
        <main className="noormexa-main">
          <section className="noormexa-section">
            <div className="noormexa-container noormexa-empty-state">
              <StoreIcon size={32} />
              <h1>{text.customerBlockedTitle}</h1>
              <p>{text.customerBlockedText}</p>
              <div className="noormexa-empty-state-actions">
                <Link href="/auth/choose-role" className="noormexa-primary-button">
                  {text.switchToSeller}
                </Link>
                <Link href="/" className="noormexa-pill-button">
                  {text.browseInstead}
                </Link>
              </div>
            </div>
          </section>
        </main>
      );
    }

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
              {storeError && <p className="noormexa-form-error">{storeError}</p>}
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

          {announcements
            .filter((a) => {
              const accountType = (profile?.account_type as string | undefined) ?? "";
              if (a.audience === "all") return true;
              if (a.audience === "sellers") return accountType === "seller";
              if (a.audience === "stores") return accountType === "store";
              if (a.audience === "advertisers") return accountType === "advertiser";
              return false;
            })
            .map((a) => (
              <div key={a.id} className="noormexa-status-banner noormexa-status-announcement">
                <strong>{a.title}</strong>
                <p>{a.body}</p>
              </div>
            ))}

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
                <input
                  id="productImage"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                />
                <small className="noormexa-muted-text">{text.uploadHint}</small>
                {uploadingImage && <small className="noormexa-muted-text">{text.uploading}</small>}
                {uploadError && <small className="noormexa-danger-text">{uploadError}</small>}
                {productImage && !uploadingImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={productImage} alt="" className="noormexa-image-preview" />
                )}
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

      <section className="noormexa-section noormexa-section-soft">
        <div className="noormexa-container">
          <div className="noormexa-section-heading">
            <h2>{text.ordersTitle}</h2>
          </div>

          {orders.length === 0 ? (
            <p className="noormexa-empty-state">{text.noOrders}</p>
          ) : (
            <div className="noormexa-orders-list">
              {orders.map((order) => (
                <div key={order.id} className="noormexa-order-card">
                  <div className="noormexa-order-card-header">
                    <span>
                      {text.orderNumber} #{order.id.slice(0, 8)}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                    >
                      {Object.entries(text.orderStatus).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ul className="noormexa-order-items-list">
                    {order.items?.map((item) => (
                      <li key={item.id}>
                        {item.product_name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                  {order.shipping_name && (
                    <div className="noormexa-shipping-info">
                      <strong>{order.shipping_name}</strong>
                      <span>{order.shipping_phone}</span>
                      <span>
                        {order.shipping_address}
                        {order.shipping_city ? `، ${order.shipping_city}` : ""}
                      </span>
                      {order.shipping_notes && <span className="noormexa-muted-text">{order.shipping_notes}</span>}
                    </div>
                  )}
                  <strong>
                    {text.total}: {order.total_amount} {text.currency}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
