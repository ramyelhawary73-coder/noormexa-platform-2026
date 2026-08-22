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
  Truck,
  RotateCcw,
  Zap,
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

// 100% Vector Official Brand Logos with Razor-Sharp Precision & Authentic Brand Geometry
export function BrandVectorLogo({ brandId }: { brandId: string; theme?: string }) {
  switch (brandId) {
    case "apple":
      return (
        <div className="w-full h-full flex items-center justify-center text-slate-950 dark:text-white transition-transform">
          <svg viewBox="0 0 170 170" className="w-11 h-11 object-contain drop-shadow-xs" fill="currentColor">
            {/* Apple Leaf */}
            <path d="M119.22 31.84c0-7.39 2.65-14.34 7.95-20.85 5.3-6.51 11.95-10.58 19.95-12.2 0 1.09.07 2.06.07 2.93 0 7.18-2.82 14.28-8.46 21.3-5.64 7.02-12.39 10.82-20.25 11.41-.43-.87-.66-1.74-.66-2.59z" />
            {/* Apple Body with Bite */}
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.85-11.71-14.44-6.3-10.08-11.19-21.2-14.67-33.36-3.48-12.16-5.22-23.73-5.22-34.7 0-14.12 3.65-25.79 10.96-35 7.31-9.21 16.48-13.91 27.52-14.1 4.57 0 9.77 1.25 15.6 3.75 5.83 2.5 9.74 3.79 11.74 3.79 1.79 0 5.86-1.34 12.22-4.02 6.36-2.68 11.89-3.88 16.59-3.6 12.63.65 22.58 5.62 29.86 14.9-11.07 6.72-16.5 16.14-16.3 28.25.22 9.55 3.96 17.5 11.22 23.86 7.26 6.36 15.79 9.87 25.59 10.53-.88 2.82-1.96 5.81-3.26 8.97z" />
          </svg>
        </div>
      );

    case "nike":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-950 dark:text-white">
          <svg viewBox="0 0 120 48" className="w-20 h-9 object-contain drop-shadow-xs" fill="currentColor">
            <path d="M117.2 4.1C101.4 16 79.8 31.7 53.6 41.2C38.9 46.5 26.5 47.7 16.3 44.8C8.5 42.6 3.6 37.6 1.7 29.8C-0.2 22 1.9 12.7 8 1.9C9.1 0 10.5 0.6 9.8 2.7C6.4 12.2 6.5 20.3 10.1 27C13.7 33.7 20.4 37.4 30.2 38.1C44.1 39.1 61.9 31.3 83.6 14.7C96.2 5.1 106.9 -0.9 115.6 -3.3C117.4 -3.8 118.9 -2.9 117.2 4.1Z" />
          </svg>
          <span className="text-[10px] font-black tracking-[0.3em] font-sans -mt-0.5 text-slate-900 dark:text-white">
            NIKE
          </span>
        </div>
      );

    case "rolex":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <svg viewBox="0 0 120 62" className="w-18 h-10 object-contain">
            {/* Authentic Rolex 5-Point Crown */}
            <g fill="url(#rolexGoldGrad)">
              <defs>
                <linearGradient id="rolexGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
              </defs>
              {/* 5 Pearls */}
              <circle cx="16" cy="14" r="4.2" />
              <circle cx="38" cy="6" r="4.8" />
              <circle cx="60" cy="3" r="5.4" />
              <circle cx="82" cy="6" r="4.8" />
              <circle cx="104" cy="14" r="4.2" />
              {/* Crown Rays */}
              <path d="M16 19 L26 46 L38 46 L38 12 L49 46 L71 46 L60 9 L71 46 L82 12 L82 46 L94 46 L104 19 L96 52 L24 52 Z" />
              {/* Crown Base Oval */}
              <rect x="22" y="53" width="76" height="6.5" rx="3.25" />
            </g>
          </svg>
          <span className="text-[10px] font-serif font-black tracking-[0.3em] text-[#006039] dark:text-[#4ade80] -mt-0.5">
            ROLEX
          </span>
        </div>
      );

    case "samsung":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#034EA2]/10 dark:bg-[#034EA2]/25 border border-[#034EA2]/20 flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 150 28" className="w-24 h-6 object-contain">
              <g fill="#034EA2" className="dark:fill-[#38BDF8]">
                {/* S */}
                <path d="M14 6.5 C8.5 6.5 4.5 9 4.5 12.5 C4.5 18 16 16.5 16 20 C16 21.8 14 23 10.5 23 C6.5 23 3.5 21 2.5 18.5 L0 20.5 C1.5 24 6 26 10.5 26 C16.5 26 20 23.5 20 19.5 C20 13.8 8.5 15.2 8.5 12 C8.5 10.5 10.5 9.5 13.5 9.5 C16.5 9.5 19 10.8 20 12.8 L22.5 10.5 C21 7.8 17.5 6.5 14 6.5 Z" />
                {/* A (Crossbar-less stylized Lambda) */}
                <path d="M26 25.5 L34.5 6.5 L39.5 6.5 L48 25.5 L43 25.5 L37 11.5 L31 25.5 Z" />
                {/* M */}
                <path d="M51 6.5 L55.5 6.5 L61.5 18.5 L67.5 6.5 L72 6.5 L72 25.5 L68 25.5 L68 12.5 L63 22.5 L60 22.5 L55 12.5 L55 25.5 L51 25.5 Z" />
                {/* S */}
                <path d="M85 6.5 C79.5 6.5 75.5 9 75.5 12.5 C75.5 18 87 16.5 87 20 C87 21.8 85 23 81.5 23 C77.5 23 74.5 21 73.5 18.5 L71 20.5 C72.5 24 77 26 81.5 26 C87.5 26 91 23.5 91 19.5 C91 13.8 79.5 15.2 79.5 12 C79.5 10.5 81.5 9.5 84.5 9.5 C87.5 9.5 90 10.8 91 12.8 L93.5 10.5 C92 7.8 88.5 6.5 85 6.5 Z" />
                {/* U */}
                <path d="M96 6.5 L100.5 6.5 L100.5 18 C100.5 21 102.5 23 105.5 23 C108.5 23 110.5 21 110.5 18 L110.5 6.5 L115 6.5 L115 18 C115 23.5 111 26 105.5 26 C100 26 96 23.5 96 18 Z" />
                {/* N */}
                <path d="M120 6.5 L124.5 6.5 L132.5 19 L132.5 6.5 L137 6.5 L137 25.5 L132.5 25.5 L124.5 13 L124.5 25.5 L120 25.5 Z" />
                {/* G */}
                <path d="M148 6.5 C141.5 6.5 137.5 11 137.5 16.5 C137.5 22.2 141.8 26 148 26 C153 26 156.5 23.5 157.5 19.5 L149 19.5 L149 16.5 L161.5 16.5 L161.5 24.5 C158.5 26 153.5 27 148 27 C139.5 27 133 22 133 16.5 C133 10.5 139.5 5.5 148 5.5 C153.5 5.5 157.5 7.5 160 10.5 L157 12.8 C155 10.2 152 6.5 148 6.5 Z" />
              </g>
            </svg>
          </div>
        </div>
      );

    case "sony":
      return (
        <div className="w-full h-full flex items-center justify-center text-slate-950 dark:text-white">
          <svg viewBox="0 0 160 40" className="w-22 h-8 object-contain" fill="currentColor">
            <text
              x="80"
              y="30"
              fontSize="30"
              fontWeight="900"
              fontFamily="'Times New Roman', 'Clarendon', 'Georgia', serif"
              textAnchor="middle"
              letterSpacing="6"
            >
              SONY
            </text>
          </svg>
        </div>
      );

    case "dior":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-950 dark:text-white">
          <svg viewBox="0 0 130 52" className="w-20 h-10 object-contain" fill="currentColor">
            <text
              x="65"
              y="32"
              fontSize="34"
              fontWeight="700"
              fontFamily="'Didot', 'Bodoni MT', 'Baskerville', 'Playfair Display', serif"
              textAnchor="middle"
              letterSpacing="4"
            >
              Dior
            </text>
            <text
              x="65"
              y="48"
              fontSize="8.5"
              fontWeight="900"
              fontFamily="'Montserrat', sans-serif"
              textAnchor="middle"
              letterSpacing="6"
              opacity="0.8"
            >
              PARIS
            </text>
          </svg>
        </div>
      );

    case "chanel":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-950 dark:text-white">
          <svg viewBox="0 0 110 65" className="w-16 h-10 object-contain" fill="currentColor">
            {/* Official Interlocking Double CC Monogram */}
            <g transform="translate(55, 23)">
              {/* Left C */}
              <path d="M-6 -14 C1 -14 7 -10 10 -4 L5 -1 C3 -4 0 -7 -6 -7 C-14 -7 -19 -1 -19 6 C-19 13 -14 19 -6 19 C0 19 3 16 5 13 L10 16 C7 22 1 26 -6 26 C-17 26 -26 17 -26 6 C-26 -5 -17 -14 -6 -14 Z" />
              {/* Right C */}
              <path d="M6 -14 C13 -14 19 -10 22 -4 L17 -1 C15 -4 12 -7 6 -7 C-2 -7 -7 -1 -7 6 C-7 13 -2 19 6 19 C12 19 15 16 17 13 L22 16 C19 22 13 26 6 26 C-5 26 -14 17 -14 6 C-14 -5 -5 -14 6 -14 Z" />
            </g>
            <text
              x="55"
              y="59"
              fontSize="10"
              fontWeight="900"
              fontFamily="sans-serif"
              textAnchor="middle"
              letterSpacing="4"
            >
              CHANEL
            </text>
          </svg>
        </div>
      );

    case "adidas":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-950 dark:text-white">
          <svg viewBox="0 0 100 62" className="w-16 h-10 object-contain" fill="currentColor">
            {/* 3 Authentic Performance Mountain Angled Bars */}
            <path d="M12 36 L24 36 L43 14 L31 14 Z" />
            <path d="M35 36 L47 36 L72 3 L60 3 Z" />
            <path d="M58 36 L70 36 L102 -9 L90 -9 Z" transform="translate(-6, 0)" />
            <text
              x="48"
              y="55"
              fontSize="14"
              fontWeight="900"
              fontFamily="'Helvetica Neue', Arial, sans-serif"
              textAnchor="middle"
              letterSpacing="1.5"
            >
              adidas
            </text>
          </svg>
        </div>
      );

    case "gucci":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <svg viewBox="0 0 110 62" className="w-18 h-10 object-contain">
            <g fill="url(#gucciGoldGrad)">
              <defs>
                <linearGradient id="gucciGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="50%" stopColor="#B45309" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
              </defs>
              {/* Interlocking GG */}
              <path d="M43 22c0-7 5.2-12.5 12.2-12.5 3.8 0 7.2 1.7 9.4 4.5l-3.5 3c-1.5-1.9-3.6-3.1-5.9-3.1-4.5 0-7.8 3.7-7.8 8.4s3.3 8.4 7.8 8.4c2.5 0 4.6-1.2 6.1-3.2h-6.1v-4.2h10.5v11c-2.9 3-6.8 5-11.1 5-7.7 0-11.6-6-11.6-12.7z" />
              <path d="M67 22c0-7-5.2-12.5-12.2-12.5-3.8 0-7.2 1.7-9.4 4.5l3.5 3c1.5-1.9 3.6-3.1 5.9-3.1 4.5 0 7.8 3.7 7.8 8.4s-3.3 8.4-7.8 8.4c-2.5 0-4.6-1.2-6.1-3.2h6.1v-4.2h-10.5v11c2.9 3 6.8 5 11.1 5 7.7 0 11.6-6 11.6-12.7z" />
            </g>
            <text
              x="55"
              y="54"
              fontSize="12"
              fontWeight="900"
              fontFamily="serif"
              textAnchor="middle"
              letterSpacing="5"
              fill="currentColor"
              className="text-slate-950 dark:text-white"
            >
              GUCCI
            </text>
          </svg>
        </div>
      );

    case "lv":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <svg viewBox="0 0 110 65" className="w-16 h-10 object-contain">
            <g fill="url(#lvGoldGrad)">
              <defs>
                <linearGradient id="lvGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="50%" stopColor="#92400E" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
              </defs>
              {/* Interlocking LV Monogram */}
              <path d="M36 8 h8 v26 h16 v7 h-24 z" />
              <path d="M44 8 h8 l12 33 h-8 l-7.5 -22 l-7.5 22 h-8 z" />
            </g>
            <text
              x="55"
              y="59"
              fontSize="8"
              fontWeight="900"
              fontFamily="sans-serif"
              textAnchor="middle"
              letterSpacing="3"
              fill="currentColor"
              className="text-slate-950 dark:text-white"
            >
              LOUIS VUITTON
            </text>
          </svg>
        </div>
      );

    case "dyson":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="px-3 py-1.5 rounded-xl bg-fuchsia-500/10 dark:bg-fuchsia-500/20 border border-fuchsia-500/20 flex items-center justify-center">
            <svg viewBox="0 0 130 36" className="w-22 h-7 object-contain">
              <text
                x="65"
                y="26"
                fontSize="28"
                fontWeight="900"
                fontFamily="'Century Gothic', 'Montserrat', sans-serif"
                textAnchor="middle"
                letterSpacing="3"
                className="fill-fuchsia-600 dark:fill-fuchsia-400"
              >
                dyson
              </text>
            </svg>
          </div>
        </div>
      );

    case "zara":
      return (
        <div className="w-full h-full flex items-center justify-center text-slate-950 dark:text-white">
          <svg viewBox="0 0 130 44" className="w-22 h-8 object-contain" fill="currentColor">
            <text
              x="65"
              y="32"
              fontSize="34"
              fontWeight="900"
              fontFamily="'Bodoni MT', 'Didot', 'Times New Roman', serif"
              textAnchor="middle"
              letterSpacing="-2"
            >
              ZARA
            </text>
          </svg>
        </div>
      );

    default:
      return (
        <div className="w-12 h-12 rounded-xl bg-orange-500/15 text-orange-500 font-black text-sm flex items-center justify-center font-mono">
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
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              onClick={(e) => handleOpenBrandModal(brand, e)}
              className={`group relative p-4 sm:p-5 rounded-3xl bg-surface dark:bg-[#0c1424] border border-line/80 hover:border-orange-500/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1 cursor-pointer ${brand.glowColor}`}
            >
              {/* Top Row: Origin Flag & Verified Badge */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[11px] font-semibold text-muted flex items-center gap-1 bg-surface-soft dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-line">
                  <span>{brand.flag}</span>
                  <span className="text-[10px] hidden xs:inline">{isAr ? brand.originAr : brand.originEn}</span>
                </span>

                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-500/20 shadow-2xs">
                  <BadgeCheck size={12} className="fill-emerald-500 text-white" />
                  <span className="hidden sm:inline">{isAr ? "موثق" : "Verified"}</span>
                </span>
              </div>

              {/* 3D Showcase Plinth / Stage */}
              <div className="my-2.5 flex items-center justify-center h-22 w-full rounded-2xl bg-gradient-to-b from-surface-soft via-surface-soft/80 to-surface-soft/40 dark:from-slate-800/60 dark:via-slate-900/80 dark:to-slate-950 border border-line/90 group-hover:border-orange-500/40 transition-all px-2 py-2 relative overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,0.04)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_70%)] pointer-events-none" />
                <div className="transition-transform duration-300 group-hover:scale-108 flex items-center justify-center w-full h-full">
                  <BrandVectorLogo brandId={brand.logoType} theme={brand.badgeTheme} />
                </div>
              </div>

              {/* Real Clean Brand Name */}
              <div className="space-y-1 text-center mt-1">
                <h3 className="font-black text-sm sm:text-base text-foreground group-hover:text-orange-500 transition-colors flex items-center justify-center gap-1">
                  <span>{isAr ? brand.nameAr : brand.name}</span>
                </h3>
                <p className="text-[10px] sm:text-[11px] text-muted line-clamp-1 font-medium">
                  {isAr ? brand.categoryAr : brand.categoryEn}
                </p>
              </div>

              {/* Tagline / Certified Value */}
              <div className="mt-2.5 pt-2 border-t border-line/60 text-center">
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                  {isAr ? brand.taglineAr : brand.taglineEn}
                </p>

                {/* Rating & Product Count Footer */}
                <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-muted pt-1">
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
              <div className="mt-2 text-center pt-1 border-t border-line/40">
                <span className="text-[10px] font-black text-orange-500 flex items-center justify-center gap-1 group-hover:underline">
                  <span>{isAr ? "فتح أقسام الماركة" : "Open Brand Hub"}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-surface dark:bg-[#0c1424] border border-line shadow-2xl flex flex-col p-6 sm:p-8 space-y-6">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedBrandModal(null)}
              className="absolute top-5 start-5 p-2 rounded-full bg-surface-soft hover:bg-slate-200 dark:hover:bg-slate-800 text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Header: Brand Emblem, Real Name & Authorized Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-4 sm:pt-0 text-center sm:text-start border-b border-line pb-6">
              <div className="w-20 h-20 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line p-3 flex items-center justify-center shrink-0 shadow-inner">
                <BrandVectorLogo brandId={selectedBrandModal.logoType} theme={selectedBrandModal.badgeTheme} />
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    {isAr ? selectedBrandModal.nameAr : selectedBrandModal.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <BadgeCheck size={14} className="fill-emerald-500 text-white" />
                    <span>{isAr ? "متجر معتمد رسمي 100%" : "Official Authorized Flagship"}</span>
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
              <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                {isAr ? `منتجات ${selectedBrandModal.nameAr} المتوفرة للطلب الفوري` : `Available ${selectedBrandModal.name} Products`}
              </h4>

              {modalBrandProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                  {modalBrandProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-3 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line flex items-center justify-between gap-3 hover:border-orange-500/50 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {prod.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="w-14 h-14 rounded-xl object-cover border border-line shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs shrink-0">
                            {selectedBrandModal.name.slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-foreground line-clamp-1">
                            {prod.name}
                          </h5>
                          <div className="text-xs font-black text-orange-600 dark:text-orange-400 mt-0.5">
                            {formatPrice(prod.price)}
                          </div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                            <Truck size={10} />
                            <span>{isAr ? "متوفر بالمخزون المركزي" : "In Central Stock"}</span>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(prod, e)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                          addedItemMap[prod.id]
                            ? "bg-emerald-500 text-white"
                            : "bg-orange-500 hover:bg-orange-600 text-white shadow-xs"
                        }`}
                      >
                        {addedItemMap[prod.id] ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>{isAr ? "تمت الإضافة!" : "Added!"}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={12} />
                            <span>{isAr ? "شراء" : "Add"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-surface-soft text-center text-xs text-muted border border-dashed border-line">
                  {isAr
                    ? `اضغط بالأسفل لفتح جميع منتجات ${selectedBrandModal.nameAr} في السوق المفتوح المعتمد.`
                    : `Click below to browse full ${selectedBrandModal.name} catalog in marketplace.`}
                </div>
              )}
            </div>

            {/* Bottom Actions: Enter Full Brand Hub in Marketplace */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-line">
              <span className="text-xs text-muted">
                {isAr ? "شحن مجاني لكافة طلبات الماركات المؤهلة" : "Free express shipping on eligible brand orders"}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedBrandModal(null)}
                  className="px-4 py-2.5 rounded-2xl bg-surface-soft hover:bg-slate-200 dark:hover:bg-slate-800 text-muted hover:text-foreground text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none"
                >
                  {isAr ? "إغلاق النافذة" : "Close"}
                </button>

                <Link
                  href={`/marketplace?brand=${selectedBrandModal.id}&search=${encodeURIComponent(selectedBrandModal.name)}`}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 !text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none cursor-pointer"
                >
                  <Zap size={14} />
                  <span>{isAr ? `تصفح متجر ${selectedBrandModal.nameAr} بالكامل في السوق` : `Shop Full ${selectedBrandModal.name} Flagship`}</span>
                  {isAr ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}

