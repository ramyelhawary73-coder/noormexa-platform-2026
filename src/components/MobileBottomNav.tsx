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
  Store,
  User,
  LogIn,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
import { getUserRole } from "@/lib/authHelpers";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

const labels = {
  ar: {
    home: "الرئيسية",
    marketplace: "السوق",
    admin: "لوحة المالك",
    seller: "لوحة التاجر",
    account: "حسابي",
    signIn: "دخول",
    orders: "طلباتي",
    cart: "السلة",
  },
  en: {
    home: "Home",
    marketplace: "Shop",
    admin: "Owner Hub",
    seller: "Seller Hub",
    account: "My Account",
    signIn: "Sign In",
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
  const { user, profile, loading: authLoading } = useAuth();

  // Dynamic user role evaluation based on email and profile
  const role = authLoading ? "guest" : getUserRole(user, profile);

  // Center button config based on role
  let centerItem: {
    href: string;
    label: string;
    icon: typeof Crown | typeof Store | typeof User | typeof LogIn;
    active: boolean;
    badgeDotColor: string;
  };

  if (role === "admin") {
    centerItem = {
      href: "/admin",
      label: text.admin,
      icon: Crown,
      active: pathname.startsWith("/admin"),
      badgeDotColor: "bg-emerald-500",
    };
  } else if (role === "seller") {
    centerItem = {
      href: "/seller/dashboard",
      label: text.seller,
      icon: Store,
      active: pathname.startsWith("/seller") || pathname.startsWith("/dashboard"),
      badgeDotColor: "bg-orange-500",
    };
  } else if (role === "customer") {
    centerItem = {
      href: "/dashboard",
      label: text.account,
      icon: User,
      active: pathname === "/dashboard" || pathname.startsWith("/profile"),
      badgeDotColor: "bg-blue-500",
    };
  } else {
    // Guest / Unauthenticated
    centerItem = {
      href: "/auth",
      label: text.signIn,
      icon: LogIn,
      active: pathname.startsWith("/auth"),
      badgeDotColor: "bg-slate-400",
    };
  }

  const navItems = [
    { href: "/", label: text.home, icon: Home, active: pathname === "/" },
    {
      href: "/marketplace",
      label: text.marketplace,
      icon: ShoppingBag,
      active: pathname.startsWith("/marketplace") && !pathname.includes("wishlist"),
    },
    {
      href: centerItem.href,
      label: centerItem.label,
      icon: centerItem.icon,
      isSpecial: true,
      active: centerItem.active,
      badgeDotColor: centerItem.badgeDotColor,
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
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 dark:bg-[#0b1322]/95 backdrop-blur-xl border-t border-line shadow-2xl transition-transform pb-[env(safe-area-inset-bottom,0px)] select-none">
      <nav className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center group touch-manipulation active:scale-90 transition-transform duration-100"
              >
                <div
                  className={`relative -top-2 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-150 ${
                    isActive
                      ? "bg-orange-500 text-white shadow-orange-500/40 scale-105 ring-2 ring-orange-400"
                      : "bg-navy text-white hover:scale-105 border border-slate-700 active:scale-95"
                  }`}
                >
                  <Icon size={20} className="fill-current stroke-[2]" />
                  {item.badgeDotColor && (
                    <span className={`absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full ${item.badgeDotColor} ring-2 ring-surface`} />
                  )}
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
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center touch-manipulation active:scale-90 transition-all duration-100 ${
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
