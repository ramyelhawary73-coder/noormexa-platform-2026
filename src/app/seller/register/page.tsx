"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CreditCard,
  FileText,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Store as StoreIcon,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import SmartImageUploadField from "@/components/SmartImageUploadField";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

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

export default function SellerRegisterPage() {
  const language = useNoormexaLanguage();
  const isAr = language === "ar";

  const { registerStore } = useMarketplace();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("المملكة العربية السعودية");
  const [category, setCategory] = useState("electronics");
  const [logoUrl, setLogoUrl] = useState("https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&auto=format&fit=crop&q=80");
  const [bannerUrl, setBannerUrl] = useState("https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80");

  // KYC & Commercial Data
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [bankName, setBankName] = useState("مصرف الراجحي");
  const [iban, setIban] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "professional" | "enterprise">("professional");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleSlugAuto = (name: string) => {
    setStoreName(name);
    if (!slug || slug === storeName.toLowerCase().replace(/\s+/g, "-")) {
      setSlug(
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) return;

    setSubmitting(true);

    setTimeout(() => {
      registerStore({
        name: storeName,
        slug: slug || `store-${Date.now()}`,
        description,
        country,
        plan: selectedPlan,
        cr_number: crNumber,
        tax_number: taxNumber,
        bank_name: bankName,
        iban,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        logo_url: logoUrl,
        banner_url: bannerUrl,
      });

      setSubmitting(false);
      setStep(4);
    }, 800);
  };

  return (
    <main className="noormexa-main py-8 md:py-12">
      <div className="noormexa-container max-w-4xl space-y-8">
        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-gold/10 text-amber-600 dark:text-gold text-xs font-black border border-amber-500/20 dark:border-gold/20">
            <Sparkles size={14} />
            <span>{isAr ? "برنامج بائعي نورميكسا المعتمدين" : "NOORMEXA Verified Seller Program"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
            {isAr ? "افتح متجرك الإلكتروني وابدأ البيع لآلاف العملاء" : "Launch Your Store & Sell to Thousands of Customers"}
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            {isAr
              ? "انضم إلى شبكة نخبة التجار في الشرق الأوسط مع دعم الشحن السريع، بوابات الدفع المتعددة، ولوحة تحكم متطورة لإدارة مبيعاتك"
              : "Join the leading network of verified merchants in the Middle East with express logistics, secure multi-currency payouts, and an advanced seller dashboard."}
          </p>
        </div>

        {/* Value Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-surface border border-line shadow-xs flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-gold shrink-0">
              <TrendingUp size={20} />
            </span>
            <div className="text-xs">
              <div className="font-black text-foreground">{isAr ? "عمولة تبدأ من 5%" : "Commission from 5%"}</div>
              <div className="text-muted text-[11px]">{isAr ? "أدنى عمولة تسويقية وأرباح صافية أسبوعية" : "Lowest fee structure & weekly payouts"}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-line shadow-xs flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 shrink-0">
              <Truck size={20} />
            </span>
            <div className="text-xs">
              <div className="font-black text-foreground">{isAr ? "لوجستيات وشحن متكامل" : "Integrated Global Logistics"}</div>
              <div className="text-muted text-[11px]">{isAr ? "شحن آلي وبوالص شحن وتتبع لحظي" : "Automated airway bills & real-time tracking"}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-line shadow-xs flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 shrink-0">
              <ShieldCheck size={20} />
            </span>
            <div className="text-xs">
              <div className="font-black text-foreground">{isAr ? "حماية المدفوعات والتوثيق" : "Secure Verified Badges"}</div>
              <div className="text-muted text-[11px]">{isAr ? "شعار البائع الموثوق وحماية ضد الاحتيال" : "Merchant badge & built-in fraud shield"}</div>
            </div>
          </div>
        </div>

        {/* Multi-Step Stepper Bar */}
        <div className="p-3 sm:p-4 rounded-3xl bg-surface border border-line shadow-xs">
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, labelAr: "هوية المتجر", labelEn: "Store Identity", icon: StoreIcon },
              { num: 2, labelAr: "التحقق والـ KYC", labelEn: "KYC & Verification", icon: Building2 },
              { num: 3, labelAr: "خطة الاشتراك", labelEn: "Plan & Commission", icon: CreditCard },
            ].map((s) => {
              const Icon = s.icon;
              const isCurrent = step === s.num;
              const isDone = step > s.num;
              return (
                <div
                  key={s.num}
                  className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-2xl border transition-all text-xs font-bold ${
                    isCurrent
                      ? "bg-amber-500 text-white border-amber-600 shadow-sm dark:bg-navy dark:text-gold dark:border-gold"
                      : isDone
                      ? "bg-emerald-600/10 text-emerald-600 border-emerald-600/20"
                      : "bg-surface-soft text-muted border-line"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      isCurrent
                        ? "bg-white text-amber-600 dark:bg-gold dark:text-navy"
                        : isDone
                        ? "bg-emerald-600 text-white"
                        : "bg-surface border border-line text-muted"
                    }`}
                  >
                    {isDone ? <Check size={13} /> : s.num}
                  </span>
                  <div className="min-w-0 flex items-center gap-1.5">
                    <Icon size={15} className="shrink-0 hidden sm:block" />
                    <span className="truncate">{isAr ? s.labelAr : s.labelEn}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Forms */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-line pb-4">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                  <StoreIcon size={20} className="text-gold" />
                  <span>{isAr ? "الخطوة 1: هوية وعلامة المتجر التجارية" : "Step 1: Store & Brand Identity"}</span>
                </h2>
                <p className="text-xs text-muted mt-1">
                  {isAr ? "حدد اسم متجرك ورابطه الذي سيظهر للعملاء في سوق نورميكسا" : "Set your store name, URL slug, and brand appearance"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">{isAr ? "اسم المتجر التجاري *" : "Store Brand Name *"}</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => handleSlugAuto(e.target.value)}
                    placeholder={isAr ? "مثال: أزياء الريان الملكية" : "e.g. Royal Al-Rayan Fashion"}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">{isAr ? "الرابط المخصص (Slug) *" : "Store URL Slug *"}</label>
                  <div className="flex items-center rounded-xl bg-surface-soft border border-line overflow-hidden px-3">
                    <span className="text-[11px] text-muted font-mono" dir="ltr">noormexa.com/store/</span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="al-rayan-store"
                      className="w-full py-3 bg-transparent focus:outline-none font-mono text-xs text-foreground font-bold"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">{isAr ? "الدولة والمقر الرئيسي *" : "Country & Headquarters *"}</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  >
                    <option value="المملكة العربية السعودية">المملكة العربية السعودية (KSA)</option>
                    <option value="الإمارات العربية المتحدة">الإمارات العربية المتحدة (UAE)</option>
                    <option value="جمهورية مصر العربية">جمهورية مصر العربية (Egypt)</option>
                    <option value="دولة الكويت">دولة الكويت (Kuwait)</option>
                    <option value="مملكة البحرين">مملكة البحرين (Bahrain)</option>
                    <option value="دولة قطر">دولة قطر (Qatar)</option>
                    <option value="سلطنة عمان">سلطنة عمان (Oman)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">{isAr ? "النشاط والتصنيف التجاري *" : "Primary Category *"}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  >
                    <option value="electronics">{isAr ? "إلكترونيات وأجهزة ذكية" : "Electronics & Tech"}</option>
                    <option value="fashion">{isAr ? "أزياء وموضة فاخرة" : "Luxury Fashion & Apparel"}</option>
                    <option value="perfumes">{isAr ? "عطور ودهن عود أصيل" : "Perfumes & Authentic Oud"}</option>
                    <option value="home">{isAr ? "ديكور ومنزل عصري" : "Home & Living Decor"}</option>
                    <option value="watches">{isAr ? "ساعات ومجوهرات" : "Watches & Fine Jewelry"}</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-foreground">{isAr ? "نبذة تعريفية عن المتجر والمنتجات *" : "Store Bio & Description *"}</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isAr ? "اكتب نبذة مميزة عن قصة علامتك التجارية ومنتجاتك الفاخرة..." : "Describe your brand story, craftsmanship, and products..."}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <SmartImageUploadField
                    label={isAr ? "شعار المتجر الرسمي (Logo)" : "Store Logo"}
                    value={logoUrl}
                    onChange={setLogoUrl}
                    aspectRatio="1:1"
                    isAr={isAr}
                    helperText={isAr ? "شعار مربع 1:1 مع أداة قص ومعالجة ذكية" : "Square 1:1 with smart cropper & auto-enhancement"}
                  />
                </div>

                <div className="space-y-1.5">
                  <SmartImageUploadField
                    label={isAr ? "غلاف وبانر المتجر (Store Banner)" : "Store Header Banner"}
                    value={bannerUrl}
                    onChange={setBannerUrl}
                    aspectRatio="12:5"
                    isAr={isAr}
                    helperText={isAr ? "بانر أفقي عريض 12:5 بدقة 1200x500 بكسل" : "Wide 12:5 header banner (1200x500px)"}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    if (!storeName) {
                      alert(isAr ? "يرجى كتابة اسم المتجر للمتابعة" : "Please enter store name");
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-6 py-3 rounded-xl bg-gold text-navy hover:bg-gold-strong font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <span>{isAr ? "المتابعة إلى بيانات التوثيق والـ KYC" : "Proceed to KYC Verification"}</span>
                  {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-line pb-4">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Building2 size={20} className="text-gold" />
                  <span>{isAr ? "الخطوة 2: التوثيق التجاري والبيانات المالية (KYC)" : "Step 2: Commercial KYC & Bank Details"}</span>
                </h2>
                <p className="text-xs text-muted mt-1">
                  {isAr
                    ? "نطلب هذه البيانات لضمان موثوقية السوق وحماية حقوق المشترين وتحويل أرباح مبيعاتك مباشرة إلى حسابك البنكي"
                    : "Required to verify your business identity and route weekly sales payouts directly to your bank"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <Mail size={14} className="text-gold" />
                    <span>{isAr ? "البريد الإلكتروني التجاري *" : "Official Business Email *"}</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="merchant@yourstore.com"
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <Phone size={14} className="text-gold" />
                    <span>{isAr ? "رقم الهاتف / واتساب الأعمال *" : "Contact Phone / WhatsApp *"}</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+966 50 000 0000"
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <FileText size={14} className="text-gold" />
                    <span>{isAr ? "رقم السجل التجاري / وثيقة العمل الحر *" : "Commercial Reg. / Freelance License *"}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={crNumber}
                    onChange={(e) => setCrNumber(e.target.value)}
                    placeholder="CR-1010-88992"
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <FileText size={14} className="text-gold" />
                    <span>{isAr ? "الرقم الضريبي (إن وجد)" : "Tax / VAT ID (If applicable)"}</span>
                  </label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="30012938400003"
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <CreditCard size={14} className="text-gold" />
                    <span>{isAr ? "اسم البنك لتحويل الأرباح *" : "Bank Name for Payouts *"}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder={isAr ? "مصرف الراجحي / البنك الأهلي / CIB" : "Al Rajhi Bank / SNB / CIB"}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <CreditCard size={14} className="text-gold" />
                    <span>{isAr ? "رقم الحساب الدولي (IBAN) *" : "IBAN Number *"}:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="SA00 0000 0000 0000 0000 0000"
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold font-mono uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-line text-muted hover:text-foreground font-bold text-xs"
                >
                  {isAr ? "الرجوع للخطوة السابقة" : "Back"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!contactEmail || !contactPhone || !crNumber || !iban) {
                      alert(isAr ? "يرجى ملء جميع الحقول المطلوبة للمتابعة" : "Please fill required KYC fields");
                      return;
                    }
                    setStep(3);
                  }}
                  className="px-6 py-3 rounded-xl bg-gold text-navy hover:bg-gold-strong font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <span>{isAr ? "المتابعة لاختيار الخطة والعمولة" : "Proceed to Plan Selection"}</span>
                  {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmitRegistration} className="space-y-6 animate-in fade-in">
              <div className="border-b border-line pb-4">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                  <CreditCard size={20} className="text-gold" />
                  <span>{isAr ? "الخطوة 3: اختيار خطة المتجر ونسبة العمولة" : "Step 3: Merchant Plan & Commission Tier"}</span>
                </h2>
                <p className="text-xs text-muted mt-1">
                  {isAr
                    ? "اختر الخطة المناسبة لحجم أعمالك. لا توجد رسوم خفية، فقط نسبة عمولة على المبيعات المكتملة"
                    : "Select the plan tailored for your business volume. Transparent commissions upon successful deliveries."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    id: "starter",
                    nameAr: "الخطة الأساسية (Starter)",
                    nameEn: "Starter Merchant",
                    rate: "8%",
                    feeAr: "بدون رسوم اشتراك شهرية",
                    feeEn: "0 Monthly Subscription",
                    featuresAr: ["حتى 50 منتج نشط", "تسوية أرباح نصف شهرية", "دعم فني عبر التذاكر"],
                    featuresEn: ["Up to 50 active products", "Bi-weekly payouts", "Ticket support"],
                  },
                  {
                    id: "professional",
                    nameAr: "الخطة الاحترافية (Pro)",
                    nameEn: "Verified Pro Store",
                    rate: "6%",
                    popular: true,
                    feeAr: "أكثر الخطط طلباً ونمواً",
                    feeEn: "Most Popular for Growth",
                    featuresAr: ["منتجات غير محدودة", "شارة التاجر الموثق الذهبية", "تسوية أرباح أسبوعية", "أولوية ظهور في محركات البحث"],
                    featuresEn: ["Unlimited products", "Verified Gold Badge", "Weekly payouts", "Search engine priority"],
                  },
                  {
                    id: "enterprise",
                    nameAr: "خطة الشركات (Enterprise)",
                    nameEn: "Enterprise Royal",
                    rate: "4.5%",
                    feeAr: "للعلامات التجارية الكبرى",
                    feeEn: "For Large Volume Brands",
                    featuresAr: ["مدير حساب تجاري مخصص", "شحن لوجستي فائق السرعة", "تسوية فورية عند الطلب", "حملات تسويقية مجانية مخصصة"],
                    featuresEn: ["Dedicated account manager", "Express warehouse priority", "Instant on-demand payout", "Custom marketing campaigns"],
                  },
                ].map((plan) => {
                  const selected = selectedPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id as typeof selectedPlan)}
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                        selected
                          ? "bg-amber-500/10 border-amber-500 dark:bg-navy dark:border-gold ring-2 ring-amber-500/20 dark:ring-gold/20"
                          : "bg-surface-soft border-line hover:border-amber-500/40"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gold text-navy font-black text-[10px] uppercase shadow-xs">
                          {isAr ? "الأكثر شيوعاً" : "Most Popular"}
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-black text-sm text-foreground">{isAr ? plan.nameAr : plan.nameEn}</div>
                          <div className="text-[11px] text-muted">{isAr ? plan.feeAr : plan.feeEn}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-amber-600 dark:text-gold">{plan.rate}</span>
                          <span className="text-[10px] text-muted block">{isAr ? "عمولة" : "Fee"}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-line/60 text-xs">
                        {(isAr ? plan.featuresAr : plan.featuresEn).map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-foreground/90">
                            <Check size={14} className="text-emerald-600 shrink-0" />
                            <span className="text-[11px]">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-surface-soft border border-line space-y-3 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="accent-[#d4af37] w-4 h-4 rounded mt-0.5"
                  />
                  <span className="text-foreground/90 leading-relaxed">
                    {isAr
                      ? "أوافق على اتفاقية وشروط خدمة بائعي نورميكسا، وسياسات حماية حقوق الملكية الفكرية، والتعهد بأصالة جميع المنتجات المعروضة."
                      : "I agree to NOORMEXA Seller Agreement, Intellectual Property Policy, and certify that all catalog products are 100% authentic."}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-line text-muted hover:text-foreground font-bold text-xs"
                >
                  {isAr ? "الرجوع للخطوة السابقة" : "Back"}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !acceptedTerms}
                  className="px-8 py-3 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <span>{isAr ? "جاري إنشاء المتجر والتوثيق..." : "Creating Store..."}</span>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>{isAr ? "تأكيد التسجيل وإطلاق المتجر الآن" : "Confirm Registration & Launch Store"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-8 space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 flex items-center justify-center mx-auto">
                <BadgeCheck size={36} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">
                  {isAr ? "تهانينا! تم تسجيل متجرك بنجاح في نورميكسا" : "Congratulations! Your Store is Registered"}
                </h2>
                <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
                  {isAr
                    ? `متجر (${storeName}) أصبح مسجلاً في المنصة. يمكنك الآن إضافة منتجاتك وبدء استقبال الطلبات ومتابعة الأرباح.`
                    : `Your store (${storeName}) has been onboarded. You can now list inventory, process buyer orders, and track payouts.`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/seller/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <StoreIcon size={16} />
                  <span>{isAr ? "الدخول إلى لوحة تحكم المتجر (Seller Central)" : "Go to Seller Central Dashboard"}</span>
                </Link>

                <Link
                  href={`/store/${slug}`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-line text-foreground hover:bg-surface-soft font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Globe size={16} />
                  <span>{isAr ? "معاينة واجهة متجرك العامة" : "Preview Public Storefront"}</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
