"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  Check,
  Coins,
  Copy,
  CreditCard,
  Crown,
  Flame,
  Gift,
  Heart,
  HelpCircle,
  Package,
  Percent,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tag,
  Truck,
  Users,
  Video,
  Download,
  Smartphone,
  Laptop,
  Zap,
} from "lucide-react";
import HeroImageSlider from "@/components/landing/HeroImageSlider";
import SmoothFlashTimer from "@/components/landing/SmoothFlashTimer";
import GlobalBrandsShowcase from "@/components/landing/GlobalBrandsShowcase";
import { openPwaInstallModal } from "@/components/PwaInstallPrompt";
import { useMarketplace } from "@/context/MarketplaceContext";
import { NoormexaEmblemSvg } from "@/components/BrandLogo";
import { useTheme } from "@/context/ThemeContext";
import ReelsVideoModal, { type ReelStory } from "@/components/landing/ReelsVideoModal";

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

type CouponItem = {
  code: string;
  discount: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  minSpend: string;
};

const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    trustBar: {
      freeShipping: "شحن مجاني وسريع للطلبات المؤهلة",
      guarantee: "منتجات أصلية 100% معتمدة بفحص الجودة",
      fastDelivery: "توصيل سريع وتتبع مباشر لحظة بلحظة",
      securePay: "دفع آمن بالبطاقات، مدى، Apple Pay، والدفع عند الاستلام",
    },
    hero: {
      badge: "منصة التجارة الإلكترونية العالمية المعتمدة — NOORMEXA GLOBAL",
      title: "عالم متكامل للتسوق الذكي وتجارة المستقبل",
      subtitle: "استكشف آلاف المنتجات المضمونة من أرقى المتاجر والعلامات التجارية الموثقة، أو افتح متجرك الخاص وابدأ البيع فوراً بأعلى معايير الأمان والسرعة والأرباح المباشرة.",
      searchPlaceholder: "ابحث عن منتج، متجر رسمي، علامة تجارية، أو كود خصم...",
      searchButton: "بحث فوري",
      quickTags: ["ساعات ذكية وفخمة", "عطور وبخور ملكي", "أجهزة وإلكترونيات", "أزياء وموضة", "مستلزمات المنزل"],
      ctaShop: "ابدأ التسوق الآن",
      ctaSell: "انضم كتاجر معتمد",
      ctaMarket: "تصفح السوق الشامل",
    },
    officialSection: {
      tag: "المتجر المعتمد الحصري",
      title: "متجر نورميكسا الرسمي المباشر",
      desc: "التشكيلة الرسمية المباشرة من المنصة بعمولة 0%، ضمان الجودة المعتمد، شحن فوري مع كونسيرج VIP على مدار الساعة.",
      visitStore: "زيارة المتجر الرسمي",
    },
    flashDeals: {
      badge: "عروض الفلاش الحصرية",
      title: "تخفيضات استثنائية لفترة محدودة",
      subtitle: "استفد من خصومات تصل إلى 50% على أكثر المنتجات طلباً قبل نفاد الكمية المحددة.",
      endsIn: "ينتهي العرض خلال:",
      hours: "ساعة",
      mins: "دقيقة",
      secs: "ثانية",
      claimed: "تم طلب",
      viewAll: "عرض كافة العروض",
    },
    brandsSection: {
      badge: "العلامات المعتمدة",
      title: "أشهر الماركات والمتاجر الموثقة",
      subtitle: "تسوق منتجات أصلية 100% مباشرة من الوكلاء المعتمدين والموزعين الرسميين.",
      viewAllBrands: "تصفح جميع الماركات",
    },
    categories: {
      badge: "أقسام السوق الشاملة",
      title: "تسوق حسب القسم المفضل",
      subtitle: "مجموعات شاملة ومختارة بعناية لتلبي كافة احتياجاتك اليومية وأحدث صيحات الموضة والتقنية.",
      viewCatalog: "استكشف كل الأقسام",
    },
    featuredProducts: {
      badge: "التشكيلة الأكثر مبيعاً",
      title: "أفضل المنتجات وأعلاها تقييماً",
      subtitle: "اخترنا لك نخبة من أفضل منتجات المتاجر المعتمدة ذات الجودة الاستثنائية وتقييمات العملاء العالية.",
      addToCart: "إضافة للسلة",
      added: "تمت الإضافة ✓",
      viewProduct: "تفاصيل المنتج",
    },
    couponsSection: {
      badge: "نادي التوفير والقسائم",
      title: "كوبونات خصم فورية ومكافآت كاش باك",
      subtitle: "انسخ كود الخصم بلمسة واحدة واستفد من توفير إضافي فوري عند إتمام عملية الشراء.",
      copyCode: "نسخ الكود",
      copied: "تم النسخ بنجاح! ✓",
      minSpendText: "للطلبات فوق",
    },
    b2bSection: {
      badge: "نورميكسا للأعمال والجملة",
      title: "حلول التجارة بالجملة والتوريد للشركات",
      subtitle: "استورد وباشر شراء الكميات الكبيرة بأسعار الجملة المباشرة مع فواتير ضريبية وشهادات مطابقة وشحن بحري وجوي سريع.",
      ctaQuote: "طلب عرض أسعار بالجملة (RFQ)",
      ctaExploreB2B: "تصفح كتالوج الجملة",
      features: [
        "أسعار جملة تنافسية مباشرة من المصانع",
        "شحن حاويات متكامل وتخليص جمركي موثق",
        "فواتير ضريبية إلكترونية معتمدة لكافة الدول",
        "تسهيلات دفع واعتمادات مستندية للشركات",
      ],
    },
    videoStoriesSection: {
      badge: "ريلز وتجارب المشترين",
      title: "فيديوهات فتح الصناديق وتقييمات حية",
      subtitle: "شاهد كيف تبدو المنتجات في الواقع عبر تجارب حقيقية موثقة من عملاء المنصة.",
      watchNow: "مشاهدة التقييم",
    },
    guaranteesSection: {
      badge: "ضمانات NOORMEXA الذهبية",
      title: "لماذا يفضل ملايين المشترين التسوق معنا؟",
      subtitle: "تجربة تسوق آمنة ومتكاملة تحميك في كل خطوة من التصفح حتى الاستلام وما بعد البيع.",
      items: [
        {
          title: "أصالة مضمونة 100%",
          desc: "جميع المتاجر تخضع للتحقق الصارم من السجل التجاري وجودة البضائع.",
          icon: ShieldCheck,
        },
        {
          title: "استرجاع مجاني وسهل",
          desc: "إمكانية إرجاع أو استبدال المنتج خلال 14 يوماً مع استرداد كامل المبلغ.",
          icon: RefreshCw,
        },
        {
          title: "شحن جوي سريع وتتبع حي",
          desc: "شراكات لوجستية مع كبرى شركات الشحن العالمية مع تتبع فوري مباشر.",
          icon: Truck,
        },
        {
          title: "أمان دفع إلكتروني متقدم",
          desc: "تشفير بنكي عالي المستوى وحماية كاملة لبيانات البطاقات وبوابات الدفع.",
          icon: CreditCard,
        },
        {
          title: "خدمة عملاء كونسيرج 24/7",
          desc: "فريق دعم فني متفرغ لمساعدتك في أي استفسار عبر المحادثة الحية والهاتف.",
          icon: HelpCircle,
        },
        {
          title: "أفضل سعر وتوفير حقيقي",
          desc: "عروض يومية وكوبونات مستمرة مع نقاط ولاء وكاش باك على كل طلب.",
          icon: Award,
        },
      ],
    },
    roles: {
      badge: "منظومة واحدة تجمع الجميع",
      title: "اختر بوابتك في NOORMEXA",
      subtitle: "صُممت المنصة لتلائم المتسوقين الباحثين عن التميز، والتجار والعلامات الطامحة للنمو العالمي وزيادة المبيعات.",
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
          title: "الشركاء والمسوقون بالعمولة",
          text: "انضم إلى برنامج التسويق بالعمولة واربح عمولات مجزية على كل عملية بيع تتم عبر روابطك.",
          cta: "انضم للشركاء",
          badge: "أرباح مستمرة",
          icon: Sparkles,
          href: "/marketplace",
        },
      ] as RoleCard[],
    },
    testimonials: {
      badge: "آراء وتجارب العملاء",
      title: "موثوق به من آلاف المتسوقين والتجار",
      subtitle: "شهادات حقيقية من عملائنا في المملكة العربية السعودية، الإمارات، مصر، الكويت، وكافة دول المنطقة.",
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
      freeShipping: "Free express shipping on qualifying orders",
      guarantee: "100% Genuine Certified & Quality Inspected",
      fastDelivery: "Express delivery & real-time GPS tracking",
      securePay: "Secure checkout via Cards, Apple Pay, Mada & COD",
    },
    hero: {
      badge: "CERTIFIED GLOBAL MULTI-VENDOR COMMERCE PLATFORM — NOORMEXA",
      title: "The Ultimate Ecosystem for Smart Commerce",
      subtitle: "Discover thousands of guaranteed products from verified flagship stores and authorized global brands, or launch your high-growth seller store with military-grade speed and secure payouts.",
      searchPlaceholder: "Search luxury watches, perfumes, electronics, fashion, or discount codes...",
      searchButton: "Instant Search",
      quickTags: ["Smartwatches", "Royal Oud", "Pro Audio", "Designer Fashion", "Smart Living"],
      ctaShop: "Shop Catalog Now",
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
      subtitle: "Save up to 50% on top trending luxury collections before stock runs out.",
      endsIn: "Offers end in:",
      hours: "hrs",
      mins: "mins",
      secs: "secs",
      claimed: "Claimed",
      viewAll: "Explore All Deals",
    },
    brandsSection: {
      badge: "Authorized Brands",
      title: "Top Verified Brands & Flagship Houses",
      subtitle: "Shop 100% original goods directly from authorized distributors and verified brand partners.",
      viewAllBrands: "Browse All Brands",
    },
    categories: {
      badge: "Curated Collections",
      title: "Shop by Signature Department",
      subtitle: "Meticulously crafted collections to match your discerning lifestyle and everyday tech needs.",
      viewCatalog: "Explore All Departments",
    },
    featuredProducts: {
      badge: "Trending Best Sellers",
      title: "Top-Rated Products & 5-Star Craftsmanship",
      subtitle: "Handpicked bestsellers from our highest-rated verified merchant partners.",
      addToCart: "Add to Cart",
      added: "Added to Cart ✓",
      viewProduct: "View Details",
    },
    couponsSection: {
      badge: "Smart Savings Club",
      title: "Instant Discount Coupons & Cashback",
      subtitle: "Copy any promo code with a single tap to unlock extra instant discounts at checkout.",
      copyCode: "Copy Code",
      copied: "Copied! ✓",
      minSpendText: "On orders above",
    },
    b2bSection: {
      badge: "NOORMEXA Wholesale & B2B",
      title: "Wholesale Sourcing & Enterprise Supply",
      subtitle: "Source bulk quantities directly at factory prices with electronic VAT invoices, compliance certificates, and express freight.",
      ctaQuote: "Request Bulk Quote (RFQ)",
      ctaExploreB2B: "Browse Wholesale Catalog",
      features: [
        "Direct factory wholesale pricing & bulk tier discounts",
        "Container logistics, freight forwarding & customs clearance",
        "Compliant tax invoices across all GCC and global markets",
        "Corporate trade credits & flexible escrow payment terms",
      ],
    },
    videoStoriesSection: {
      badge: "Customer Live Reels",
      title: "Unboxing Videos & Real Reviews",
      subtitle: "See how items look and perform in real life from authentic verified customer unboxings.",
      watchNow: "Watch Review",
    },
    guaranteesSection: {
      badge: "Golden Guarantees",
      title: "Why Millions of Discerning Shoppers Choose Us",
      subtitle: "A seamless, secure ecosystem protecting your purchase at every step from cart to doorstep.",
      items: [
        {
          title: "100% Authenticity Guaranteed",
          desc: "Every merchant undergoes rigorous KYC vetting and quality audits.",
          icon: ShieldCheck,
        },
        {
          title: "14-Day Free Returns",
          desc: "Hassle-free return and exchange policy with 100% money-back guarantee.",
          icon: RefreshCw,
        },
        {
          title: "Express Air Shipping",
          desc: "Priority logistics partnerships with real-time GPS tracking.",
          icon: Truck,
        },
        {
          title: "Bank-Grade Payment Security",
          desc: "End-to-end encrypted checkout supporting Cards, Apple Pay & Mada.",
          icon: CreditCard,
        },
        {
          title: "24/7 VIP Concierge Support",
          desc: "Dedicated multilingual customer success team ready around the clock.",
          icon: HelpCircle,
        },
        {
          title: "Best Price & Loyalty Rewards",
          desc: "Daily price matches, instant promo codes, and reward points on every order.",
          icon: Award,
        },
      ],
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
          title: "Affiliate & Growth Partners",
          text: "Join our high-paying affiliate network and earn recurring commissions on every referred order.",
          cta: "Join Partners",
          badge: "High Payouts",
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
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [selectedReelIndex, setSelectedReelIndex] = useState<number | null>(null);

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

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const DirectionIcon = isAr ? ArrowLeft : ArrowRight;

  // Curated Categories List with High-Resolution Visuals
  const categoriesList: CategoryCard[] = [
    {
      name: "إلكترونيات وهواتف ذكية",
      nameEn: "Smart Electronics & Tech",
      slug: "electronics",
      count: "128+ منتج",
      icon: Package,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "أزياء وكشمير فاخر",
      nameEn: "Haute Fashion & Apparel",
      slug: "fashion",
      count: "94+ منتج",
      icon: ShoppingBag,
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "عطور ملكية وبخور شرقي",
      nameEn: "Royal Perfumery & Oud",
      slug: "beauty",
      count: "67+ منتج",
      icon: Sparkles,
      image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "ساعات كرونوغراف ومجوهرات",
      nameEn: "Watches & Fine Jewelry",
      slug: "accessories",
      count: "52+ منتج",
      icon: Crown,
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "ديكور ومنزل حرفي",
      nameEn: "Artisan Home & Living",
      slug: "home",
      count: "81+ منتج",
      icon: Tag,
      image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=500&auto=format&fit=crop&q=80",
    },
  ];

  // Live Smart Coupons
  const smartCoupons: CouponItem[] = [
    {
      code: "NOOR10",
      discount: "10% خصم",
      titleAr: "خصم ترحيبي فوري للمتسوقين الجدد",
      titleEn: "Instant Welcome Discount",
      descAr: "يسري على جميع مشترياتك الأولى بدون حد أقصى للخصم",
      descEn: "Valid on all first-time purchases across the catalog",
      minSpend: "200 ج.م / 50 ر.س",
    },
    {
      code: "FREESHIP",
      discount: "شحن مجاني",
      titleAr: "قسيمة التوصيل الجوي السريع المجاني",
      titleEn: "Free Express Delivery Voucher",
      descAr: "شحن فوري لباب منزلك لجميع الطلبات في الشرق الأوسط",
      descEn: "Direct air freight dispatch to your doorstep",
      minSpend: "350 ج.م / 90 ر.س",
    },
    {
      code: "FLAGSHIP20",
      discount: "20% توفير",
      titleAr: "كوبون متجر نورميكسا الرسمي المباشر",
      titleEn: "NOORMEXA Flagship Special Coupon",
      descAr: "خصم إضافي خاص على تشكيلة متجر المنصة الحصرية",
      descEn: "Exclusive extra discount on Flagship Direct products",
      minSpend: "500 ج.م / 120 ر.س",
    },
  ];

  // Customer Video Unboxing Stories & Real Interactive Reels
  const videoStories: ReelStory[] = [
    {
      id: "v1",
      titleAr: "فتح صندوق ساعة الكرونوغراف الملكية وتجربة السوار الجلدي الفاخر",
      titleEn: "Unboxing the Royal Chronograph & Luxury Leather Strap",
      author: "سلطان العتيبي",
      authorCityAr: "الرياض، المملكة العربية السعودية",
      authorCityEn: "Riyadh, Saudi Arabia",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 5.0,
      orderNumber: "NRX-98214-KSA",
      commentAr: "الساعة وصلتني في تغليف ملكي فاخر جداً ومعها بطاقة الضمان والرقم التسلسلي المعتمد. الفولاذ المصقول والزجاج الياقوتي فائق الجودة والوزن رائع جداً. تجربة شراء فاخرة تستحق 5 نجوم.",
      commentEn: "The timepiece arrived in royal luxury presentation packaging complete with warranty certificate and serial stamp. The 316L steel and sapphire crystal feel ultra-premium.",
      views: "18.4K",
      initialLikes: 1420,
      videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
      posterImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
      durationText: "00:45",
      productId: "prod-chronograph-watch",
      productNameAr: "ساعة الكرونوغراف الفاخرة NOORMEXA Royal Sapphire",
      productNameEn: "NOORMEXA Royal Sapphire Chronograph Watch",
      productPrice: 6800,
      productOriginalPrice: 8500,
      productImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
      storeName: "TechCraft Global Innovations",
    },
    {
      id: "v2",
      titleAr: "تجربة عطر السلطان الفاخر وثبات الفوحان لأكثر من 36 ساعة",
      titleEn: "Royal Oud Longevity & Projection Real-World Test",
      author: "مروة الشامسي",
      authorCityAr: "دبي، الإمارات العربية المتحدة",
      authorCityEn: "Dubai, United Arab Emirates",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.9,
      orderNumber: "NRX-87412-UAE",
      commentAr: "رائحة العود المعتق مع قطرات الورد الطائفي والعنبر الأبيض خيالية وفوحان رهيب! الكل سألني عن العطر وثباته استمر على العباية لأكثر من 48 ساعة. التوصيل كان في أقل من 24 ساعة.",
      commentEn: "The aged Cambodian oud combined with white ambergris and Taif rose is simply mesmerizing. Sillage lasted over 48 hours. Incredible luxury fragrance.",
      views: "24.1K",
      initialLikes: 2180,
      videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      posterImage: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80",
      durationText: "00:52",
      productId: "prod-royal-oud-perfume",
      productNameAr: "عطر السلطان الملكي (Imperial Oud & Ambergris 100ml)",
      productNameEn: "Imperial Oud & Ambergris Eau de Parfum 100ml",
      productPrice: 2890,
      productOriginalPrice: 3600,
      productImage: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80",
      storeName: "Royal Oud & Perfumery",
    },
    {
      id: "v3",
      titleAr: "مراجعة سماعة Pro Wireless ANC مع ميزة عزل الضوضاء والشحن السريع",
      titleEn: "Pro Wireless ANC Studio Headphones Deep Dive",
      author: "أحمد منصور",
      authorCityAr: "القاهرة، جمهورية مصر العربية",
      authorCityEn: "Cairo, Egypt",
      authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      rating: 5.0,
      orderNumber: "NRX-76291-EGY",
      commentAr: "عزل الضوضاء ANC مبهر جداً في الشارع والمكتب، ونقاء الصوت وتجسيم البيز عالي جداً. البطارية جلست معايا أسبوع كامل بدون ما أحتاج أشحنها. خامات وسائد الأذن جلد وميموري فوم مريحة للغاية.",
      commentEn: "Studio sound quality with powerful active noise cancellation. Battery truly lasts 55 hours. Memory foam cushions are comfortable for long working hours.",
      views: "12.8K",
      initialLikes: 980,
      videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      posterImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      durationText: "00:38",
      productId: "prod-aurora-headphones",
      productNameAr: "سماعات الرأس اللاسلكية الاحترافية NOORMEXA Pro ANC",
      productNameEn: "NOORMEXA Pro Wireless ANC Studio Headphones",
      productPrice: 3450,
      productOriginalPrice: 4200,
      productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      storeName: "TechCraft Global Innovations",
    },
  ];

  // Official Store (Flagship)
  const officialStore = stores.find((s) => s.is_official) || stores[0];

  return (
    <main id="top" className="noormexa-main overflow-hidden">
      {/* Hero Interactive Stage */}
      <section className="relative py-8 md:py-16 border-b border-line bg-gradient-to-b from-surface via-surface-soft to-surface">
        <div className="noormexa-container grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left / Primary Text Column */}
          <div className="lg:col-span-6 space-y-6 text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-black shadow-xs">
              <Crown size={14} className="text-orange-500" />
              <span>{text.hero.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-[1.18]">
              {text.hero.title}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-muted max-w-xl leading-relaxed">
              {text.hero.subtitle}
            </p>

            {/* Interactive Live Search Bar (Amazon / Alibaba Style) */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
              <div className="flex items-center bg-surface border-2 border-line hover:border-orange-500/60 focus-within:border-orange-500 rounded-2xl p-1 sm:p-1.5 shadow-md transition-all">
                <div className="p-2 sm:p-2.5 text-muted shrink-0">
                  <Search size={18} className="text-orange-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={text.hero.searchPlaceholder}
                  className="w-full bg-transparent border-none text-foreground text-xs sm:text-sm font-medium focus:outline-hidden px-1 sm:px-2 placeholder:text-muted/60 min-w-0"
                />
                <button
                  type="submit"
                  className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs sm:text-sm shrink-0 shadow-sm transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>{text.hero.searchButton}</span>
                  <DirectionIcon size={13} className="shrink-0" />
                </button>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px]">
                <span className="text-muted font-bold">{isAr ? "شائع الآن:" : "Trending:"}</span>
                {text.hero.quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => router.push(`/marketplace?search=${encodeURIComponent(tag)}`)}
                    className="px-2.5 py-0.5 rounded-lg bg-surface-soft border border-line text-foreground/80 hover:border-orange-500/50 hover:text-foreground transition-all cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </form>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/marketplace"
                className="px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 !text-white text-xs sm:text-sm font-black shadow-md hover:shadow-orange-500/25 flex items-center gap-2 transition-all"
              >
                <ShoppingBag size={16} />
                <span>{text.hero.ctaShop}</span>
              </Link>

              <Link
                href="/seller/dashboard"
                className="px-5 py-3.5 rounded-2xl bg-surface border border-line hover:border-slate-400 text-foreground font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-xs"
              >
                <Store size={16} className="text-orange-500" />
                <span>{text.hero.ctaSell}</span>
              </Link>
            </div>
          </div>

          {/* Right / Visual Live Product Slider Column */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 w-full">
              <HeroImageSlider language={language} />

              {/* Floating Social Proof Pill - Positioned cleanly at the top of the image so it does not obstruct the bottom text */}
              <div className="absolute top-3.5 start-3.5 sm:top-4 sm:start-4 z-20 bg-surface/95 dark:bg-slate-900/95 backdrop-blur-md border border-line px-3 sm:px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 pointer-events-none">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-black shrink-0">
                  <Star size={16} className="fill-orange-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-foreground flex items-center gap-1.5 whitespace-nowrap">
                    <span dir="ltr">4.9 / 5.0</span>
                    <span className="text-orange-500">★</span>
                    <span className="text-[10px] text-muted font-normal">({isAr ? "تقييم عام" : "Score"})</span>
                  </div>
                  <div className="text-[10px] text-muted whitespace-nowrap font-medium">{isAr ? "أكثر من 120,000 عميل موثق" : "120k+ Verified Orders"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Official Flagship Store Spotlight Section (Fixed high contrast button) */}
      {officialStore && (
        <section id="official" className="py-8 md:py-12 border-b border-line bg-surface-soft/60 scroll-mt-28">
          <div className="noormexa-container">
            <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line hover:border-slate-300 dark:hover:border-slate-700 shadow-md relative overflow-hidden transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start sm:items-center gap-5">
                  {/* Official NOORMEXA Vector Logo Emblem */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-soft border border-line flex items-center justify-center p-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-xs">
                    <NoormexaEmblemSvg size={44} isDark={isDark} />
                  </div>

                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400 font-black text-[11px] border border-orange-500/20">
                      <Sparkles size={12} className="text-orange-500" />
                      <span>{text.officialSection.tag}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-foreground flex flex-wrap items-center gap-2">
                      <span>{isAr ? "متجر نورميكسا الرسمي" : "NOORMEXA Flagship Direct"}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200 bg-surface-soft px-2.5 py-0.5 rounded-lg border border-line" dir="ltr">
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
                    className="px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs sm:text-sm shadow-md hover:shadow-orange-500/20 flex items-center justify-center gap-2 whitespace-nowrap transition-all border border-orange-400/30"
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
      <section id="deals" className="py-10 md:py-16 border-b border-line bg-surface scroll-mt-28">
        <div className="noormexa-container space-y-8">
          {/* Section Header with Smooth Live Countdown Timer */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-line pb-6">
            <div className="space-y-1 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-black text-xs border border-red-500/20">
                <Flame size={14} className="fill-red-500 text-red-500 animate-bounce" />
                <span>{text.flashDeals.badge}</span>
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-foreground tracking-tight break-words">
                {text.flashDeals.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted">{text.flashDeals.subtitle}</p>
            </div>

            {/* Smooth Digital Animated Flip Timer */}
            <SmoothFlashTimer language={language} className="shrink-0" />
          </div>

          {/* Flash Deals Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((prod) => {
              const store = stores.find((s) => s.id === prod.store_id);
              const isAdded = addedProductId === prod.id;
              const isFav = wishlist.includes(prod.id);

              return (
                <div
                  key={prod.id}
                  className="group rounded-3xl bg-surface border border-line hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-square overflow-hidden bg-surface-soft shrink-0">
                    <img
                      src={prod.image_url || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80"}
                      alt={prod.name}
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Discount Badge */}
                    <div className="absolute top-3 start-3 px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-[11px] shadow-sm flex items-center gap-1">
                      <Percent size={11} />
                      <span>{isAr ? "خصم 35%" : "35% OFF"}</span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(prod.id)}
                      className={`absolute top-3 end-3 w-8 h-8 rounded-full border border-line flex items-center justify-center transition-all cursor-pointer ${
                        isFav ? "bg-red-500 text-white border-red-500" : "bg-surface/90 text-muted hover:text-red-500 backdrop-blur-xs"
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart size={14} className={isFav ? "fill-white" : ""} />
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      {/* Store Attribution */}
                      <div className="flex items-center gap-1.5 text-[11px] text-muted">
                        <Store size={12} className="text-orange-500 shrink-0" />
                        <span className="truncate font-bold text-foreground/80">{store?.name || "Official Store"}</span>
                        {store?.is_official && <Crown size={11} className="text-orange-500 shrink-0" />}
                      </div>

                      <Link href={`/product/${prod.id}`} className="block">
                        <h3 className="font-bold text-foreground text-sm line-clamp-2 min-h-[2.6rem] group-hover:text-orange-500 transition-colors leading-snug">
                          {prod.name}
                        </h3>
                      </Link>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-lg font-black text-foreground">{formatPrice(prod.price)}</span>
                        <span className="text-xs text-muted line-through">{formatPrice(prod.price * 1.35)}</span>
                      </div>
                    </div>

                    {/* Progress Bar & CTA */}
                    <div className="space-y-3 pt-2 border-t border-line/60">
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between text-muted font-bold">
                          <span>{text.flashDeals.claimed} 78%</span>
                          <span className="text-orange-600 dark:text-orange-400 font-black whitespace-nowrap">{isAr ? "متبقي 6 قطع فقط" : "6 left"}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-soft border border-line overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: "78%" }} />
                        </div>
                      </div>

                      {/* Add to Cart CTA (Amazon Style) */}
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(prod)}
                        className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                          isAdded
                            ? "bg-emerald-600 !text-white shadow-sm"
                            : "bg-orange-500 hover:bg-orange-600 !text-white shadow-sm"
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

      {/* 5. Authorized Global Brands Showcase */}
      <GlobalBrandsShowcase isAr={isAr} />

      {/* 6. Signature Categories Department Catalog */}
      <section id="categories" className="py-12 md:py-16 border-b border-line bg-surface scroll-mt-28">
        <div className="noormexa-container space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400 font-black text-xs border border-orange-500/20 mb-1">
                <Sparkles size={13} />
                <span>{text.categories.badge}</span>
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
                {text.categories.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted">{text.categories.subtitle}</p>
            </div>

            <Link
              href="/marketplace"
              className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{text.categories.viewCatalog}</span>
              <DirectionIcon size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {categoriesList.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/marketplace?category=${cat.slug}`}
                  className="group relative rounded-3xl overflow-hidden border border-line bg-surface hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-surface-soft">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 end-3 p-2 rounded-xl bg-surface/90 backdrop-blur-xs border border-line text-foreground">
                      <Icon size={16} />
                    </div>
                  </div>

                  <div className="p-4 space-y-1 text-center bg-surface">
                    <h3 className="font-bold text-foreground text-xs sm:text-sm group-hover:text-orange-500 transition-colors line-clamp-1">
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

      {/* 7. Smart Savings & Instant Coupons Club */}
      <section id="coupons" className="py-10 md:py-16 border-b border-line bg-surface-soft/60 scroll-mt-28">
        <div className="noormexa-container space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-500/20">
              <Gift size={14} />
              <span>{text.couponsSection.badge}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {text.couponsSection.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              {text.couponsSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {smartCoupons.map((coupon) => (
              <div
                key={coupon.code}
                className="p-6 rounded-3xl bg-surface border-2 border-dashed border-line hover:border-orange-500 transition-all space-y-4 shadow-xs relative flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-xs">
                      {coupon.discount}
                    </span>
                    <span className="text-[11px] text-muted font-medium">
                      {text.couponsSection.minSpendText} {coupon.minSpend}
                    </span>
                  </div>
                  <h3 className="font-black text-base text-foreground">
                    {isAr ? coupon.titleAr : coupon.titleEn}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {isAr ? coupon.descAr : coupon.descEn}
                  </p>
                </div>

                <div className="pt-4 border-t border-line/60 flex items-center justify-between gap-3">
                  <div className="font-mono font-black text-sm text-foreground bg-surface-soft px-3 py-2 rounded-xl border border-line tracking-wider">
                    {coupon.code}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCoupon(coupon.code)}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 !text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    {copiedCoupon === coupon.code ? (
                      <>
                        <Check size={14} />
                        <span>{text.couponsSection.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>{text.couponsSection.copyCode}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. B2B Wholesale & Enterprise Sourcing Hub */}
      <section id="b2b" className="py-12 md:py-20 border-b border-line bg-gradient-to-r from-slate-900 via-navy to-slate-900 text-white scroll-mt-28">
        <div className="noormexa-container grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-orange-400 text-xs font-black">
              <Building2 size={14} />
              <span>{text.b2bSection.badge}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {text.b2bSection.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {text.b2bSection.subtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {text.b2bSection.features.map((feat) => (
                <div key={feat} className="flex items-start gap-2 text-xs text-slate-200">
                  <Check size={15} className="text-orange-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/seller/dashboard"
                className="px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
              >
                <span>{text.b2bSection.ctaQuote}</span>
                <DirectionIcon size={14} />
              </Link>
              <Link
                href="/marketplace?category=wholesale"
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all"
              >
                <span>{text.b2bSection.ctaExploreB2B}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-black text-sm text-white">{isAr ? "نموذج طلب توريد فوري" : "Instant Sourcing Request"}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">24h RFQ SLA</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">{isAr ? "المنتج المطلوب أو الفئة" : "Product Category"}</label>
                  <input
                    type="text"
                    readOnly
                    value={isAr ? "إلكترونيات أو أزياء أو عطور بكميات تجارية" : "Consumer Electronics / Bulk Fashion"}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white/90 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold">{isAr ? "الكمية التقديرية" : "Quantity"}</label>
                    <input
                      type="text"
                      readOnly
                      value={isAr ? "+500 قطعة" : "500+ Units"}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white/90 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold">{isAr ? "بلد التسليم" : "Destination"}</label>
                    <input
                      type="text"
                      readOnly
                      value={isAr ? "السعودية / مصر / الإمارات" : "GCC / Egypt"}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white/90 text-xs"
                    />
                  </div>
                </div>
                <Link
                  href="/seller/dashboard"
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs flex items-center justify-center gap-1.5 mt-2 transition-all block text-center"
                >
                  <Building2 size={14} />
                  <span>{isAr ? "تقديم طلب توريد رسمي" : "Submit Enterprise Inquiry"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Video Stories & Customer Unboxings (Interactive Video Reels) */}
      <section id="reels" className="py-12 md:py-16 border-b border-line bg-surface scroll-mt-28">
        <div className="noormexa-container space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-xs border border-purple-500/20">
              <Video size={14} />
              <span>{text.videoStoriesSection.badge}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">{text.videoStoriesSection.title}</h2>
            <p className="text-xs sm:text-sm text-muted">{text.videoStoriesSection.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videoStories.map((story, idx) => (
              <div
                key={story.id}
                onClick={() => setSelectedReelIndex(idx)}
                className="group rounded-3xl overflow-hidden bg-surface border border-line hover:border-orange-500/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <img
                    src={story.posterImage}
                    alt={story.productNameAr}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform border-2 border-white/40">
                      <Play size={22} className="fill-white ms-0.5" />
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 end-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-black flex items-center gap-1 border border-white/10">
                    <Star size={12} className="fill-orange-400 text-orange-400" />
                    <span dir="ltr">{story.rating.toFixed(1)}</span>
                  </div>

                  {/* Author & City */}
                  <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-white text-xs font-bold">
                    <div className="flex items-center gap-2 truncate">
                      <img
                        src={story.authorAvatar}
                        alt={story.author}
                        className="w-6 h-6 rounded-full object-cover border border-white/40 shrink-0"
                      />
                      <span className="truncate">{story.author}</span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-mono bg-black/40 px-2 py-0.5 rounded-md">
                      {story.views} {isAr ? "مشاهدة" : "views"}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3 bg-surface">
                  <h3 className="font-black text-sm text-foreground line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">
                    {isAr ? story.titleAr : story.titleEn}
                  </h3>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-line">
                    <span className="font-black text-orange-600 dark:text-orange-400 text-sm">
                      {formatPrice(story.productPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReelIndex(idx);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-600 dark:text-orange-400 hover:!text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Play size={12} className="fill-current" />
                      <span>{isAr ? "تشغيل الفيديو والتقييم" : "Watch Video Review"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. The 6 Core Guarantees */}
      <section className="py-12 md:py-16 border-b border-line bg-surface-soft/60">
        <div className="noormexa-container space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400 font-black text-xs border border-orange-500/20">
              <ShieldCheck size={14} />
              <span>{text.guaranteesSection.badge}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">{text.guaranteesSection.title}</h2>
            <p className="text-xs sm:text-sm text-muted">{text.guaranteesSection.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {text.guaranteesSection.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-3xl bg-surface border border-line space-y-3 hover:border-orange-500/40 hover:shadow-md transition-all shadow-xs"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-black text-base text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted leading-relaxed font-medium">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. Multi-Vendor Platform Ecosystem (Choose Your Role) */}
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
                  className="p-6 rounded-3xl bg-surface-soft border border-line hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
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
                    className="w-full py-2.5 rounded-xl bg-surface border border-line hover:bg-orange-500 hover:!text-white text-foreground font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
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

      {/* 12. Platform Statistics & Proof of Scale */}
      <section className="py-12 md:py-16 border-b border-line bg-gradient-to-r from-slate-900 via-navy to-slate-900 text-white">
        <div className="noormexa-container space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-black text-orange-400 tracking-widest uppercase">{text.stats.badge}</span>
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
                  <div className="w-10 h-10 mx-auto rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-orange-400 tracking-tight">{stat.value}</div>
                  <div className="text-xs sm:text-sm font-bold text-white">{stat.label}</div>
                  <div className="text-[10px] text-white/60">{stat.sublabel}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 13. Verified Testimonials & Customer Trust */}
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
                  <div className="flex items-center gap-1 text-orange-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={15} className="fill-orange-500" />
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

      {/* 13.5 NOORMEXA Global Native App Showcase & Installation */}
      <section className="py-12 md:py-20 border-b border-line bg-gradient-to-br from-slate-950 via-slate-900 to-navy text-white relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 end-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="noormexa-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-black">
                <Smartphone size={14} />
                <span>{isAr ? "برنامج عالمي للموبايل والكمبيوتر" : "Global Desktop & Mobile App"}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {isAr
                  ? "حمّل تطبيق NOORMEXA الرسمي واستمتع بتجربة تسوق عالمية فائقة السلاسة"
                  : "Install NOORMEXA Official App for a Fluid Global Shopping Experience"}
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-medium">
                {isAr
                  ? "ثبّت التطبيق مباشرة على جهاز الكمبيوتر (Windows/Mac) أو هاتفك الذكي (Android/iPhone) بنقرة واحدة بدون متجر تطبيقات، واستمتع بتصفح فائق السرعة، إشعارات تتبع الشحنات، وكوبونات حصرية."
                  : "Install NOORMEXA directly on your Desktop (Windows/Mac) or Smartphone (Android/iOS) with a single click. Enjoy blazing fast performance, instant order updates, and exclusive app perks."}
              </p>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">
                      {isAr ? "سرعة إطلاق فورية" : "Instant Launch"}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? "يعمل كتطبيق مستقل خفيف بدون استهلاك ذاكرة" : "Lightweight standalone app with zero bloat"}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Laptop size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">
                      {isAr ? "تطبيق كمبيوتر وموبايل" : "Cross-Platform"}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? "أيقونة رسمية على سطح المكتب وشاشة هاتفك" : "Desktop & home screen icon for fast access"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={openPwaInstallModal}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 !text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/30 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  <Download size={18} className="animate-bounce stroke-[2.5]" />
                  <span>{isAr ? "تثبيت تطبيق NOORMEXA الآن" : "Install NOORMEXA App"}</span>
                </button>

                <Link
                  href="/marketplace"
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs sm:text-sm transition-all"
                >
                  {isAr ? "متابعة التصفح في المتصفح" : "Browse in Browser"}
                </Link>
              </div>
            </div>

            {/* Right Visual Card / App Mockup Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-3xl bg-slate-900/90 border border-white/15 p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                {/* Floating emblem */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/15 flex items-center justify-center text-white shadow-md shrink-0 p-2">
                    <NoormexaEmblemSvg size={30} isDark={true} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">NOORMEXA App</h3>
                    <p className="text-xs text-orange-400 font-bold">Global Marketplace</p>
                    <span className="text-[10px] text-slate-400">الإصدار 2.4.0 • مجاني 100%</span>
                  </div>
                </div>

                {/* Mock UI list */}
                <div className="py-4 space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-300">⚡ تجربة التصفح المباشر:</span>
                    <span className="text-emerald-400 font-bold">سلسة 60fps</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-300">📦 إشعارات الشحن:</span>
                    <span className="text-orange-400 font-bold">فورية</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-300">📱 الأجهزة المدعومة:</span>
                    <span className="text-white font-bold">كل المنصات</span>
                  </div>
                </div>

                {/* Quick install trigger */}
                <button
                  type="button"
                  onClick={openPwaInstallModal}
                  className="w-full py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs text-center flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
                >
                  <Download size={15} className="text-orange-600 stroke-[2.5]" />
                  <span>{isAr ? "بدء التثبيت التلقائي بنقرة واحدة" : "1-Click Direct Install"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 14. Merchant Subscription Plans */}
      <section id="plans" className="py-12 md:py-20 border-b border-line bg-surface-soft/60">
        <div className="noormexa-container space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400 font-black text-xs border border-orange-500/20">
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
                    ? "bg-surface border-2 border-orange-500 shadow-xl relative scale-105"
                    : "bg-surface border border-line shadow-sm hover:border-slate-300"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-orange-500 text-white text-[11px] font-black shadow-md flex items-center gap-1">
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
                      ? "bg-orange-500 hover:bg-orange-600 !text-white shadow-md"
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

      {/* 15. Interactive Frequently Asked Questions */}
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
                className="group p-5 rounded-2xl bg-surface-soft border border-line hover:border-slate-300 dark:hover:border-slate-700 transition-all select-none"
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

      {/* Interactive Reels Video Modal */}
      <ReelsVideoModal
        isOpen={selectedReelIndex !== null}
        onClose={() => setSelectedReelIndex(null)}
        initialIndex={selectedReelIndex || 0}
        reels={videoStories}
        language={language}
      />
    </main>
  );
}
