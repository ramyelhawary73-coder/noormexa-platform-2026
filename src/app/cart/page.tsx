"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Minus, Package, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
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
    shippingTitle: "بيانات الشحن",
    fullName: "الاسم بالكامل",
    phone: "رقم الهاتف",
    address: "العنوان بالتفصيل",
    city: "المدينة",
    notes: "ملاحظات للتوصيل (اختياري)",
    shippingRequired: "من فضلك املأ كل بيانات الشحن قبل إتمام الطلب.",
    paymentMethod: "طريقة الدفع",
    cod: "الدفع عند الاستلام",
    paymobLabel: "بطاقة / محفظة إلكترونية (Paymob)",
    stripeLabel: "بطاقة دولية (Stripe)",
    checkout: "إتمام الطلب",
    checkingOut: "جاري تنفيذ الطلب...",
    redirecting: "جاري تحويلك لصفحة الدفع...",
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
    shippingTitle: "Shipping details",
    fullName: "Full name",
    phone: "Phone number",
    address: "Detailed address",
    city: "City",
    notes: "Delivery notes (optional)",
    shippingRequired: "Please fill in all shipping details before checking out.",
    paymentMethod: "Payment method",
    cod: "Cash on delivery",
    paymobLabel: "Card / e-wallet (Paymob)",
    stripeLabel: "International card (Stripe)",
    checkout: "Place order",
    checkingOut: "Placing your order...",
    redirecting: "Redirecting to payment...",
    needLogin: "You need to sign in first to check out.",
    goLogin: "Sign in",
    success: "Your order was placed! The store will contact you to confirm delivery.",
    viewOrders: "View my orders",
    error: "Something went wrong placing the order, try again.",
    currency: "EGP",
    from: "from store",
  },
} as const;

type PaymentMethod = "cod" | "paymob" | "stripe";

export default function CartPage() {
  const language = useNoormexaLanguage();
  const text = copy[language];
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState({ paymob: false, stripe: false });
  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/payment/create")
      .then((res) => res.json())
      .then((data) => {
        if (active) setProviders({ paymob: Boolean(data.paymob), stripe: Boolean(data.stripe) });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // نعبّي بيانات الشحن أول مرة بس من بيانات البروفايل (لو موجودة)،
  // ونسيب المستخدم يعدّلها براحته من غير ما نمسحها كل ما البروفايل يتحدّث.
  useEffect(() => {
    if (!user || prefilledFor === user.id) return;
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setFullName((profile?.full_name as string | undefined) ?? "");
      setPhone((profile?.phone as string | undefined) ?? "");
      setPrefilledFor(user.id);
    });
    return () => {
      active = false;
    };
  }, [user, profile, prefilledFor]);

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    acc[item.storeId] = acc[item.storeId] ? [...acc[item.storeId], item] : [item];
    return acc;
  }, {});

  const shippingValid = fullName.trim() && phone.trim() && address.trim() && city.trim();

  const handleCheckout = async () => {
    if (!user) return;
    if (!shippingValid) {
      setError(text.shippingRequired);
      return;
    }
    setPlacing(true);
    setError("");
    const { orderIds, error: checkoutError } = await checkoutCart(
      user.id,
      items.map((i) => ({ productId: i.productId, storeId: i.storeId, price: i.price, quantity: i.quantity })),
      { fullName: fullName.trim(), phone: phone.trim(), address: address.trim(), city: city.trim(), notes: notes.trim() }
    );

    if (checkoutError || orderIds.length === 0) {
      setPlacing(false);
      setError(text.error);
      return;
    }

    if (method === "cod") {
      setPlacing(false);
      clearCart();
      setDone(true);
      return;
    }

    // دفع إلكتروني: نبدأ جلسة الدفع ونحوّل المستخدم لصفحة الدفع الآمنة
    setRedirecting(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderIds, provider: method }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "payment failed");
      clearCart();
      window.location.href = data.url;
    } catch {
      setPlacing(false);
      setRedirecting(false);
      setError(text.error);
    }
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

                {user && (
                  <div className="noormexa-shipping-form">
                    <span className="noormexa-field-label">{text.shippingTitle}</span>
                    <label className="noormexa-field">
                      <span>{text.fullName}</span>
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </label>
                    <label className="noormexa-field">
                      <span>{text.phone}</span>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </label>
                    <label className="noormexa-field">
                      <span>{text.address}</span>
                      <input value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </label>
                    <label className="noormexa-field">
                      <span>{text.city}</span>
                      <input value={city} onChange={(e) => setCity(e.target.value)} required />
                    </label>
                    <label className="noormexa-field">
                      <span>{text.notes}</span>
                      <input value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </label>
                  </div>
                )}

                {user && (
                  <div className="noormexa-payment-methods">
                    <span className="noormexa-field-label">{text.paymentMethod}</span>
                    <label className="noormexa-payment-option">
                      <input
                        type="radio"
                        name="payment-method"
                        checked={method === "cod"}
                        onChange={() => setMethod("cod")}
                      />
                      <Truck size={16} />
                      {text.cod}
                    </label>
                    {providers.paymob && (
                      <label className="noormexa-payment-option">
                        <input
                          type="radio"
                          name="payment-method"
                          checked={method === "paymob"}
                          onChange={() => setMethod("paymob")}
                        />
                        <CreditCard size={16} />
                        {text.paymobLabel}
                      </label>
                    )}
                    {providers.stripe && (
                      <label className="noormexa-payment-option">
                        <input
                          type="radio"
                          name="payment-method"
                          checked={method === "stripe"}
                          onChange={() => setMethod("stripe")}
                        />
                        <CreditCard size={16} />
                        {text.stripeLabel}
                      </label>
                    )}
                  </div>
                )}

                {user ? (
                  <button
                    type="button"
                    className="noormexa-primary-button noormexa-form-full"
                    disabled={placing}
                    onClick={handleCheckout}
                  >
                    {redirecting ? text.redirecting : placing ? text.checkingOut : text.checkout}
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
