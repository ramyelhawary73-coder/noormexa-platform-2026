"use client";

import { useState, useSyncExternalStore, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Coins,
  CreditCard,
  Crown,
  Flame,
  Heart,
  HelpCircle,
  Package,
  Percent,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tag,
  Timer,
  Truck,
  Users,
} from "lucide-react";
import HeroImageSlider from "@/components/landing/HeroImageSlider";
import { useMarketplace } from "@/context/MarketplaceContext";
import { NoormexaEmblemSvg } from "@/components/BrandLogo";
import { useTheme } from "@/context/ThemeContext";

type Language = "ar" | "en";

type RoleCard = {
  title: string;
  text: string;
  cta: string;
  badge: string;
  icon: LucideIcon;
  href: string;
};

type CategoryCard = {
  name: string;
  nameEn: string;
  slug: string;
  count: string;
  icon: LucideIcon;
  image: string;
};

type StatCard = {
  value: string;
  label: string;
  sublabel: string;
  icon: LucideIcon;
};

type PlanCard = {
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
  highlight?: boolean;
};

const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    trustBar: {
      freeShipping: "شحن مجاني للطلبات المؤهلة",
      guarantee: "منتجات أصلية 100% معتمدة",
      fastDelivery: "توصيل سريع وتتبع مباشر",
      securePay: "دفع آمن بالبطاقات وApple Pay ومدى",
    },
    hero: {
      badge: "منصة التجارة الإلكترونية الشاملة والفاخرة — NOORMEXA GLOBAL",
      title: "عالم متكامل للتسوق الراقي وتجارة المستقبل",
      subtitle: "اكتشف أرقى المنتجات العالمية، تسوق من المتاجر الرسمية الموثقة، أو افتح متجرك الخاص وابدأ البيع فوراً بأعلى معايير الأمان والسرعة.",
      searchPlaceholder: "ابحث عن منتج، متجر رسمي، علامة تجارية، أو تصنيف...",
      searchButton: "بحث فوري",
      quickTags: ["ساعات كرونوغراف", "عطور ملكية", "أزياء كشمير", "سماعات Pro", "ديكورات فاخرة"],
      ctaShop: "تسوق التشكيلة الحصرية",
      ctaSell: "انضم كتاجر معتمد",
      ctaMarket: "تصفح السوق المفتوح",
    },
    officialSection: {
      tag: "المتجر المعتمد الحصري",
      title: "متجر NOORMEXA الرسمي المباشر",
      desc: "التشكيلة الرسمية المباشرة من المنصة بعمولة 0%، ضمان ذهبي معتمد، وشحن فوري مع خدمة عملاء VIP على مدار الساعة.",
      visitStore: "زيارة المتجر الرسمي",
    },
    flashDeals: {
      badge: "عروض الفلاش الحصرية",
      title: "تخفيضات استثنائية لفترة محدودة",
      subtitle: "استفد من خصومات تصل إلى 40% على أكثر المنتجات طلباً قبل نفاد الكمية.",
      endsIn: "ينتهي العرض خلال:",
      hours: "ساعة",
      mins: "دقيقة",
      secs: "ثانية",
      claimed: "تم طلب",
      viewAll: "عرض كافة العروض",
    },
    categories: {
      badge: "أقسام السوق الفاخرة",
      title: "تسوق حسب القسم المفضل",
      subtitle: "مجموعات مختارة بعناية لتلبي ذوقك الراقي واحتياجاتك اليومية.",
      viewCatalog: "استكشف كل الأقسام",
    },
    featuredProducts: {
      badge: "التشكيلة الأكثر طلباً",
      title: "منتجات مميزة بتقييمات استثنائية",
      subtitle: "اخترنا لك نخبة من أفضل منتجات المتاجر المعتمدة ذات الجودة العالية.",
      addToCart: "إضافة للسلة",
      added: "تمت الإضافة ✓",
      viewProduct: "تفاصيل المنتج",
    },
    roles: {
      badge: "منظومة واحدة تجمع الجميع",
      title: "اختر بوابتك في NOORMEXA",
      subtitle: "صُممت المنصة لتلائم المتسوقين الباحثين عن التميز، والتجار والعلامات الطامحة للنمو العالمي.",
      items: [
        {
          title: "المتسوق الراقي",
          text: "استكشف آلاف المنتجات الفاخرة والمضمونة بأفضل أسعار صرف وعروض حصرية مع تتبع شحنتك لحظياً.",
          cta: "ابدأ التسوق",
          badge: "تجربة متكاملة",
          icon: Search,
          href: "/marketplace",
        },
        {
          title: "التاجر المعتمد",
          text: "أدر منتجاتك، تتبع أرباحك وعمولاتك، واسحب أموالك بنقرة واحدة عبر بوابات دفع مصرفية آمنة.",
          cta: "سجل كبائع",
          badge: "عمولات تنافسية",
          icon: ShoppingBag,
          href: "/seller/dashboard",
        },
        {
          title: "المتاجر والعلامات التجارية",
          text: "احصل على صفحة متجر رسمية معتمدة مع شارة التوثيق الملكية وحملات ترويجية مخصصة لجمهورك.",
          cta: "دشن متجرك",
          badge: "شارة التوثيق الذهبية",
          icon: Store,
          href: "/auth?mode=signup&role=store",
        },
        {
          title: "الشركاء والمعلنون",
          text: "أطلق حملاتك الترويجية وبانرات الفلاش سيل لتصل إلى ملايين المشترين النشطين في الخليج والعالم.",
          cta: "أطلق حملتك",
          badge: "وصول واسع",
          icon: Sparkles,
          href: "/marketplace",
        },
      ] as RoleCard[],
    },
    testimonials: {
      badge: "آراء وتجارب العملاء",
      title: "موثوق به من آلاف المتسوقين والتجار",
      subtitle: "شهادات حقيقية من عملائنا في المملكة العربية السعودية، الإمارات، مصر، والكويت.",
      reviews: [
        {
          name: "عبدالرحمن الشمري",
          location: "الرياض، المملكة العربية السعودية",
          rating: 5,
          comment: "تجربة شراء ساعة NOORMEXA الفاخرة كانت استثنائية. الشحن وصل في 48 ساعة والتغليف الملكي فاق توقعاتي.",
          product: "ساعة الكرونوغراف الفاخرة",
        },
        {
          name: "سارة المهيري",
          location: "دبي، الإمارات العربية المتحدة",
          rating: 5,
          comment: "عطر السلطان الملكي أصلي 100% وثباته مذهل. بوابات الدفع سهلة جداً وخيار الدفع بالدرهم فوري.",
          product: "عطر السلطان الملكي (100ml)",
        },
        {
          name: "م. كريم حسام",
          location: "القاهرة، جمهورية مصر العربية",
          rating: 5,
          comment: "كمتجر شريك في المنصة، لوحة تحكم التاجر وسرعة تحويل الأرباح للبنوك هي الأفضل على الإطلاق.",
          product: "متجر TechCraft Global",
        },
      ],
    },
    stats: {
      badge: "أرقام تتحدث عن ريادتنا",
      title: "أرقام تنمو باطراد كل يوم",
      items: [
        { value: "+500", label: "متجر وعلامة موثقة", sublabel: "تخضع لتدقيق الجودة KYC", icon: Store },
        { value: "+120k", label: "طلب مكتمل بنجاح", sublabel: "بنسبة رضا تفوق 99.4%", icon: Package },
        { value: "+12", label: "دولة حول العالم", sublabel: "شحن جوي سريع ودولي", icon: Truck },
        { value: "24/7", label: "دعم عملاء كونسيرج", sublabel: "خدمة فورية ومخصصة", icon: ShieldCheck },
      ] as StatCard[],
    },
    plans: {
      badge: "باقات اشتراك التجار",
      title: "خطط نمو مصممة لكل مرحلة من أعمالك",
      subtitle: "ابدأ مجاناً أو طور نشاطك مع مزايا الظهور المتقدم والعمولات المخفضة.",
      items: [
        {
          name: "الباقة الأساسية (Starter)",
          price: "مجاناً",
          period: "",
          badge: "للبدء الفوري",
          features: ["حتى 15 منتجاً معروضاً", "عمولة 8% فقط على المبيعات", "لوحة تحكم أساسية", "دعم فني عبر البريد"],
        },
        {
          name: "الباقة الاحترافية (Pro Merchant)",
          price: "299 ج.م",
          period: "/شهرياً",
          badge: "الأكثر شعبية",
          features: ["منتجات غير محدودة", "عمولة مخفضة 5% فقط", "شارة المتجر الموثق", "أولوية الظهور في محرك البحث", "دعم مخصص 24/7"],
          highlight: true,
        },
        {
          name: "باقة العلامات الكبرى (Enterprise)",
          price: "حسب الطلب",
          period: "",
          badge: "للماركات الرسمية",
          features: ["صفحة متجر مخصصة مع شارة التاج", "عمولة تفاوضية خاصة (حتى 0%)", "مدير حساب تنفيذي مخصص", "أدوات تحليلات وتسويق متقدمة"],
        },
      ] as PlanCard[],
    },
    faq: {
      badge: "الأسئلة الشائعة",
      title: "كل ما تحتاج معرفته عن السوق",
      subtitle: "إجابات واضحة لجميع استفسارات المتسوقين والتجار.",
      items: [
        {
          q: "كيف أضمن أن المنتجات أصلية 100%؟",
          a: "تخضع جميع المتاجر المسجلة في NOORMEXA لتدقيق صارم في السجل التجاري (KYC)، كما نوفر ضمان استرجاع كامل للأموال في حال عدم مطابقة المنتج.",
        },
        {
          q: "ما هي العملات وبوابات الدفع المدعومة؟",
          a: "ندعم الدفع بالجنيه المصري (EGP)، الريال السعودي (SAR)، الدرهم الإماراتي (AED)، الدينار الكويتي (KWD)، الريال القطري (QAR)، والدولار واليورو، عبر Visa, MasterCard, Mada, Apple Pay، والدفع عند الاستلام.",
        },
        {
          q: "كم يستغرق استلام أرباح البائعين؟",
          a: "تتم معالجة تسويات الأرباح للتجار خلال 24 إلى 48 ساعة عمل عبر التحويل البنكي المباشر مع تسجيل رقم الحوالة المرجعي في لوحة التحكم.",
        },
        {
          q: "كيف يمكنني تتبع شحنتي بعد الطلب؟",
          a: "بمجرد إتمام الطلب، ستحصل على رقم تتبع حي يتيح لك معرفة موقع الشحنة ومرحلتها (قيد التجهيز، تم الشحن، خارج للتوصيل) من خلال صفحة تتبع الطلبات.",
        },
      ],
    },
  },
  en: {
    trustBar: {
      freeShipping: "Free shipping on qualifying orders",
      guarantee: "100% Genuine Certified Luxury",
      fastDelivery: "Express delivery & live tracking",
      securePay: "Secure checkout via Cards, Apple Pay & Mada",
    },
    hero: {
      badge: "PREMIER GLOBAL MULTI-VENDOR MARKETPLACE — NOORMEXA GLOBAL",
      title: "The Ultimate Destination for Luxury Commerce",
      subtitle: "Discover curated premium goods, shop from verified official flagship stores, or launch your high-growth storefront with military-grade security and speed.",
      searchPlaceholder: "Search luxury watches, royal perfumes, designer fashion...",
      searchButton: "Search",
      quickTags: ["Chronograph Watches", "Royal Oud", "Cashmere Coats", "Pro ANC Audio", "Artisan Living"],
      ctaShop: "Shop Exclusive Catalog",
      ctaSell: "Become a Verified Merchant",
      ctaMarket: "Explore Marketplace",
    },
    officialSection: {
      tag: "Certified Platform Flagship",
      title: "NOORMEXA Official Flagship Store",
      desc: "Direct luxury curation from the platform with 0% commission, certified golden guarantee, express priority dispatch, and 24/7 VIP concierge support.",
      visitStore: "Visit Official Store",
    },
    flashDeals: {
      badge: "Exclusive Flash Deals",
      title: "Limited-Time Curated Vault",
      subtitle: "Save up to 40% on top trending luxury collections before stock runs out.",
      endsIn: "Offers end in:",
      hours: "hrs",
      mins: "mins",
      secs: "secs",
      claimed: "Claimed",
      viewAll: "Explore All Deals",
    },
    categories: {
      badge: "Curated Collections",
      title: "Shop by Signature Category",
      subtitle: "Meticulously crafted collections to match your discerning lifestyle.",
      viewCatalog: "Explore All Categories",
    },
    featuredProducts: {
      badge: "Trending Best Sellers",
      title: "Exceptional Quality & 5-Star Craftsmanship",
      subtitle: "Handpicked masterpieces from our highest-rated verified merchant partners.",
      addToCart: "Add to Cart",
      added: "Added to Cart ✓",
      viewProduct: "View Details",
    },
    roles: {
      badge: "One Ecosystem for All",
      title: "Choose Your Gateway in NOORMEXA",
      subtitle: "Engineered for connoisseurs seeking authenticity, and forward-thinking merchants scaling global sales.",
      items: [
        {
          title: "Discerning Shopper",
          text: "Explore thousands of certified luxury items in your local currency with live order tracking.",
          cta: "Start Shopping",
          badge: "Premium Experience",
          icon: Search,
          href: "/marketplace",
        },
        {
          title: "Verified Merchant",
          text: "Manage products, track earnings & commissions, and withdraw payouts with one click.",
          cta: "Sell on NOORMEXA",
          badge: "Low Fees",
          icon: ShoppingBag,
          href: "/seller/dashboard",
        },
        {
          title: "Flagship Stores & Brands",
          text: "Get a dedicated official storefront with royal crown verification and tailored marketing campaigns.",
          cta: "Launch Store",
          badge: "Crown Verified",
          icon: Store,
          href: "/auth?mode=signup&role=store",
        },
        {
          title: "Advertisers & Partners",
          text: "Promote flash deals and premium banners to high-value shoppers across the Middle East & Worldwide.",
          cta: "Start Campaign",
          badge: "Global Reach",
          icon: Sparkles,
          href: "/marketplace",
        },
      ] as RoleCard[],
    },
    testimonials: {
      badge: "Customer Testimonials",
      title: "Trusted by Thousands Across the Globe",
      subtitle: "Genuine reviews from verified shoppers and merchants in Saudi Arabia, UAE, Egypt, and Kuwait.",
      reviews: [
        {
          name: "Abdulrahman Al-Shammary",
          location: "Riyadh, Saudi Arabia",
          rating: 5,
          comment: "Purchasing the NOORMEXA Royal watch was seamless. Delivered in 48 hours with royal packaging.",
          product: "Royal Sapphire Chronograph",
        },
        {
          name: "Sara Al-Mheiri",
          location: "Dubai, UAE",
          rating: 5,
          comment: "The Sultan Oud is 100% authentic with remarkable longevity. Native AED payment was instantaneous.",
          product: "Imperial Oud & Ambergris 100ml",
        },
        {
          name: "Eng. Karim Hossam",
          location: "Cairo, Egypt",
          rating: 5,
          comment: "As a vendor, the seller dashboard and rapid bank payout settlement are best in class.",
          product: "TechCraft Global Innovations",
        },
      ],
    },
    stats: {
      badge: "Platform Milestones",
      title: "Proven Momentum Every Day",
      items: [
        { value: "500+", label: "Verified Stores", sublabel: "KYC quality vetted", icon: Store },
        { value: "120k+", label: "Delivered Orders", sublabel: "99.4% satisfaction score", icon: Package },
        { value: "12+", label: "Countries Served", sublabel: "Express international air freight", icon: Truck },
        { value: "24/7", label: "VIP Concierge", sublabel: "Dedicated instant support", icon: ShieldCheck },
      ] as StatCard[],
    },
    plans: {
      badge: "Merchant Tiers",
      title: "Growth Plans Engineered for Every Scale",
      subtitle: "Start free or elevate your brand with priority SEO placement and dedicated account managers.",
      items: [
        {
          name: "Starter Merchant",
          price: "Free",
          period: "",
          badge: "Get Started",
          features: ["Up to 15 active products", "8% standard sales commission", "Core seller dashboard", "Email support"],
        },
        {
          name: "Pro Merchant",
          price: "$9",
          period: "/month",
          badge: "Most Popular",
          features: ["Unlimited product listings", "Reduced 5% commission fee", "Verified Merchant badge", "Priority SEO category placement", "24/7 Priority Support"],
          highlight: true,
        },
        {
          name: "Flagship Enterprise",
          price: "Custom",
          period: "",
          badge: "Official Brands",
          features: ["Dedicated Flagship Store with Crown badge", "Negotiable commission (down to 0%)", "Executive account manager", "Advanced analytics & custom marketing campaigns"],
        },
      ] as PlanCard[],
    },
    faq: {
      badge: "Frequently Asked Questions",
      title: "Everything You Need to Know",
      subtitle: "Clear answers for shoppers and merchants alike.",
      items: [
        {
          q: "How do you guarantee 100% genuine luxury products?",
          a: "All stores on NOORMEXA undergo rigorous KYC commercial license verification. We back every order with a 100% money-back guarantee.",
        },
        {
          q: "Which currencies and payment gateways are supported?",
          a: "We support EGP, SAR, AED, KWD, QAR, USD, and EUR via Visa, MasterCard, Mada, Apple Pay, and Cash on Delivery.",
        },
        {
          q: "How fast are vendor payouts settled?",
          a: "Vendor payout requests are processed within 24–48 business hours via direct bank wire with full reference tracking.",
        },
        {
          q: "How can I track my shipment after placing an order?",
          a: "You receive a live tracking code instantly to monitor preparation, air dispatch, and local delivery on our Track Orders page.",
        },
      ],
    },
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

function useNoormexaLanguage() {
  return useSyncExternalStore<Language>(subscribeToLanguage, getLanguageSnapshot, () => "ar");
}

export default function HomePage() {
  const language = useNoormexaLanguage();
  const isAr = language === "ar";
  const text = copy[language];
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { products, stores, formatPrice, addToCart, wishlist, toggleWishlist } = useMarketplace();

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Live Flash Deal Countdown Timer (Simulated 14 hours remaining)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, mins: 32, secs: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, mins: 59, secs: 59 };
        return { hours: 24, mins: 0, secs: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/marketplace");
    }
  };

  const handleQuickAdd = (product: (typeof products)[number]) => {
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current));
    }, 2000);
  };

  const DirectionIcon = isAr ? ArrowLeft : ArrowRight;

  // Curated Categories List with High-Resolution Visuals
  const categoriesList: CategoryCard[] = [
    {
      name: "إلكترونيات ذكية",
      nameEn: "Smart Electronics",
      slug: "electronics",
      count: "128+ منتج",
      icon: Package,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "أزياء وكشمير فاخر",
      nameEn: "Haute Fashion",
      slug: "fashion",
      count: "94+ منتج",
      icon: ShoppingBag,
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "عطور ملكية وبخور",
      nameEn: "Royal Perfumery",
      slug: "beauty",
      count: "67+ منتج",
      icon: Sparkles,
      image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "ساعات ومجوهرات",
      nameEn: "Watches & Jewelry",
      slug: "accessories",
      count: "52+ منتج",
      icon: Crown,
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "ديكور ومنزل حرفي",
      nameEn: "Artisan Living",
      slug: "home",
      count: "81+ منتج",
      icon: Tag,
      image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=500&auto=format&fit=crop&q=80",
    },
  ];

  // Official Store (Flagship)
  const officialStore = stores.find((s) => s.is_official) || stores[0];

  return (
    <main id="top" className="noormexa-main overflow-hidden">
      {/* 1. Global Trust & Quality Assurance Strip */}
      <div className="bg-slate-900 text-slate-100 border-b border-slate-800 py-2.5 px-4">
        <div className="noormexa-container flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Sparkles size={14} className="animate-pulse shrink-0 text-amber-400" />
            <span className="truncate">{text.trustBar.guarantee}</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Truck size={13} className="text-amber-400" />
              <span>{text.trustBar.freeShipping}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>{text.trustBar.fastDelivery}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard size={13} className="text-sky-400" />
              <span>{text.trustBar.securePay}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/marketplace?filter=deals"
              className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] sm:text-[11px] hover:bg-amber-400 transition-all flex items-center gap-1 shadow-xs"
            >
              <Flame size={12} className="text-slate-950 fill-slate-950" />
              <span>{isAr ? "فلاش ديلز 40% خصم" : "Flash Deals 40% OFF"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. World-Class Luxury Hero Section */}
      <section className="relative pt-8 pb-12 md:pt-14 md:pb-20 border-b border-line bg-gradient-to-b from-surface/40 via-surface-soft/60 to-surface">
        <div className="noormexa-container grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left / Primary Text Column */}
          <div className="lg:col-span-6 space-y-6 text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-gold text-xs font-black shadow-xs">
              <Crown size={14} className="text-amber-600 dark:text-gold fill-amber-500/30" />
              <span>{text.hero.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.2]">
              {text.hero.title}
            </h1>

            <p className="text-sm sm:text-base text-muted leading-relaxed max-w-xl">
              {text.hero.subtitle}
            </p>

            {/* Interactive Live Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
              <div className="flex items-center bg-surface border-2 border-line hover:border-gold/60 focus-within:border-gold rounded-2xl p-1.5 shadow-md transition-all">
                <div className="p-2.5 text-muted">
                  <Search size={20} className="text-amber-600 dark:text-gold" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={text.hero.searchPlaceholder}
                  className="w-full bg-transparent border-none text-foreground placeholder:text-muted/70 text-xs sm:text-sm font-medium focus:outline-none px-2"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-navy hover:bg-slate-800 text-white dark:bg-gold dark:text-navy dark:hover:bg-gold-strong font-black text-xs sm:text-sm shrink-0 shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>{text.hero.searchButton}</span>
                  <DirectionIcon size={14} />
                </button>
              </div>

              {/* Quick Search Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px]">
                <span className="text-muted font-bold">{isAr ? "الأكثر بحثاً:" : "Popular:"}</span>
                {text.hero.quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => router.push(`/marketplace?search=${encodeURIComponent(tag)}`)}
                    className="px-2.5 py-0.5 rounded-lg bg-surface-soft border border-line text-foreground/80 hover:border-gold hover:text-foreground transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </form>

            {/* Direct Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/marketplace"
                className="noormexa-primary-button px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black shadow-md flex items-center gap-2"
              >
                <ShoppingBag size={16} />
                <span>{text.hero.ctaShop}</span>
                <DirectionIcon size={14} />
              </Link>

              <Link
                href="/seller/dashboard"
                className="px-5 py-3.5 rounded-2xl bg-surface border border-line hover:border-gold text-foreground font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-xs"
              >
                <Store size={16} className="text-amber-600 dark:text-gold" />
                <span>{text.hero.ctaSell}</span>
              </Link>
            </div>
          </div>

          {/* Right / Hero Showcase Slider */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-line bg-surface">
              <HeroImageSlider language={language} />

              {/* Floating Social Proof Pill */}
              <div className="absolute bottom-4 start-4 z-20 bg-surface/95 backdrop-blur-md border border-line px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-gold font-black shrink-0">
                  <Star size={18} className="fill-amber-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-foreground flex items-center gap-1.5 whitespace-nowrap">
                    <span dir="ltr">4.9 / 5.0</span>
                    <span className="text-amber-500">★</span>
                    <span className="text-[10px] text-muted font-normal">({isAr ? "تقييم عام" : "Score"})</span>
                  </div>
                  <div className="text-[10px] text-muted whitespace-nowrap">{isAr ? "أكثر من 120,000 عميل موثق" : "120k+ Verified Orders"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Official Flagship Store Spotlight Section */}
      {officialStore && (
        <section className="py-8 md:py-12 border-b border-line bg-surface-soft/60">
          <div className="noormexa-container">
            <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line hover:border-gold/40 shadow-lg relative overflow-hidden transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start sm:items-center gap-5">
                  {/* Official NOORMEXA Vector Logo Emblem */}
                  <div className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <NoormexaEmblemSvg size={68} isDark={isDark} />
                  </div>

                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-gold font-black text-[11px] border border-amber-500/20">
                      <Sparkles size={12} className="text-amber-500" />
                      <span>{text.officialSection.tag}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-foreground flex flex-wrap items-center gap-2">
                      <span>{isAr ? "متجر نورميكسا الرسمي" : "NOORMEXA Flagship Direct"}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-gold bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20" dir="ltr">
                        <BadgeCheck size={13} className="text-emerald-500" />
                        <span>Flagship Direct</span>
                      </span>
                    </h2>

                    <p className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
                      {officialStore.description || text.officialSection.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/store/${officialStore.slug}`}
                    className="noormexa-primary-button px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <span>{text.officialSection.visitStore}</span>
                    <DirectionIcon size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Live Flash Deals & Countdown Vault */}
      <section className="py-10 md:py-16 border-b border-line bg-surface">
        <div className="noormexa-container space-y-8">
          {/* Section Header with Live Countdown */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-line pb-6">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-black text-xs border border-red-500/20">
                <Flame size={14} className="fill-red-500 text-red-500 animate-bounce" />
                <span>{text.flashDeals.badge}</span>
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-foreground tracking-tight break-words">
                {text.flashDeals.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted">{text.flashDeals.subtitle}</p>
            </div>

            {/* Live Clock */}
            <div className="flex items-center gap-3 bg-surface-soft border border-line p-3 rounded-2xl shadow-xs shrink-0">
              <span className="text-xs font-bold text-muted flex items-center gap-1">
                <Timer size={15} className="text-amber-500" />
                <span>{text.flashDeals.endsIn}</span>
              </span>
              <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm">
                <span className="px-2 py-1 rounded-lg bg-navy text-white font-bold">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span>:</span>
                <span className="px-2 py-1 rounded-lg bg-navy text-white font-bold">{String(timeLeft.mins).padStart(2, "0")}</span>
                <span>:</span>
                <span className="px-2 py-1 rounded-lg bg-red-600 text-white font-bold animate-pulse">{String(timeLeft.secs).padStart(2, "0")}</span>
              </div>
            </div>
          </div>

          {/* Flash Deals Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.slice(0, 4).map((prod, idx) => {
              const discount = 20 + idx * 5;
              const originalPrice = prod.price * (1 + discount / 100);
              const store = stores.find((s) => s.id === prod.store_id);
              const isAdded = addedProductId === prod.id;
              const isWishlisted = wishlist.includes(prod.id);

              return (
                <div
                  key={prod.id}
                  className="group rounded-3xl bg-surface border border-line hover:border-gold hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-square overflow-hidden bg-surface-soft shrink-0">
                    <img
                      src={prod.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Discount Badge */}
                    <div className="absolute top-3 start-3 px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-[11px] shadow-md flex items-center gap-1 z-10 whitespace-nowrap">
                      <Percent size={11} />
                      <span dir="ltr">-{discount}%</span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(prod.id)}
                      className="absolute top-3 end-3 w-8 h-8 rounded-full bg-surface/90 backdrop-blur-xs border border-line flex items-center justify-center text-muted hover:text-red-500 hover:scale-110 transition-all shadow-sm z-10"
                      aria-label="Wishlist"
                    >
                      <Heart size={15} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      {/* Store Attribution */}
                      <div className="flex items-center gap-1.5 text-[11px] text-muted">
                        <Store size={12} className="text-amber-500 shrink-0" />
                        <span className="truncate font-bold text-foreground/80">{store?.name || "Official Store"}</span>
                        {store?.is_official && <Crown size={11} className="text-amber-500 fill-amber-500 shrink-0" />}
                      </div>

                      <Link href={`/product/${prod.id}`} className="block">
                        <h3 className="font-bold text-foreground text-sm line-clamp-2 min-h-[2.6rem] group-hover:text-gold transition-colors leading-snug">
                          {prod.name}
                        </h3>
                      </Link>
                    </div>

                    {/* Price & Progress Bar */}
                    <div className="space-y-2 pt-2 border-t border-line/60">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-base sm:text-lg font-black text-foreground whitespace-nowrap">{formatPrice(prod.price)}</span>
                        <span className="text-xs text-muted line-through whitespace-nowrap">{formatPrice(originalPrice)}</span>
                      </div>

                      {/* Stock Claimed Bar */}
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between text-muted font-bold">
                          <span>{text.flashDeals.claimed} 78%</span>
                          <span className="text-amber-600 dark:text-gold font-black whitespace-nowrap">{isAr ? "متبقي 6 قطع فقط" : "6 left"}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-soft border border-line overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full" style={{ width: "78%" }} />
                        </div>
                      </div>

                      {/* Add to Cart CTA */}
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(prod)}
                        className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                          isAdded
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-surface-soft hover:bg-gold hover:text-navy border border-line text-foreground"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={14} />
                            <span>{text.featuredProducts.added}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={14} />
                            <span>{text.featuredProducts.addToCart}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Signature Categories Grid */}
      <section id="categories" className="py-12 md:py-16 border-b border-line bg-surface-soft/50">
        <div className="noormexa-container space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 dark:text-gold font-black text-xs border border-amber-500/20 mb-1">
                <Sparkles size={13} />
                <span>{text.categories.badge}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {text.categories.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1">{text.categories.subtitle}</p>
            </div>

            <Link
              href="/marketplace"
              className="text-xs sm:text-sm font-bold text-amber-600 dark:text-gold hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{text.categories.viewCatalog}</span>
              <DirectionIcon size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriesList.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/marketplace?category=${cat.slug}`}
                  className="group relative rounded-3xl overflow-hidden border border-line bg-surface hover:border-gold hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-surface-soft">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 end-3 p-2 rounded-xl bg-surface/90 backdrop-blur-xs border border-line text-amber-600 dark:text-gold">
                      <Icon size={16} />
                    </div>
                  </div>

                  <div className="p-4 space-y-1 text-center bg-surface">
                    <h3 className="font-bold text-foreground text-xs sm:text-sm group-hover:text-gold transition-colors line-clamp-1">
                      {isAr ? cat.name : cat.nameEn}
                    </h3>
                    <span className="text-[11px] text-muted block">{cat.count}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Multi-Vendor Platform Ecosystem (Choose Your Role) */}
      <section id="roles" className="py-12 md:py-20 border-b border-line bg-surface">
        <div className="noormexa-container space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-xs border border-blue-500/20">
              <Users size={14} />
              <span>{text.roles.badge}</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              {text.roles.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {text.roles.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {text.roles.items.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.title}
                  className="p-6 rounded-3xl bg-surface-soft border border-line hover:border-gold hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-gold flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                        <Icon size={22} />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-surface border border-line text-[10px] font-bold text-muted">
                        {role.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-foreground mb-1.5">{role.title}</h3>
                      <p className="text-xs text-muted leading-relaxed">{role.text}</p>
                    </div>
                  </div>

                  <Link
                    href={role.href}
                    className="w-full py-2.5 rounded-xl bg-surface border border-line hover:border-gold hover:bg-gold hover:text-navy text-foreground font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>{role.cta}</span>
                    <DirectionIcon size={13} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Platform Statistics & Proof of Scale */}
      <section className="py-12 md:py-16 border-b border-line bg-gradient-to-r from-navy via-[#121f36] to-navy text-white">
        <div className="noormexa-container space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-black text-gold tracking-widest uppercase">{text.stats.badge}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{text.stats.title}</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {text.stats.items.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xs text-center space-y-2 hover:bg-white/10 transition-all"
                >
                  <div className="w-10 h-10 mx-auto rounded-xl bg-gold/20 text-gold flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-gold tracking-tight">{stat.value}</div>
                  <div className="text-xs sm:text-sm font-bold text-white">{stat.label}</div>
                  <div className="text-[10px] text-white/60">{stat.sublabel}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Verified Testimonials & Customer Trust */}
      <section className="py-12 md:py-16 border-b border-line bg-surface">
        <div className="noormexa-container space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-black text-xs border border-emerald-500/20">
              <Star size={13} className="fill-emerald-500 text-emerald-500" />
              <span>{text.testimonials.badge}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">{text.testimonials.title}</h2>
            <p className="text-xs sm:text-sm text-muted">{text.testimonials.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {text.testimonials.reviews.map((rev) => (
              <div
                key={rev.name}
                className="p-6 rounded-3xl bg-surface-soft border border-line space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={15} className="fill-amber-500" />
                    ))}
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-foreground">{rev.name}</h4>
                    <span className="text-[11px] text-muted">{rev.location}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                    <BadgeCheck size={12} />
                    <span>{isAr ? "طلب موثق" : "Verified"}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Merchant Subscription Plans */}
      <section id="plans" className="py-12 md:py-20 border-b border-line bg-surface-soft/60">
        <div className="noormexa-container space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-900 dark:text-gold font-black text-xs border border-amber-500/20">
              <Coins size={14} />
              <span>{text.plans.badge}</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              {text.plans.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted">{text.plans.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {text.plans.items.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between space-y-6 ${
                  plan.highlight
                    ? "bg-surface border-2 border-gold shadow-2xl relative scale-105"
                    : "bg-surface border border-line shadow-sm hover:border-gold/50"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-black shadow-md flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-black text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-black text-foreground">{plan.price}</span>
                      {plan.period && <span className="text-xs text-muted">{plan.period}</span>}
                    </div>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-line text-xs">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-foreground/90 font-medium">
                        <BadgeCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/auth?mode=signup&role=seller"
                  className={`w-full py-3 rounded-xl font-black text-xs text-center transition-all ${
                    plan.highlight
                      ? "bg-gold text-navy hover:bg-gold-strong shadow-md"
                      : "bg-surface-soft hover:bg-surface border border-line text-foreground"
                  }`}
                >
                  {isAr ? "ابدأ بهذه الباقة" : "Choose Plan"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Interactive Frequently Asked Questions */}
      <section id="faq" className="py-12 md:py-16 bg-surface">
        <div className="noormexa-container max-w-4xl space-y-8">
          <div className="text-center space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-xs border border-purple-500/20">
              <HelpCircle size={13} />
              <span>{text.faq.badge}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">{text.faq.title}</h2>
            <p className="text-xs sm:text-sm text-muted">{text.faq.subtitle}</p>
          </div>

          <div className="space-y-3">
            {text.faq.items.map((item) => (
              <details
                key={item.q}
                className="group p-5 rounded-2xl bg-surface-soft border border-line hover:border-gold transition-all select-none"
              >
                <summary className="font-bold text-foreground text-xs sm:text-sm cursor-pointer list-none flex items-center justify-between gap-3">
                  <span>{item.q}</span>
                  <span className="w-6 h-6 rounded-lg bg-surface border border-line flex items-center justify-center text-muted group-open:rotate-180 transition-transform shrink-0">
                    ▼
                  </span>
                </summary>
                <p className="text-xs text-muted leading-relaxed mt-3 pt-3 border-t border-line/60 font-medium">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
