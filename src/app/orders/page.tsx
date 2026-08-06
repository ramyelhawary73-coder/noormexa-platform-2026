"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNoormexaLanguage } from "@/lib/useLanguage";
import { getMyOrders, type Order } from "@/lib/marketplace";

const copy = {
  ar: {
    title: "طلباتي",
    empty: "لسه معملتش أي طلب.",
    browse: "تصفح السوق",
    order: "طلب رقم",
    store: "المتجر",
    total: "الإجمالي",
    currency: "ج.م",
    status: {
      pending: "قيد المراجعة",
      paid: "مدفوع",
      shipped: "تم الشحن",
      completed: "تم التسليم",
      cancelled: "ملغي",
    } as Record<string, string>,
    needLogin: "سجّل دخول عشان تشوف طلباتك.",
    goLogin: "تسجيل الدخول",
  },
  en: {
    title: "My orders",
    empty: "You haven't placed any orders yet.",
    browse: "Browse the market",
    order: "Order",
    store: "Store",
    total: "Total",
    currency: "EGP",
    status: {
      pending: "Pending review",
      paid: "Paid",
      shipped: "Shipped",
      completed: "Delivered",
      cancelled: "Cancelled",
    } as Record<string, string>,
    needLogin: "Sign in to see your orders.",
    goLogin: "Sign in",
  },
} as const;

export default function OrdersPage() {
  const language = useNoormexaLanguage();
  const text = copy[language];
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    getMyOrders(user.id).then((data) => {
      if (!active) return;
      setOrders(data);
      setLoadedFor(user.id);
    });
    return () => {
      active = false;
    };
  }, [user]);

  if (authLoading) {
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
            <p>{text.needLogin}</p>
            <Link href="/auth" className="noormexa-primary-button">
              {text.goLogin}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const loading = loadedFor !== user.id;

  return (
    <main className="noormexa-main">
      <section className="noormexa-section">
        <div className="noormexa-container">
          <div className="noormexa-section-heading">
            <h1>{text.title}</h1>
          </div>

          {!loading && orders.length === 0 && (
            <div className="noormexa-empty-state">
              <Package size={32} />
              <p>{text.empty}</p>
              <Link href="/" className="noormexa-primary-button">
                {text.browse}
              </Link>
            </div>
          )}

          <div className="noormexa-orders-list">
            {orders.map((order) => (
              <div key={order.id} className="noormexa-order-card">
                <div className="noormexa-order-card-header">
                  <span>
                    {text.order} #{order.id.slice(0, 8)}
                  </span>
                  <span className={`noormexa-status-pill noormexa-status-${order.status}`}>
                    {text.status[order.status] ?? order.status}
                  </span>
                </div>
                <p className="noormexa-muted-text">
                  {text.store}: {order.store_name}
                </p>
                <ul className="noormexa-order-items-list">
                  {order.items?.map((item) => (
                    <li key={item.id}>
                      {item.product_name} × {item.quantity}
                    </li>
                  ))}
                </ul>
                <strong>
                  {text.total}: {order.total_amount} {text.currency}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
