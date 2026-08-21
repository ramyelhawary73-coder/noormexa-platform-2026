"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  Home,
  ShoppingBag,
  Package,
  Crown,
  ShoppingCart,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

const labels = {
  ar: {
    home: "الرئيسية",
    marketplace: "السوق",
    admin: "لوحة المالك",
    orders: "طلباتي",
    cart: "السلة",
  },
  en: {
    home: "Home",
    marketplace: "Shop",
    admin: "Owner Hub",
    orders: "Orders",
    cart: "Cart",
  },
} as const;

function getLanguageSnapshot(): Language {
  if (typeof window === "undefined") return "ar";
  return window.localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "ar";
}

function subscribeToLanguage(callback: () => void) {
  window.addEventListener("noormexa-language-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("noormexa-language-change", callback);
    window.removeEventListener("storage", callback);
  };
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const language = useSyncExternalStore<Language>(subscribeToLanguage, getLanguageSnapshot, () => "ar");
  const text = labels[language];
  const { cartCount } = useMarketplace();

  const isOwnerActive = pathname.startsWith("/admin") || pathname.startsWith("/seller");

  const navItems = [
    { href: "/", label: text.home, icon: Home, active: pathname === "/" },
    {
      href: "/marketplace",
      label: text.marketplace,
      icon: ShoppingBag,
      active: pathname.startsWith("/marketplace") && !pathname.includes("wishlist"),
    },
    {
      href: "/admin",
      label: text.admin,
      icon: Crown,
      isSpecial: true,
      active: isOwnerActive,
    },
    {
      href: "/orders",
      label: text.orders,
      icon: Package,
      active: pathname.startsWith("/orders"),
    },
    {
      href: "/cart",
      label: text.cart,
      icon: ShoppingCart,
      badge: cartCount,
      active: pathname.startsWith("/cart"),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-line shadow-2xl transition-transform pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="flex items-center justify-around h-16 px-1.5 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center group"
              >
                <div
                  className={`relative -top-2 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                    isActive
                      ? "bg-orange-500 text-white shadow-orange-500/30 scale-105 ring-2 ring-orange-400"
                      : "bg-navy text-white hover:scale-105 border border-slate-700"
                  }`}
                >
                  <Icon size={20} className="fill-current stroke-[2]" />
                  <span className="absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
                </div>
                <span
                  className={`text-[10px] font-black -mt-1 leading-none ${
                    isActive ? "text-orange-500 font-black" : "text-foreground font-bold"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors ${
                isActive
                  ? "text-orange-500 font-black"
                  : "text-muted hover:text-foreground font-bold"
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? "stroke-[2.5]" : "stroke-[1.8]"} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -end-2 min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-orange-500 text-white text-[9px] font-black px-1 shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-none font-bold">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-gold" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
