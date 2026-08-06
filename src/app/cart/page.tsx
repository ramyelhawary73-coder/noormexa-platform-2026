"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Package, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNoormexaLanguage } from "@/lib/useLanguage";
import { checkoutCart } from "@/lib/marketplace";

const copy = {
  ar: {
    title: "سلة الشراء",
    empty: "السلة فاضية دلوقتي.",
    browse: "تصفح السوق",
    remove: "حذف",
    total: "الإجمالي",
    checkout: "إتمام الطلب (الدفع عند الاستلام)",
    checkingOut: "جاري تنفيذ الطلب...",
    needLogin: "لازم تسجّل دخول الأول عشان تكمل الطلب.",
    goLogin: "تسجيل الدخول",
    success: "تم تسجيل طلبك بنجاح! هيتواصل معاك المتجر لتأكيد التوصيل.",
    viewOrders: "عرض طلباتي",
    error: "حصل خطأ أثناء تنفيذ الطلب، حاول تاني.",
    currency: "ج.م",
    from: "من متجر",
  },
  en: {
    title: "Shopping cart",
    empty: "Your cart is empty.",
    browse: "Browse the market",
    remove: "Remove",
    total: "Total",
    checkout: "Place order (Cash on delivery)",
    checkingOut: "Placing your order...",
    needLogin: "You need to sign in first to check out.",
    goLogin: "Sign in",
    success: "Your order was placed! The store will contact you to confirm delivery.",
    viewOrders: "View my orders",
    error: "Something went wrong placing the order, try again.",
    currency: "EGP",
    from: "from store",
  },
} as const;

export default function CartPage() {
  const language = useNoormexaLanguage();
  const text = copy[language];
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    acc[item.storeId] = acc[item.storeId] ? [...acc[item.storeId], item] : [item];
    return acc;
  }, {});

  const handleCheckout = async () => {
    if (!user) return;
    setPlacing(true);
    setError("");
    const { error: checkoutError } = await checkoutCart(
      user.id,
      items.map((i) => ({ productId: i.productId, storeId: i.storeId, price: i.price, quantity: i.quantity }))
    );
    setPlacing(false);
    if (checkoutError) {
      setError(text.error);
      return;
    }
    clearCart();
    setDone(true);
  };

  if (done) {
    return (
      <main className="noormexa-main">
        <section className="noormexa-section">
          <div className="noormexa-container noormexa-empty-state">
            <ShoppingBag size={32} />
            <p>{text.success}</p>
            <Link href="/orders" className="noormexa-primary-button">
              {text.viewOrders}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="noormexa-main">
      <section className="noormexa-section">
        <div className="noormexa-container">
          <div className="noormexa-section-heading">
            <h1>{text.title}</h1>
          </div>

          {items.length === 0 ? (
            <div className="noormexa-empty-state">
              <Package size={32} />
              <p>{text.empty}</p>
              <Link href="/" className="noormexa-primary-button">
                {text.browse}
              </Link>
            </div>
          ) : (
            <div className="noormexa-cart-layout">
              <div className="noormexa-cart-items">
                {Object.entries(grouped).map(([storeId, storeItems]) => (
                  <div key={storeId} className="noormexa-cart-store-group">
                    <span className="noormexa-cart-store-name">
                      {text.from} {storeItems[0].storeName}
                    </span>
                    {storeItems.map((item) => (
                      <div key={item.productId} className="noormexa-cart-row">
                        <div className="noormexa-cart-row-image">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt={item.name} />
                          ) : (
                            <Package size={22} />
                          )}
                        </div>
                        <div className="noormexa-cart-row-info">
                          <strong>{item.name}</strong>
                          <span>
                            {item.price} {text.currency}
                          </span>
                        </div>
                        <div className="noormexa-cart-qty">
                          <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="noormexa-icon-button"
                          onClick={() => removeItem(item.productId)}
                          aria-label={text.remove}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="noormexa-cart-summary">
                <div className="noormexa-cart-total-row">
                  <span>{text.total}</span>
                  <strong>
                    {totalAmount.toFixed(2)} {text.currency}
                  </strong>
                </div>

                {error && <p className="noormexa-form-message error">{error}</p>}

                {user ? (
                  <button
                    type="button"
                    className="noormexa-primary-button noormexa-form-full"
                    disabled={placing}
                    onClick={handleCheckout}
                  >
                    {placing ? text.checkingOut : text.checkout}
                  </button>
                ) : (
                  <>
                    <p className="noormexa-form-message error">{text.needLogin}</p>
                    <button
                      type="button"
                      className="noormexa-primary-button noormexa-form-full"
                      onClick={() => router.push("/auth")}
                    >
                      {text.goLogin}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
