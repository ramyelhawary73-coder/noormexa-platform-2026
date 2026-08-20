"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  Home,
  ShoppingBag,
  Package,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

const labels = {
  ar: {
    home: "الرئيسية",
    marketplace: "السوق",
    orders: "طلباتي",
    wishlist: "المفضلة",
    cart: "السلة",
  },
  en: {
    home: "Home",
    marketplace: "Shop",
    orders: "Orders",
    wishlist: "Wishlist",
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
  const { cartCount, wishlist } = useMarketplace();

  const navItems = [
    { href: "/", label: text.home, icon: Home, active: pathname === "/" },
    {
      href: "/marketplace",
      label: text.marketplace,
      icon: ShoppingBag,
      active: pathname.startsWith("/marketplace") && !pathname.includes("wishlist"),
    },
    {
      href: "/orders",
      label: text.orders,
      icon: Package,
      active: pathname.startsWith("/orders"),
    },
    {
      href: "/marketplace?wishlist=true",
      label: text.wishlist,
      icon: Heart,
      badge: wishlist.length,
      active: pathname.includes("wishlist"),
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
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-line shadow-lg transition-transform pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors ${
                isActive
                  ? "text-gold font-bold"
                  : "text-muted hover:text-foreground font-medium"
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? "stroke-[2.5]" : "stroke-[1.8]"} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -end-2 min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-gold text-navy text-[9px] font-black px-1 shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-none">{item.label}</span>
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
