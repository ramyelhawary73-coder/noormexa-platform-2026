"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Star,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  X,
  CheckCircle2,
  RotateCcw,
  Zap,
  MessageCircle,
  Send,
  Check,
  Clock,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import type { Product } from "@/types/marketplace";

export type BrandSection = {
  id: string;
  nameAr: string;
  nameEn: string;
};

export type GlobalBrand = {
  id: string;
  name: string;
  nameAr: string;
  category: "all" | "tech" | "luxury" | "watches" | "perfumes" | "sports";
  categoryAr: string;
  categoryEn: string;
  originAr: string;
  originEn: string;
  flag: string;
  taglineAr: string;
  taglineEn: string;
  descriptionAr: string;
  descriptionEn: string;
  rating: number;
  productsCount: string;
  glowColor: string;
  badgeTheme: string;
  logoType: string;
  sections: BrandSection[];
};

export const GLOBAL_BRANDS: GlobalBrand[] = [
  {
    id: "apple",
    name: "Apple",
    nameAr: "أبل",
    category: "tech",
    categoryAr: "إلكترونيات وهواتف ذكية",
    categoryEn: "Tech & Smart Devices",
    originAr: "الولايات المتحدة",
    originEn: "USA",
    flag: "🇺🇸",
    taglineAr: "أجهزة iPhone, Mac, iPad و Apple Watch الأصلية بضمان رسمي معتمد",
    taglineEn: "Authentic iPhone, Mac, iPad & Apple Watch with certified warranty",
    descriptionAr: "المتجر الرسمي لمنتجات Apple الأصلية. جميع الأجهزة برقم تسلسلي موثق، ضمان الوكيل لمدة عامين، وتوصيل فوري مع تغليف آمن.",
    descriptionEn: "Official authorized catalog for genuine Apple devices with serial verification and 2-year warranty.",
    rating: 4.9,
    productsCount: "42+ منتج",
    glowColor: "group-hover:shadow-slate-400/30 dark:group-hover:shadow-white/20",
    badgeTheme: "titanium",
    logoType: "apple",
    sections: [
      { id: "all", nameAr: "جميع الأجهزة", nameEn: "All Devices" },
      { id: "iphone", nameAr: "سلسلة iPhone 16 Pro", nameEn: "iPhone Series" },
      { id: "mac", nameAr: "أجهزة Mac & iPad", nameEn: "Mac & iPad" },
      { id: "watch", nameAr: "ساعات Apple Watch", nameEn: "Apple Watch" },
      { id: "airpods", nameAr: "صوتيات AirPods", nameEn: "AirPods Audio" },
    ],
  },
  {
    id: "nike",
    name: "Nike",
    nameAr: "نايكي",
    category: "sports",
    categoryAr: "أحذية وملابس رياضية",
    categoryEn: "Sports & Footwear",
    originAr: "الولايات المتحدة",
    originEn: "USA",
    flag: "🇺🇸",
    taglineAr: "أحدث إصدارات أحذية Air Jordan, Dunk والملابس الرياضية الأصلية",
    taglineEn: "Latest authentic Air Jordan, Dunk & Pro athletic apparel",
    descriptionAr: "المتجر الرسمي لعلامة Nike العالمية. أحدث إصدارات الأحذية الرياضية ومجموعات التدريب الأصلية 100% مع ضمان المقاس والاستبدال.",
    descriptionEn: "Authorized Nike flagship collection featuring verified original footwear, Air Jordan and performance apparel.",
    rating: 4.9,
    productsCount: "58+ منتج",
    glowColor: "group-hover:shadow-orange-500/30",
    badgeTheme: "crimson",
    logoType: "nike",
    sections: [
      { id: "all", nameAr: "جميع المنتجات", nameEn: "All Products" },
      { id: "jordan", nameAr: "سلسلة Air Jordan", nameEn: "Air Jordan" },
      { id: "running", nameAr: "أحذية الجري والتدريب", nameEn: "Running Shoes" },
      { id: "apparel", nameAr: "الملابس الرياضية", nameEn: "Sportswear" },
    ],
  },
  {
    id: "rolex",
    name: "Rolex",
    nameAr: "رولكس",
    category: "watches",
    categoryAr: "ساعات سويسرية فاخرة",
    categoryEn: "Swiss Luxury Watches",
    originAr: "سويسرا",
    originEn: "Switzerland",
    flag: "🇨🇭",
    taglineAr: "ساعات كرونوغراف ميكانيكية بشهادات أرقام تسلسلية موثقة دولياً",
    taglineEn: "Certified chronometers with verified international serial certificates",
    descriptionAr: "مجموعة ساعات Rolex السويسرية الفاخرة. Submariner, Daytona, Datejust مع شهادات المطابقة والعلبة الأصلية والضمان السويسري الشامل.",
    descriptionEn: "Exquisite collection of verified Rolex timepieces with original box, serial papers, and warranty.",
    rating: 5.0,
    productsCount: "24+ ساعة",
    glowColor: "group-hover:shadow-emerald-500/30",
    badgeTheme: "gold",
    logoType: "rolex",
    sections: [
      { id: "all", nameAr: "جميع الساعات", nameEn: "All Watches" },
      { id: "submariner", nameAr: "Submariner غواص", nameEn: "Submariner" },
      { id: "daytona", nameAr: "Daytona كرونوغراف", nameEn: "Daytona" },
      { id: "datejust", nameAr: "Datejust كلاسيك", nameEn: "Datejust" },
    ],
  },
  {
    id: "dior",
    name: "Dior",
    nameAr: "ديور",
    category: "perfumes",
    categoryAr: "عطور وأزياء راقية",
    categoryEn: "Haute Couture & Fragrances",
    originAr: "فرنسا",
    originEn: "France",
    flag: "🇫🇷",
    taglineAr: "عطور Sauvage ومجموعات التجميل والأزياء الباريسية الفاخرة",
    taglineEn: "Sauvage fragrances, couture collections and beauty essentials",
    descriptionAr: "العطور الباريسية الفاخرة ومنتجات Dior الأصلية 100%. Sauvage, Miss Dior, مع حقائب الجلد والإكسسوارات المعتمدة.",
    descriptionEn: "Authentic Dior perfumes and luxury leather accessories directly shipped in signature luxury packaging.",
    rating: 4.9,
    productsCount: "36+ منتج",
    glowColor: "group-hover:shadow-amber-400/30",
    badgeTheme: "diorGold",
    logoType: "dior",
    sections: [
      { id: "all", nameAr: "جميع المعروضات", nameEn: "All Items" },
      { id: "sauvage", nameAr: "عطور Sauvage الرجالية", nameEn: "Sauvage Men" },
      { id: "miss-dior", nameAr: "عطور Miss Dior النسائية", nameEn: "Miss Dior" },
      { id: "bags", nameAr: "حقائب وإكسسوارات", nameEn: "Bags & Couture" },
    ],
  },
  {
    id: "samsung",
    name: "Samsung",
    nameAr: "سامسونج",
    category: "tech",
    categoryAr: "شاشات وهواتف ذكية",
    categoryEn: "Smartphones & Displays",
    originAr: "كوريا الجنوبية",
    originEn: "S. Korea",
    flag: "🇰🇷",
    taglineAr: "سلسلة Galaxy S24 Ultra وشاشات Neo QLED 8K المعززة بالذكاء الاصطناعي",
    taglineEn: "Galaxy S24 Ultra and AI-powered Neo QLED 8K Displays",
    descriptionAr: "أحدث أجهزة سامسونج الأصلية بالضمان المحلي المعتمد لسنتين. هواتف Galaxy الرائدة، شاشات التلفاز الذكية، وساعات Galaxy Watch.",
    descriptionEn: "Official Samsung store featuring Galaxy flagship phones, tablets, smart TVs and wearables.",
    rating: 4.8,
    productsCount: "49+ منتج",
    glowColor: "group-hover:shadow-blue-500/30",
    badgeTheme: "samsungBlue",
    logoType: "samsung",
    sections: [
      { id: "all", nameAr: "جميع الأجهزة", nameEn: "All Electronics" },
      { id: "ultra", nameAr: "Galaxy S24 Ultra", nameEn: "Galaxy Ultra" },
      { id: "fold", nameAr: "Galaxy Z Fold / Flip", nameEn: "Z Fold & Flip" },
      { id: "screens", nameAr: "شاشات Neo QLED", nameEn: "Smart Screens" },
    ],
  },
  {
    id: "sony",
    name: "Sony",
    nameAr: "سوني",
    category: "tech",
    categoryAr: "صوتيات وكاميرات سينمائية",
    categoryEn: "Audio, Cameras & Gaming",
    originAr: "اليابان",
    originEn: "Japan",
    flag: "🇯🇵",
    taglineAr: "سماعات عزل الضوضاء WH-1000XM5 وكاميرات Alpha وأجهزة PlayStation",
    taglineEn: "WH-1000XM5 ANC headphones, Alpha cameras and PlayStation gear",
    descriptionAr: "المتجر الياباني الأصلي لسوني: صوتيات Hi-Res الاحترافية، كاميرات التصوير السينمائي، وأجهزة الألعاب الأصلية بضمان الوكيل.",
    descriptionEn: "Authorized Sony dealer for studio headphones, mirrorless Alpha cameras, and PlayStation accessories.",
    rating: 4.9,
    productsCount: "31+ منتج",
    glowColor: "group-hover:shadow-indigo-500/25",
    badgeTheme: "sonySilver",
    logoType: "sony",
    sections: [
      { id: "all", nameAr: "جميع الأجهزة", nameEn: "All Sony Gear" },
      { id: "headphones", nameAr: "سماعات 1000XM5", nameEn: "ANC Headphones" },
      { id: "alpha", nameAr: "كاميرات Alpha الاحترافية", nameEn: "Alpha Cameras" },
      { id: "ps5", nameAr: "منظومة PlayStation", nameEn: "PlayStation" },
    ],
  },
  {
    id: "chanel",
    name: "Chanel",
    nameAr: "شانيل",
    category: "luxury",
    categoryAr: "أزياء وعطور فاخرة",
    categoryEn: "Luxury Perfumes & Fashion",
    originAr: "فرنسا",
    originEn: "France",
    flag: "🇫🇷",
    taglineAr: "عطور Bleu de Chanel, N°5 وحقائب الجلد الكلاسيكية الفاخرة",
    taglineEn: "Bleu de Chanel, N°5 and iconic quilted leather handbags",
    descriptionAr: "الدار الباريسية العريقة شانيل. عطور نادرة ومجموعات التجميل وحقائب الجلد الإيطالي المبطن الأصلية مع شهادة الفحص.",
    descriptionEn: "Pure luxury French perfumery and handcrafted leather goods from Chanel Paris.",
    rating: 5.0,
    productsCount: "29+ منتج",
    glowColor: "group-hover:shadow-slate-400/25",
    badgeTheme: "chanelNoir",
    logoType: "chanel",
    sections: [
      { id: "all", nameAr: "جميع المنتجات", nameEn: "All Chanel" },
      { id: "bleu", nameAr: "عطور Bleu de Chanel", nameEn: "Bleu de Chanel" },
      { id: "no5", nameAr: "عطور N°5 الأيقونية", nameEn: "Chanel No 5" },
      { id: "bags", nameAr: "حقائب كلاسيكية مبطنة", nameEn: "Classic Bags" },
    ],
  },
  {
    id: "adidas",
    name: "Adidas",
    nameAr: "أديداس",
    category: "sports",
    categoryAr: "أحذية وملابس رياضية",
    categoryEn: "Sportswear & Footwear",
    originAr: "ألمانيا",
    originEn: "Germany",
    flag: "🇩🇪",
    taglineAr: "سلاسل أحذية Samba, Gazelle وتشكيلات الأداء الرياضي المتطور",
    taglineEn: "Samba, Gazelle, Ultraboost and high-performance training gear",
    descriptionAr: "المتجر الرسمي لعلامة Adidas الألمانية. أحذية أوريجينالز الكلاسيكية ومجموعات الجري والملابس الأصلية 100%.",
    descriptionEn: "Authentic Adidas catalog featuring Samba OG, Gazelle, Ultraboost and official club jerseys.",
    rating: 4.8,
    productsCount: "54+ منتج",
    glowColor: "group-hover:shadow-slate-500/25",
    badgeTheme: "adidasSport",
    logoType: "adidas",
    sections: [
      { id: "all", nameAr: "جميع التشكيلات", nameEn: "All Adidas" },
      { id: "samba", nameAr: "أحذية Samba & Gazelle", nameEn: "Samba & Gazelle" },
      { id: "ultraboost", nameAr: "أحذية Ultraboost للجري", nameEn: "Ultraboost" },
      { id: "apparel", nameAr: "ملابس التدريب الرسمية", nameEn: "Activewear" },
    ],
  },
  {
    id: "gucci",
    name: "Gucci",
    nameAr: "غوتشي",
    category: "luxury",
    categoryAr: "منتجات جلدية وإكسسوارات",
    categoryEn: "Italian Leather & Luxury",
    originAr: "إيطاليا",
    originEn: "Italy",
    flag: "🇮🇹",
    taglineAr: "أفخر الأحزمة الجلدية الإيطالية والنظارات الشمسية الموثقة",
    taglineEn: "Italian leather goods, double G belts & luxury eyewear",
    descriptionAr: "إبداع الدار الإيطالية فلورنسا. حقائب وأحزمة الجلد الإيطالي الأصلي ونظارات الشمس الفاخرة مع بطاقات الأصالة.",
    descriptionEn: "Handcrafted Italian luxury goods from Gucci with verified authenticity serial codes.",
    rating: 4.9,
    productsCount: "33+ منتج",
    glowColor: "group-hover:shadow-amber-600/30",
    badgeTheme: "gucciGold",
    logoType: "gucci",
    sections: [
      { id: "all", nameAr: "جميع القطع", nameEn: "All Gucci" },
      { id: "bags", nameAr: "حقائب GG Marmont", nameEn: "GG Bags" },
      { id: "belts", nameAr: "أحزمة الجلد الإيطالي", nameEn: "Leather Belts" },
      { id: "eyewear", nameAr: "نظارات شمسية فاخرة", nameEn: "Eyewear" },
    ],
  },
  {
    id: "louis-vuitton",
    name: "Louis Vuitton",
    nameAr: "لويس فيتون",
    category: "luxury",
    categoryAr: "حقائب وإكسسوارات فاخرة",
    categoryEn: "Luxury Leather & Trunks",
    originAr: "فرنسا",
    originEn: "France",
    flag: "🇫🇷",
    taglineAr: "المونوغرام الفرنسي الأصلي والحقائب وحقائب السفر الفاخرة المعتمدة",
    taglineEn: "Authentic Parisian Monogram trunks, wallets & travel goods",
    descriptionAr: "التميز الباريسي الخالد من Louis Vuitton. حقائب Neverfull وحقائب السفر والمحافظ الجلدية المصنوعة يدوياً.",
    descriptionEn: "Authentic Louis Vuitton monogram bags and travel accessories with verified factory stamps.",
    rating: 5.0,
    productsCount: "22+ منتج",
    glowColor: "group-hover:shadow-amber-700/30",
    badgeTheme: "lvBronze",
    logoType: "lv",
    sections: [
      { id: "all", nameAr: "جميع المعروضات", nameEn: "All LV" },
      { id: "neverfull", nameAr: "حقائب Neverfull & Speedy", nameEn: "Handbags" },
      { id: "travel", nameAr: "حقائب السفر Horizon", nameEn: "Travel Luggage" },
      { id: "wallets", nameAr: "محافظ وإكسسوارات", nameEn: "Wallets & Small Goods" },
    ],
  },
  {
    id: "dyson",
    name: "Dyson",
    nameAr: "دايسون",
    category: "tech",
    categoryAr: "أجهزة تصفيف وهندسة منزلية",
    categoryEn: "Hair Care & Smart Home",
    originAr: "المملكة المتحدة",
    originEn: "United Kingdom",
    flag: "🇬🇧",
    taglineAr: "مصففات الشعر الهوائية Airwrap ومكانس الذكاء الاصطناعي اللاسلكية",
    taglineEn: "Airwrap multi-stylers, Supersonic dryers and laser cordless vacuums",
    descriptionAr: "هندسة Dyson البريطانية الفائقة. مصففات Airwrap الذكية، مجففات Supersonic، ومكانس V15 بضمان معتمد لمدة سنتين.",
    descriptionEn: "Pioneering engineering from Dyson with 2-year manufacturer warranty on all hair care and home devices.",
    rating: 4.9,
    productsCount: "19+ منتج",
    glowColor: "group-hover:shadow-fuchsia-500/30",
    badgeTheme: "dysonMagenta",
    logoType: "dyson",
    sections: [
      { id: "all", nameAr: "جميع الأجهزة", nameEn: "All Dyson" },
      { id: "airwrap", nameAr: "مصفف Airwrap Complete", nameEn: "Airwrap Stylers" },
      { id: "supersonic", nameAr: "مجفف Supersonic", nameEn: "Hair Dryers" },
      { id: "vacuum", nameAr: "مكانس V15 اللاسلكية", nameEn: "Cordless Vacuums" },
    ],
  },
  {
    id: "zara",
    name: "ZARA",
    nameAr: "زارا",
    category: "luxury",
    categoryAr: "أزياء وصيحات الموضة",
    categoryEn: "Contemporary Apparel",
    originAr: "إسبانيا",
    originEn: "Spain",
    flag: "🇪🇸",
    taglineAr: "أحدث خطوط الموضة الأوروبية العصرية للرجال والنساء",
    taglineEn: "Latest contemporary European collections and daily drops",
    descriptionAr: "أحدث تشكيلات دار ZARA الإسبانية. سترات البليزر، القمصان الكتانية، الفساتين الراقية، والأحذية الجلدية الأصلية.",
    descriptionEn: "Contemporary fashion and high-end essentials from Spain's premier fashion house.",
    rating: 4.8,
    productsCount: "67+ منتج",
    glowColor: "group-hover:shadow-slate-400/25",
    badgeTheme: "zaraChrome",
    logoType: "zara",
    sections: [
      { id: "all", nameAr: "جميع التشكيلات", nameEn: "All ZARA" },
      { id: "men", nameAr: "أزياء رجالية وبليزر", nameEn: "Men's Collection" },
      { id: "women", nameAr: "أزياء نسائية وفساتين", nameEn: "Women's Collection" },
      { id: "footwear", nameAr: "أحذية وحقائب جلدية", nameEn: "Shoes & Bags" },
    ],
  },
];

// 100% Vector Official Brand Badges & Logos with Razor-Sharp Precision & Luxury Styling
export function BrandVectorLogo({ brandId }: { brandId: string; theme?: string }) {
  switch (brandId) {
    case "apple":
      return (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#1c1d21] via-[#111215] to-[#08080a] border border-neutral-700/60 flex items-center justify-center relative overflow-hidden shadow-md group-hover:border-slate-400/60 transition-colors">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.25),transparent_65%)] pointer-events-none" />
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)] relative z-10" fill="currentColor">
            {/* Apple Official Vector Path */}
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.98c.61-.75 1.04-1.8 1.01-2.98-1.01.04-2.22.68-2.88 1.46-.57.67-.99 1.74-.95 2.91 1.13.09 2.21-.64 2.82-1.39z" />
          </svg>
        </div>
      );

    case "nike":
      return (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#1c1d21] via-[#111215] to-[#08080a] border border-neutral-700/60 flex items-center justify-center relative overflow-hidden shadow-md group-hover:border-orange-500/60 transition-colors">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.22),transparent_65%)] pointer-events-none" />
          <svg viewBox="0 0 100 40" className="w-18 h-8 text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.35)] relative z-10" fill="currentColor">
            {/* Nike Official Iconic Swoosh */}
            <path d="M96 2.5C78.5 13.8 55.2 26.2 29.5 32.5 16.8 35.7 7.4 34.3 3.2 29.3-1.1 24.3.7 16.7 6.7 9c.7-.9 1.6-.6 1.2.3-3.7 7-3.2 12.8.8 16.5 4.3 3.9 12.7 3.5 24.5-.2C55.4 18.7 78.7 7.4 94.2-.8c2.4-1.3 4.2 1.1 1.8 3.3z" />
          </svg>
        </div>
      );

    case "rolex":
      return (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#004d26] via-[#00381b] to-[#002010] border border-emerald-500/40 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(253,224,71,0.2),transparent_70%)] pointer-events-none" />
          <svg viewBox="0 0 100 45" className="w-14 h-7 relative z-10">
            <defs>
              <linearGradient id="rolexGoldGradCard" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            <circle cx="10" cy="10" r="3.5" fill="url(#rolexGoldGradCard)" />
            <circle cx="30" cy="4" r="4" fill="url(#rolexGoldGradCard)" />
            <circle cx="50" cy="2" r="4.5" fill="url(#rolexGoldGradCard)" />
            <circle cx="70" cy="4" r="4" fill="url(#rolexGoldGradCard)" />
            <circle cx="90" cy="10" r="3.5" fill="url(#rolexGoldGradCard)" />
            <path d="M10 14 L20 38 L30 38 L30 8 L40 38 L60 38 L50 6 L60 38 L70 8 L70 38 L80 38 L90 14 L82 42 L18 42 Z" fill="url(#rolexGoldGradCard)" />
            <rect x="18" y="42" width="64" height="4" rx="2" fill="url(#rolexGoldGradCard)" />
          </svg>
          <span className="text-[10px] font-serif font-black tracking-[0.35em] text-[#FDE047] drop-shadow-xs relative z-10 mt-0.5">
            ROLEX
          </span>
        </div>
      );

    case "samsung":
      return (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#034EA2] via-[#023c7d] to-[#00224d] border border-blue-400/40 flex items-center justify-center relative overflow-hidden shadow-md px-2">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.25),transparent_60%)] pointer-events-none" />
          <span className="text-xl sm:text-2xl font-sans font-black tracking-[0.16em] text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)] relative z-10 select-none">
            SAMSUNG
          </span>
        </div>
      );

    case "sony":
      return (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-slate-700/60 flex items-center justify-center relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),transparent_60%)] pointer-events-none" />
          <span className="text-2xl font-serif font-black tracking-[0.25em] text-white drop-shadow-sm relative z-10 select-none">
            SONY
          </span>
        </div>
      );

    case "dior":
      return (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-stone-900 via-neutral-950 to-black border border-stone-700/60 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(253,230,138,0.15),transparent_70%)] pointer-events-none" />
          <span className="text-2xl font-serif font-bold tracking-[0.2em] text-white relative z-10 select-none">
            Dior
          </span>
          <span className="text-[8px] font-sans font-black tracking-[0.45em] text-amber-200/90 uppercase -mt-0.5 relative z-10">
            PARIS
          </span>
        </div>
      );

    case "chanel":
      return (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border border-zinc-700/60 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),transparent_60%)] pointer-events-none" />
          <svg viewBox="0 0 110 65" className="w-14 h-8 text-white drop-shadow-sm relative z-10" fill="currentColor">
            <g transform="translate(55, 23)">
              <path d="M-6 -14 C1 -14 7 -10 10 -4 L5 -1 C3 -4 0 -7 -6 -7 C-14 -7 -19 -1 -19 6 C-19 13 -14 19 -6 19 C0 19 3 16 5 13 L10 16 C7 22 1 26 -6 26 C-17 26 -26 17 -26 6 C-26 -5 -17 -14 -6 -14 Z" />
              <path d="M6 -14 C13 -14 19 -10 22 -4 L17 -1 C15 -4 12 -7 6 -7 C-2 -7 -7 -1 -7 6 C-7 13 -2 19 6 19 C12 19 15 16 17 13 L22 16 C19 22 13 26 6 26 C-5 26 -14 17 -14 6 C-14 -5 -5 -14 6 -14 Z" />
            </g>
          </svg>
          <span className="text-[10px] font-sans font-black tracking-[0.4em] text-white -mt-0.5 relative z-10">
            CHANEL
          </span>
        </div>
      );

    case "adidas":
      return (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-neutral-700/60 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),transparent_60%)] pointer-events-none" />
          <svg viewBox="0 0 100 55" className="w-13 h-7 text-white relative z-10" fill="currentColor">
            <path d="M12 36 L24 36 L43 14 L31 14 Z" />
            <path d="M35 36 L47 36 L72 3 L60 3 Z" />
            <path d="M58 36 L70 36 L102 -9 L90 -9 Z" transform="translate(-6, 0)" />
          </svg>
          <span className="text-[11px] font-sans font-black tracking-[0.2em] text-white lowercase -mt-0.5 relative z-10">
            adidas
          </span>
        </div>
      );

    case "gucci":
      return (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#2D1B08] via-[#1F1205] to-[#120A03] border border-amber-900/60 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(253,230,138,0.2),transparent_70%)] pointer-events-none" />
          <svg viewBox="0 0 110 50" className="w-14 h-7 relative z-10">
            <defs>
              <linearGradient id="gucciGoldGradBadge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
            </defs>
            <path d="M43 22c0-7 5.2-12.5 12.2-12.5 3.8 0 7.2 1.7 9.4 4.5l-3.5 3c-1.5-1.9-3.6-3.1-5.9-3.1-4.5 0-7.8 3.7-7.8 8.4s3.3 8.4 7.8 8.4c2.5 0 4.6-1.2 6.1-3.2h-6.1v-4.2h10.5v11c-2.9 3-6.8 5-11.1 5-7.7 0-11.6-6-11.6-12.7z" fill="url(#gucciGoldGradBadge)" />
            <path d="M67 22c0-7-5.2-12.5-12.2-12.5-3.8 0-7.2 1.7-9.4 4.5l3.5 3c1.5-1.9 3.6-3.1 5.9-3.1 4.5 0 7.8 3.7 7.8 8.4s-3.3 8.4-7.8 8.4c-2.5 0-4.6-1.2-6.1-3.2h6.1v-4.2h-10.5v11c2.9 3 6.8 5 11.1 5 7.7 0 11.6-6 11.6-12.7z" fill="url(#gucciGoldGradBadge)" />
          </svg>
          <span className="text-[11px] font-serif font-black tracking-[0.35em] text-[#FDE68A] uppercase -mt-0.5 relative z-10">
            GUCCI
          </span>
        </div>
      );

    case "lv":
      return (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#381E0F] via-[#24130A] to-[#140A05] border border-amber-900/60 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(253,230,138,0.2),transparent_70%)] pointer-events-none" />
          <svg viewBox="0 0 110 50" className="w-13 h-7 relative z-10">
            <defs>
              <linearGradient id="lvGoldGradBadge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
            </defs>
            <path d="M36 8 h8 v26 h16 v7 h-24 z" fill="url(#lvGoldGradBadge)" />
            <path d="M44 8 h8 l12 33 h-8 l-7.5 -22 l-7.5 22 h-8 z" fill="url(#lvGoldGradBadge)" />
          </svg>
          <span className="text-[8px] font-sans font-black tracking-[0.35em] text-[#FDE68A] uppercase -mt-0.5 relative z-10">
            LOUIS VUITTON
          </span>
        </div>
      );

    case "dyson":
      return (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-[#1E102A] to-slate-950 border border-fuchsia-900/50 flex items-center justify-center relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.22),transparent_60%)] pointer-events-none" />
          <span className="text-xl font-sans font-black tracking-wider text-fuchsia-400 drop-shadow-[0_2px_8px_rgba(217,70,239,0.4)] lowercase relative z-10 select-none">
            dyson
          </span>
        </div>
      );

    case "zara":
      return (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-neutral-900 via-black to-neutral-950 border border-neutral-700/60 flex items-center justify-center relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),transparent_60%)] pointer-events-none" />
          <span className="text-2xl font-serif font-black tracking-[-0.12em] text-white drop-shadow-sm relative z-10 select-none">
            ZARA
          </span>
        </div>
      );

    default:
      return (
        <div className="w-full h-full rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center font-mono">
          {brandId.slice(0, 3).toUpperCase()}
        </div>
      );
  }
}

export default function GlobalBrandsShowcase({ isAr = true }: { isAr?: boolean }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedBrandModal, setSelectedBrandModal] = useState<GlobalBrand | null>(null);
  const [modalActiveSection, setModalActiveSection] = useState<string>("all");
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  // VIP Concierge & Sourcing Request Modal State
  const [conciergeProduct, setConciergeProduct] = useState<Product | null>(null);
  const [showCustomSourcing, setShowCustomSourcing] = useState<boolean>(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [requestedSpec, setRequestedSpec] = useState("");
  const [conciergeNotes, setConciergeNotes] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<string | null>(null);

  const { products, formatPrice, addToCart } = useMarketplace();

  const categories = [
    { id: "all", nameAr: "جميع العلامات", nameEn: "All Brands" },
    { id: "tech", nameAr: "إلكترونيات وتقنية", nameEn: "Tech & Devices" },
    { id: "luxury", nameAr: "أزياء وفاخرة", nameEn: "Luxury & Couture" },
    { id: "watches", nameAr: "ساعات ومجوهرات", nameEn: "Watches & Jewelry" },
    { id: "perfumes", nameAr: "عطور وتجميل", nameEn: "Perfumery & Beauty" },
    { id: "sports", nameAr: "رياضة وأحذية", nameEn: "Sports & Footwear" },
  ];

  const filteredBrands = activeCategory === "all"
    ? GLOBAL_BRANDS
    : GLOBAL_BRANDS.filter((b) => b.category === activeCategory);

  // Products matching currently selected modal brand
  const modalBrandProducts = selectedBrandModal
    ? products.filter(
        (p) =>
          p.brand_id === selectedBrandModal.id ||
          p.name.toLowerCase().includes(selectedBrandModal.name.toLowerCase()) ||
          (p.name_en && p.name_en.toLowerCase().includes(selectedBrandModal.name.toLowerCase()))
      )
    : [];

  const handleOpenBrandModal = (brand: GlobalBrand, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedBrandModal(brand);
    setModalActiveSection("all");
    setOrderConfirmed(null);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedItemMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const handleOpenConciergeForProduct = (prod: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConciergeProduct(prod);
    setShowCustomSourcing(false);
    setRequestedSpec("");
    setConciergeNotes("");
    setOrderConfirmed(null);
  };

  const handleOpenCustomSourcing = () => {
    setConciergeProduct(null);
    setShowCustomSourcing(true);
    setRequestedSpec("");
    setConciergeNotes("");
    setOrderConfirmed(null);
  };

  const handleSendWhatsApp = (itemTitle: string, brandName: string, priceStr?: string) => {
    const refCode = `VIP-${Math.floor(100000 + Math.random() * 900000)}`;
    const msg = `*طلب كونسيرج واستيراد مخصص (حجز مسبق VIP)* 🌟
- الماركة: ${brandName}
- المنتج / الموديل: ${itemTitle}
${priceStr ? `- السعر التقريبي: ${priceStr}` : ""}
${clientName ? `- اسم العميل: ${clientName}` : ""}
${clientPhone ? `- رقم الهاتف: ${clientPhone}` : ""}
${requestedSpec ? `- المواصفات المطلوبة: ${requestedSpec}` : ""}
${conciergeNotes ? `- ملاحظات: ${conciergeNotes}` : ""}
- كود الحجز المرجعي: ${refCode}

أرغب في تأكيد التوافر وموعد الاستلام والضمان الرسمي المعتمد.`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/201000000000?text=${encoded}`, "_blank");
    setOrderConfirmed(refCode);
  };

  const handleConfirmInternalPreOrder = (itemTitle: string, brandName: string) => {
    setIsSubmittingOrder(true);
    setTimeout(() => {
      const refCode = `VIP-${Math.floor(100000 + Math.random() * 900000)}`;
      try {
        const existing = JSON.parse(localStorage.getItem("noormexa-vip-inquiries") || "[]");
        existing.push({
          refCode,
          itemTitle,
          brandName,
          clientName,
          clientPhone,
          requestedSpec,
          conciergeNotes,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("noormexa-vip-inquiries", JSON.stringify(existing));
      } catch (err) {
        console.error("Failed to save inquiry to localStorage", err);
      }
      setOrderConfirmed(refCode);
      setIsSubmittingOrder(false);
    }, 600);
  };

  return (
    <section id="brands" className="py-12 md:py-20 border-b border-line bg-surface-soft/40 relative">
      <div className="noormexa-container space-y-8">
        
        {/* Header with Title and Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-600 dark:text-orange-400 font-black text-xs border border-orange-500/25 shadow-xs">
              <Sparkles size={13} className="text-orange-500 animate-pulse" />
              <span>{isAr ? "الماركات العالمية الرسمية المعتمدة" : "Official Global Authorized Brands"}</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              {isAr ? "أشهر الماركات والمتاجر الموثقة عالمياً" : "World-Class Authorized Brand Flagships"}
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-xl">
              {isAr
                ? "تسوق منتجات أصلية 100% مباشرة من الوكلاء المعتمدين والموزعين الرسميين مع شهادات الجودة والضمان المحلي والدولي."
                : "Shop 100% authentic products directly from certified global distributors with factory serial stamps and direct warranties."}
            </p>
          </div>

          {/* Quick View All Link */}
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface dark:bg-slate-900 border border-line hover:border-orange-500 text-xs font-bold text-foreground hover:text-orange-500 transition-all shadow-xs shrink-0 self-start md:self-auto cursor-pointer"
          >
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>{isAr ? "تصفح كتالوج الماركات الشامل (+12 ماركة)" : "Browse All Authorized Brands"}</span>
            {isAr ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
          </Link>
        </div>

        {/* Interactive Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 select-none touch-manipulation">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer touch-manipulation active:scale-95 ${
                activeCategory === cat.id
                  ? "bg-orange-500 text-white shadow-xs font-black scale-102"
                  : "bg-surface dark:bg-slate-900 border border-line text-muted hover:text-foreground hover:border-slate-400"
              }`}
            >
              {isAr ? cat.nameAr : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Global Brands Grid with 3D Embossed Cards & Clickable Hubs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              onClick={(e) => handleOpenBrandModal(brand, e)}
              className={`group relative p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface dark:bg-[#0c1424] border border-line/80 hover:border-orange-500/60 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer touch-manipulation active:scale-96 select-none ${brand.glowColor}`}
            >
              {/* Top Row: Origin Flag & Verified Badge */}
              <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-muted flex items-center gap-1 bg-surface-soft dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-line">
                  <span>{brand.flag}</span>
                  <span className="text-[9px] sm:text-[10px] hidden xs:inline">{isAr ? brand.originAr : brand.originEn}</span>
                </span>

                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] sm:text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-500/20 shadow-2xs">
                  <BadgeCheck size={12} className="fill-emerald-500 text-white" />
                  <span className="hidden sm:inline">{isAr ? "موثق" : "Verified"}</span>
                </span>
              </div>

              {/* 3D Showcase Stage */}
              <div className="my-1.5 sm:my-2.5 flex items-center justify-center h-16 sm:h-20 w-full transition-transform duration-200 group-hover:scale-104">
                <BrandVectorLogo brandId={brand.logoType} theme={brand.badgeTheme} />
              </div>

              {/* Real Clean Brand Name */}
              <div className="space-y-0.5 sm:space-y-1 text-center mt-1">
                <h3 className="font-black text-xs sm:text-base text-foreground group-hover:text-orange-500 transition-colors flex items-center justify-center gap-1">
                  <span>{isAr ? brand.nameAr : brand.name}</span>
                </h3>
                <p className="text-[9px] sm:text-[11px] text-muted line-clamp-1 font-medium">
                  {isAr ? brand.categoryAr : brand.categoryEn}
                </p>
              </div>

              {/* Tagline / Certified Value */}
              <div className="mt-1.5 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-line/60 text-center">
                <p className="text-[9px] sm:text-[10px] text-slate-600 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed hidden xs:block">
                  {isAr ? brand.taglineAr : brand.taglineEn}
                </p>

                {/* Rating & Product Count Footer */}
                <div className="mt-1 sm:mt-2 flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-muted pt-0.5">
                  <span className="flex items-center gap-0.5 text-amber-500">
                    <Star size={10} className="fill-amber-500" />
                    <span>{brand.rating}</span>
                  </span>
                  <span className="text-orange-600 dark:text-orange-400 font-bold">
                    {brand.productsCount}
                  </span>
                </div>
              </div>

              {/* Hover Click Action Label */}
              <div className="mt-1.5 sm:mt-2 text-center pt-1 border-t border-line/40">
                <span className="text-[9px] sm:text-[10px] font-black text-orange-500 flex items-center justify-center gap-1 group-hover:underline">
                  <span>{isAr ? "فتح الأقسام" : "Open Hub"}</span>
                  <ExternalLink size={10} />
                </span>
              </div>

              {/* Hover Indicator Stripe */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Global Assurance Guarantee Banner */}
        <div className="p-4 sm:p-6 rounded-3xl bg-surface dark:bg-slate-900 border border-line shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-start">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-foreground">
                {isAr ? "برنامج حماية أصالة العلامات التجارية بنسبة 100%" : "100% Brand Authenticity & Serial Guarantee"}
              </h4>
              <p className="text-[11px] text-muted">
                {isAr
                  ? "جميع المنتجات المباعة تحت قسم الماركات تخضع لفحص الجودة الدقيق وتأتي برقم تسلسلي معتمد وضمان الوكيل الرسمي."
                  : "All branded products are vetted, serialized, and accompanied by manufacturer warranty with 14-day hassle-free return policy."}
              </p>
            </div>
          </div>

          <Link
            href="/marketplace?official=true"
            className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <ShoppingBag size={14} />
            <span>{isAr ? "تسوق متجر الماركات الموثقة" : "Shop Verified Brands"}</span>
          </Link>
        </div>

      </div>

      {/* Interactive Dedicated Brand Hub Modal & Sections */}
      {selectedBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-surface dark:bg-[#0c1424] border border-line shadow-2xl flex flex-col p-5 sm:p-8 space-y-6">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedBrandModal(null);
                setConciergeProduct(null);
                setShowCustomSourcing(false);
              }}
              className="absolute top-5 start-5 p-2 rounded-full bg-surface-soft hover:bg-slate-200 dark:hover:bg-slate-800 text-muted hover:text-foreground transition-colors cursor-pointer z-10"
              aria-label="Close Modal"
            >
              <X size={18} />
            </button>

            {/* Modal Header: Brand Emblem, Real Name & Authorized Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-4 sm:pt-0 text-center sm:text-start border-b border-line pb-6">
              <div className="w-24 h-20 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                <BrandVectorLogo brandId={selectedBrandModal.logoType} theme={selectedBrandModal.badgeTheme} />
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    {isAr ? selectedBrandModal.nameAr : selectedBrandModal.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <BadgeCheck size={14} className="fill-emerald-500 text-white" />
                    <span>{isAr ? "كتالوج رسمي معتمد 100%" : "Official Authorized Catalog"}</span>
                  </span>
                  <span className="text-xs font-bold text-muted bg-surface-soft px-2 py-0.5 rounded-full border border-line">
                    {selectedBrandModal.flag} {isAr ? selectedBrandModal.originAr : selectedBrandModal.originEn}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-muted">
                  {isAr ? selectedBrandModal.descriptionAr : selectedBrandModal.descriptionEn}
                </p>

                {/* Assurance Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={13} />
                    <span>{isAr ? "رقم تسلسلي موثق" : "Serialized Stamp"}</span>
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <ShieldCheck size={13} />
                    <span>{isAr ? "ضمان الوكيل سنتين" : "2-Year Official Warranty"}</span>
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <RotateCcw size={13} />
                    <span>{isAr ? "استرجاع مجاني 14 يوم" : "14-Day Free Returns"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Exclusive VIP Marketing & Pre-Order Sourcing Notice */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <span>{isAr ? "خدمة الحجز المسبق والاستيراد المباشر VIP" : "VIP Pre-Order & Sourcing Concierge"}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-orange-500 text-white font-bold">
                      {isAr ? "حصري" : "Exclusive"}
                    </span>
                  </h4>
                  <p className="text-[11px] text-muted mt-0.5">
                    {isAr
                      ? "نوفر جميع منتجات وموديلات الماركة الأصلية عند الطلب مباشرة مع فحص الرقم التسلسلي والضمان الكامل."
                      : "We source authentic products directly from certified distributors on-demand with full serial verification."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenCustomSourcing}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/40 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>{isAr ? "طلب موديل مخصص" : "Custom Sourcing"}</span>
              </button>
            </div>

            {/* Brand Sections Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                  {isAr ? "أقسام وتصنيفات الماركة الرسمية" : "Official Brand Sections & Catalog"}
                </h4>
                <span className="text-xs font-bold text-orange-500">
                  {selectedBrandModal.sections.length} {isAr ? "أقسام متخصصة" : "Sections"}
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {selectedBrandModal.sections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setModalActiveSection(sec.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      modalActiveSection === sec.id
                        ? "bg-orange-500 text-white shadow-xs font-black"
                        : "bg-surface-soft border border-line text-muted hover:text-foreground"
                    }`}
                  >
                    {isAr ? sec.nameAr : sec.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Brand Products in this Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                  {isAr
                    ? `منتجات ${selectedBrandModal.nameAr} المتاحة للحجز والطلب الفوري`
                    : `Available ${selectedBrandModal.name} Products for Instant Pre-Order`}
                </h4>
                <span className="text-[11px] text-muted font-bold">
                  {modalBrandProducts.length} {isAr ? "منتج معروض" : "Items Listed"}
                </span>
              </div>

              {modalBrandProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-72 overflow-y-auto p-1 scrollbar-thin">
                  {modalBrandProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-3.5 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line flex flex-col justify-between gap-3 hover:border-orange-500/50 transition-all shadow-xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {prod.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="w-16 h-16 rounded-xl object-cover border border-line shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs shrink-0">
                            {selectedBrandModal.name.slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-black border border-amber-500/25">
                              {prod.preorder_label || (isAr ? "حجز مسبق VIP" : "VIP Pre-Order")}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                              <BadgeCheck size={11} />
                              <span>{isAr ? "أصلي 100%" : "Authentic"}</span>
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-foreground line-clamp-2 mt-1">
                            {prod.name}
                          </h5>
                          <div className="text-xs font-black text-orange-600 dark:text-orange-400 mt-1">
                            {formatPrice(prod.price)}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line/50">
                        <button
                          type="button"
                          onClick={(e) => handleOpenConciergeForProduct(prod, e)}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                        >
                          <Sparkles size={12} />
                          <span>{isAr ? "حجز مسبق VIP" : "VIP Order"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(prod, e)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            addedItemMap[prod.id]
                              ? "bg-emerald-500 text-white"
                              : "bg-surface dark:bg-slate-800 border border-line hover:border-orange-500 text-foreground hover:text-orange-500"
                          }`}
                        >
                          {addedItemMap[prod.id] ? (
                            <>
                              <CheckCircle2 size={12} className="text-white" />
                              <span>{isAr ? "تمت الإضافة!" : "Added!"}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={12} />
                              <span>{isAr ? "إضافة للسلة" : "Add to Cart"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-surface-soft text-center text-xs text-muted border border-dashed border-line space-y-2">
                  <p>
                    {isAr
                      ? `جميع منتجات علامة ${selectedBrandModal.nameAr} متاحة للاستيراد المخصص الفوري مع خدمة الكونسيرج.`
                      : `All ${selectedBrandModal.name} models are available via our VIP Concierge Sourcing service.`}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCustomSourcing}
                    className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-xs hover:bg-orange-600 transition-all cursor-pointer"
                  >
                    {isAr ? "طلب استيراد قطعة مخصصة الآن" : "Request Custom Sourcing Now"}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions: Enter Full Brand Hub in Marketplace */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-line">
              <span className="text-xs text-muted">
                {isAr ? "شحن مؤمن وسريع لكافة طلبات الماركات المؤهلة" : "Insured express shipping on all brand orders"}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrandModal(null);
                    setConciergeProduct(null);
                    setShowCustomSourcing(false);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-surface-soft hover:bg-slate-200 dark:hover:bg-slate-800 text-muted hover:text-foreground text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none"
                >
                  {isAr ? "إغلاق النافذة" : "Close"}
                </button>

                <Link
                  href={`/marketplace?brand=${selectedBrandModal.id}&search=${encodeURIComponent(selectedBrandModal.name)}`}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 !text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none cursor-pointer"
                >
                  <Zap size={14} />
                  <span>{isAr ? `تصفح متجر ${selectedBrandModal.nameAr} في السوق` : `Shop ${selectedBrandModal.name} Flagship`}</span>
                  {isAr ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIP Concierge / Pre-Order Dedicated Request Sheet */}
      {(conciergeProduct || showCustomSourcing) && selectedBrandModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-surface dark:bg-[#0c1424] border border-amber-500/40 shadow-2xl p-6 sm:p-7 space-y-5">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setConciergeProduct(null);
                setShowCustomSourcing(false);
                setOrderConfirmed(null);
              }}
              className="absolute top-5 start-5 p-2 rounded-full bg-surface-soft hover:bg-slate-200 dark:hover:bg-slate-800 text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  {isAr ? "طلب حجز مسبق واستيراد كونسيرج VIP" : "VIP Concierge Sourcing Request"}
                </h3>
                <p className="text-[11px] text-muted">
                  {isAr
                    ? `توفير رسمي مباشر من وكلاء ${selectedBrandModal.nameAr} المعتمدين`
                    : `Direct sourcing from certified ${selectedBrandModal.name} distributors`}
                </p>
              </div>
            </div>

            {orderConfirmed ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <Check size={24} />
                </div>
                <h4 className="text-sm font-black text-foreground">
                  {isAr ? "تم تسجيل طلب الحجز المسبق بنجاح!" : "Pre-Order Request Confirmed!"}
                </h4>
                <p className="text-xs text-muted">
                  {isAr
                    ? "رقم الحجز المرجعي الخاص بك:"
                    : "Your Reference Tracking Code:"}
                </p>
                <div className="font-mono text-sm font-black text-orange-600 dark:text-orange-400 bg-surface px-4 py-2 rounded-xl border border-line inline-block">
                  {orderConfirmed}
                </div>
                <p className="text-[11px] text-muted">
                  {isAr
                    ? "سيتواصل معك ممثل خدمة الكونسيرج خلال 30 دقيقة لتأكيد تفاصيل الشحن والضمان."
                    : "A VIP Concierge specialist will contact you within 30 minutes to confirm dispatch and warranty."}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConciergeProduct(null);
                      setShowCustomSourcing(false);
                      setOrderConfirmed(null);
                    }}
                    className="px-6 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-xs hover:bg-orange-600 cursor-pointer"
                  >
                    {isAr ? "تم، العودة للماركات" : "Done, Back to Brands"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Product Summary Box */}
                {conciergeProduct ? (
                  <div className="p-3 rounded-2xl bg-surface-soft border border-line flex items-center gap-3">
                    {conciergeProduct.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={conciergeProduct.image_url}
                        alt={conciergeProduct.name}
                        className="w-14 h-14 rounded-xl object-cover border border-line shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs shrink-0">
                        {selectedBrandModal.name.slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">
                        {conciergeProduct.name}
                      </h4>
                      <div className="text-xs font-black text-orange-600 dark:text-orange-400 mt-0.5">
                        {formatPrice(conciergeProduct.price)}
                      </div>
                      <span className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        <span>{isAr ? "مدة التوفير: 2 - 4 أيام عمل" : "Lead time: 2 - 4 business days"}</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-surface-soft border border-line space-y-1">
                    <label className="text-[11px] font-bold text-foreground">
                      {isAr ? `الموديل المطلوب من ${selectedBrandModal.nameAr}:` : `Requested ${selectedBrandModal.name} Model:`}
                    </label>
                    <input
                      type="text"
                      value={requestedSpec}
                      onChange={(e) => setRequestedSpec(e.target.value)}
                      placeholder={isAr ? "مثال: iPhone 16 Pro Max سعة 512GB لون صحراوي" : "e.g. iPhone 16 Pro Max 512GB Desert Titanium"}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-3 text-start">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      {isAr ? "اسمك الكامل:" : "Full Name:"}
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={isAr ? "الاسم الكريم" : "Your Name"}
                      className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      {isAr ? "رقم الهاتف / واتساب:" : "Phone / WhatsApp:"}
                    </label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+20 100 000 0000"
                      className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-xs focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  {conciergeProduct && (
                    <div>
                      <label className="block text-[11px] font-bold text-foreground mb-1">
                        {isAr ? "المقاس أو اللون المفضل (اختياري):" : "Preferred Size or Color (Optional):"}
                      </label>
                      <input
                        type="text"
                        value={requestedSpec}
                        onChange={(e) => setRequestedSpec(e.target.value)}
                        placeholder={isAr ? "مثال: مقاس 43 أو لون تيتانيوم طبيعي" : "e.g. Size 43 or Natural Titanium"}
                        className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      {isAr ? "ملاحظات إضافية:" : "Additional Notes:"}
                    </label>
                    <textarea
                      rows={2}
                      value={conciergeNotes}
                      onChange={(e) => setConciergeNotes(e.target.value)}
                      placeholder={isAr ? "أي متطلبات أو مواصفات إضافية..." : "Any special requirements..."}
                      className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-xs focus:outline-none focus:border-orange-500 resize-none"
                    />
                  </div>
                </div>

                {/* Instant Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleSendWhatsApp(
                        conciergeProduct?.name || requestedSpec || "موديل مخصص",
                        selectedBrandModal.nameAr,
                        conciergeProduct ? formatPrice(conciergeProduct.price) : undefined
                      )
                    }
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle size={16} />
                    <span>{isAr ? "إرسال طلب الحجز عبر واتساب مباشرة (فوري)" : "Send Pre-Order via WhatsApp"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmittingOrder}
                    onClick={() =>
                      handleConfirmInternalPreOrder(
                        conciergeProduct?.name || requestedSpec || "موديل مخصص",
                        selectedBrandModal.nameAr
                      )
                    }
                    className="w-full py-2.5 rounded-2xl bg-surface-soft hover:bg-slate-200 dark:hover:bg-slate-800 text-foreground text-xs font-bold border border-line transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap size={14} className="text-orange-500" />
                    <span>
                      {isSubmittingOrder
                        ? isAr
                          ? "جاري تسجيل الطلب..."
                          : "Registering..."
                        : isAr
                        ? "تسجيل طلب الحجز المسبق في النظام"
                        : "Register Pre-Order in System"}
                    </span>
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </section>
  );
}

