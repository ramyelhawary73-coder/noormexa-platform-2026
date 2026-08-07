"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Search, ShoppingBag, Sparkles, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNoormexaLanguage } from "@/lib/useLanguage";
import { supabase } from "@/lib/supabaseClient";

type Role = "customer" | "seller" | "store" | "advertiser";

const copy = {
  ar: {
    eyebrow: "خطوة أخيرة",
    title: "اختر نوع حسابك",
    text: "عشان نجهزلك المساحة الصح فى NOORMEXA.",
    customer: "متسوق",
    customerText: "أتصفح وأشتري من المتاجر",
    seller: "بائع",
    sellerText: "أعرض وأبيع منتجاتي",
    store: "متجر / علامة",
    storeText: "عندي متجر أو براند كامل",
    advertiser: "معلن",
    advertiserText: "أعرض عروض وإعلانات",
    businessName: "اسم المتجر أو العلامة (اختياري)",
    confirm: "تأكيد ومتابعة",
    saving: "جاري الحفظ...",
  },
  en: {
    eyebrow: "One last step",
    title: "Choose your account type",
    text: "So we can set up the right space for you on NOORMEXA.",
    customer: "Shopper",
    customerText: "Browse and buy from stores",
    seller: "Seller",
    sellerText: "List and sell my products",
    store: "Store / Brand",
    storeText: "I have a full store or brand",
    advertiser: "Advertiser",
    advertiserText: "Show offers and ads",
    businessName: "Store or brand name (optional)",
    confirm: "Confirm and continue",
    saving: "Saving...",
  },
} as const;

const roles: { key: Role; icon: typeof ShoppingBag }[] = [
  { key: "customer", icon: ShoppingBag },
  { key: "seller", icon: Search },
  { key: "store", icon: Store },
  { key: "advertiser", icon: Megaphone },
];

export default function ChooseRolePage() {
  const language = useNoormexaLanguage();
  const text = copy[language];
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Role>("customer");
  const [businessName, setBusinessName] = useState("");
  const [saving, setSaving] = useState(false);

  const roleLabels: Record<Role, { title: string; text: string }> = {
    customer: { title: text.customer, text: text.customerText },
    seller: { title: text.seller, text: text.sellerText },
    store: { title: text.store, text: text.storeText },
    advertiser: { title: text.advertiser, text: text.advertiserText },
  };

  const handleConfirm = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        account_type: role,
        business_name: businessName.trim() || null,
        account_type_chosen: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    await refreshProfile();
    setSaving(false);
    router.replace(role === "customer" ? "/" : "/dashboard");
  };

  return (
    <main className="noormexa-main">
      <section className="noormexa-section">
        <div className="noormexa-container noormexa-role-select-container">
          <span className="noormexa-eyebrow">
            <Sparkles size={17} />
            {text.eyebrow}
          </span>
          <h1>{text.title}</h1>
          <p className="noormexa-muted-text">{text.text}</p>

          <div className="noormexa-role-select-grid">
            {roles.map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className={`noormexa-role-select-card${role === key ? " noormexa-role-select-active" : ""}`}
                onClick={() => setRole(key)}
              >
                <Icon size={22} />
                <strong>{roleLabels[key].title}</strong>
                <span>{roleLabels[key].text}</span>
              </button>
            ))}
          </div>

          {role !== "customer" && (
            <label className="noormexa-field noormexa-form-full">
              <span>{text.businessName}</span>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </label>
          )}

          <button
            type="button"
            className="noormexa-primary-button noormexa-form-full"
            disabled={saving}
            onClick={handleConfirm}
          >
            {saving ? text.saving : text.confirm}
          </button>
        </div>
      </section>
    </main>
  );
}
