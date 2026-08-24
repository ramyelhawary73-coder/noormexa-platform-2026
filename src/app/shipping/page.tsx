"use client";

import { useState, useSyncExternalStore, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Truck,
  Package,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Phone,
  MessageSquare,
  Printer,
  Plus,
  Sparkles,
  Copy,
  Check,
  Key,
  Sliders,
  UserCheck,
  Navigation,
  Layers,
  Zap,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { CarrierIntegrationManager } from "@/components/CarrierIntegrationManager";
import type {
  Shipment,
  ShipmentStatus,
  CarrierType,
  ShippingCarrier,
} from "@/types/marketplace";

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

function ShippingLogisticsContent() {
  const language = useSyncExternalStore(subscribeToLanguage, getLanguageSnapshot, () => "ar");
  const isAr = language === "ar";
  const searchParams = useSearchParams();
  const trackParam = searchParams.get("track") || "";

  const {
    shipments,
    carriers,
    formatPrice,
    registerCarrier,
    updateCarrier,
    toggleCarrierStatus,
    createShipment,
    updateShipmentStatus,
    assignShipmentDriver,
    dispatchBulkShipments,
    calculateShippingQuotes,
    getShipmentByAwb,
  } = useMarketplace();

  // Navigation Sub-tabs: "track" | "merchant" | "carriers" | "calculator"
  const [activeTab, setActiveTab] = useState<"track" | "merchant" | "carriers" | "calculator">("track");

  // Search & Tracking state
  const [searchQuery, setSearchQuery] = useState(trackParam);
  const [activeShipmentId, setActiveShipmentId] = useState<string>(() => {
    if (trackParam) {
      const found = getShipmentByAwb(trackParam);
      if (found) return found.id;
    }
    return shipments[0]?.id || "";
  });

  // Filter state for merchant view
  const [merchantStatusFilter, setMerchantStatusFilter] = useState<string>("all");
  const [merchantSearch, setMerchantSearch] = useState("");
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);

  // Modals state
  const [showCreateShipmentModal, setShowCreateShipmentModal] = useState(false);
  const [showRegisterCarrierModal, setShowRegisterCarrierModal] = useState(false);
  const [managingCarrier, setManagingCarrier] = useState<ShippingCarrier | null>(null);
  const [showWaybillModal, setShowWaybillModal] = useState<Shipment | null>(null);
  const [showDriverModal, setShowDriverModal] = useState<Shipment | null>(null);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState<Shipment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);
  const [subscribedSms, setSubscribedSms] = useState(false);

  // Rate calculator state
  const [calcOrigin, setCalcOrigin] = useState("المملكة العربية السعودية");
  const [calcDest, setCalcDest] = useState("مصر");
  const [calcWeight, setCalcWeight] = useState(2);
  const [calcSpeed, setCalcSpeed] = useState<"standard" | "priority" | "same_day">("standard");

  // New carrier form state
  const [newCarrierData, setNewCarrierData] = useState({
    nameAr: "",
    nameEn: "",
    code: "",
    type: "domestic" as CarrierType,
    supportedCountries: "المملكة العربية السعودية, مصر, الإمارات",
    baseCost: 50,
    perKgRate: 15,
    slaDaysMin: 1,
    slaDaysMax: 3,
    contactPhone: "+966 9200 0000",
    contactEmail: "logistics@company.com",
    trackingUrlTemplate: "https://example.com/track?id={TRACKING_NUMBER}",
    descriptionAr: "خدمات الشحن السريع والتوزيع الداخلي مع ضمان الجودة.",
    descriptionEn: "Express logistics and fulfillment services with tracking.",
    apiKey: "SANDBOX_KEY_NRX2026",
    accountNumber: "ACC-8821",
  });

  // New shipment form state
  const [newShipmentData, setNewShipmentData] = useState({
    orderId: "",
    carrierId: carriers[0]?.id || "",
    storeName: "TechCraft Global Innovations",
    recipientName: "",
    recipientPhone: "",
    recipientCity: "الرياض",
    recipientAddress: "",
    recipientCountry: "المملكة العربية السعودية",
    originCity: "الرياض",
    originCountry: "المملكة العربية السعودية",
    originWarehouse: "مستودع الرياض المركزي (RUH-01)",
    packageWeightKg: 1.5,
    length: 30,
    width: 20,
    height: 15,
    itemCount: 1,
    itemsList: "أجهزة إلكترونية وملحقات فاخرة",
    declaredValue: 1200,
    paymentType: "prepaid" as "prepaid" | "cod",
    codAmount: 0,
    shippingSpeed: "standard" as "standard" | "priority" | "same_day",
    notes: "يرجى الاتصال قبل التسليم بنصف ساعة.",
  });

  // Driver Assignment Form
  const [driverFormData, setDriverFormData] = useState({
    name: "",
    phone: "",
    vehicle: "",
  });

  // Status Update Form
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: "in_transit" as ShipmentStatus,
    note: "",
    location: "مركز التوزيع الرئيسي - الرياض",
  });

  // Current active shipment for tracking
  const currentShipment = shipments.find((s) => s.id === activeShipmentId) || shipments[0];

  // Filtered shipments for merchant console
  const filteredMerchantShipments = shipments.filter((s) => {
    if (merchantStatusFilter !== "all" && s.status !== merchantStatusFilter) return false;
    if (merchantSearch.trim()) {
      const q = merchantSearch.toLowerCase();
      return (
        s.awbNumber.toLowerCase().includes(q) ||
        s.recipientName.toLowerCase().includes(q) ||
        s.recipientCity.toLowerCase().includes(q) ||
        s.storeName.toLowerCase().includes(q) ||
        s.orderNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Dynamic shipping quotes from calculator
  const calculatedQuotes = calculateShippingQuotes(calcOrigin, calcDest, calcWeight, calcSpeed);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyAwb = (awb: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(awb);
      setCopiedAwb(awb);
      showToast(isAr ? "تم نسخ رقم بوليصة الشحن بنجاح" : "Tracking number copied to clipboard");
      setTimeout(() => setCopiedAwb(null), 2000);
    }
  };

  const handleBulkDispatch = (carrierId: string) => {
    if (selectedShipmentIds.length === 0) {
      showToast(isAr ? "يرجى تحديد شحنة واحدة على الأقل" : "Please select at least one shipment");
      return;
    }
    const res = dispatchBulkShipments(selectedShipmentIds, carrierId);
    showToast(
      isAr
        ? `تم إسناد وتسليم ${res.count} شحنة إلى شركة الشحن وتوليد البوالص بنجاح`
        : `Successfully dispatched ${res.count} shipments to carrier`
    );
    setSelectedShipmentIds([]);
  };

  const handleCreateShipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipmentData.recipientName || !newShipmentData.recipientPhone) {
      showToast(isAr ? "يرجى ملء بيانات المستلم ورقم الهاتف" : "Please enter recipient name and phone");
      return;
    }

    const carrier = carriers.find((c) => c.id === newShipmentData.carrierId) || carriers[0];
    const created = createShipment({
      orderId: newShipmentData.orderId || `ord-${Math.random().toString(36).slice(2, 7)}`,
      orderNumber: `NRX-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      carrierId: carrier.id,
      carrierName: carrier.nameAr,
      carrierLogo: carrier.logoUrl,
      storeId: "store-techcraft",
      storeName: newShipmentData.storeName,
      recipientName: newShipmentData.recipientName,
      recipientPhone: newShipmentData.recipientPhone,
      recipientCountry: newShipmentData.recipientCountry,
      recipientCity: newShipmentData.recipientCity,
      recipientAddress: newShipmentData.recipientAddress || "العنوان بالتفصيل",
      originCountry: newShipmentData.originCountry,
      originCity: newShipmentData.originCity,
      originWarehouse: newShipmentData.originWarehouse,
      packageWeightKg: Number(newShipmentData.packageWeightKg) || 1,
      dimensions: {
        length: Number(newShipmentData.length) || 20,
        width: Number(newShipmentData.width) || 15,
        height: Number(newShipmentData.height) || 10,
      },
      itemCount: Number(newShipmentData.itemCount) || 1,
      itemsList: newShipmentData.itemsList,
      declaredValue: Number(newShipmentData.declaredValue) || 1000,
      paymentType: newShipmentData.paymentType,
      codAmount: newShipmentData.paymentType === "cod" ? Number(newShipmentData.codAmount) : undefined,
      shippingSpeed: newShipmentData.shippingSpeed,
      status: "ready_to_ship",
      estimatedDelivery: isAr ? "خلال 1-3 أيام عمل" : "Within 1-3 business days",
      notes: newShipmentData.notes,
    });

    setShowCreateShipmentModal(false);
    setActiveShipmentId(created.id);
    setActiveTab("track");
    showToast(
      isAr
        ? `تم إنشاء بوليصة الشحن بنجاح برقم (${created.awbNumber})`
        : `Waybill created successfully with AWB (${created.awbNumber})`
    );
  };

  const handleRegisterCarrierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarrierData.nameAr || !newCarrierData.code) {
      showToast(isAr ? "يرجى كتابة اسم الشركة والرمز الكودي" : "Please provide carrier name and code");
      return;
    }

    const created = registerCarrier({
      nameAr: newCarrierData.nameAr,
      nameEn: newCarrierData.nameEn || newCarrierData.nameAr,
      code: newCarrierData.code.toUpperCase(),
      logoUrl:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=80",
      status: "active",
      type: newCarrierData.type,
      trackingUrlTemplate: newCarrierData.trackingUrlTemplate,
      supportedCountries: newCarrierData.supportedCountries.split(",").map((s) => s.trim()),
      baseCost: Number(newCarrierData.baseCost) || 50,
      perKgRate: Number(newCarrierData.perKgRate) || 15,
      slaDaysMin: Number(newCarrierData.slaDaysMin) || 1,
      slaDaysMax: Number(newCarrierData.slaDaysMax) || 3,
      onTimeRate: 99.0,
      hasLiveGps: true,
      contactPhone: newCarrierData.contactPhone,
      contactEmail: newCarrierData.contactEmail,
      descriptionAr: newCarrierData.descriptionAr,
      descriptionEn: newCarrierData.descriptionEn,
      apiKey: newCarrierData.apiKey,
      accountNumber: newCarrierData.accountNumber,
      integrationStatus: newCarrierData.apiKey ? "connected" : "pending_keys",
      apiEnvironment: "sandbox",
      requiresRealKeys: true,
      lastSyncAt: newCarrierData.apiKey ? "تم الربط الآن" : "بانتظار إدخال المفاتيح",
      lastTestSuccess: Boolean(newCarrierData.apiKey),
      lastTestMessage: newCarrierData.apiKey ? "تم حفظ بيانات الربط بنجاح" : "يرجى اختبار الاتصال",
      isOfficialPartner: true,
    });

    setShowRegisterCarrierModal(false);
    showToast(
      isAr
        ? `تم تسجيل شركة الشحن (${created.nameAr}) بنجاح وتفعيل الربط البرمجي API`
        : `Carrier (${created.nameEn}) registered successfully with live API`
    );
  };

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDriverModal || !driverFormData.name) return;
    assignShipmentDriver(showDriverModal.id, {
      name: driverFormData.name,
      phone: driverFormData.phone || "+966 50 000 0000",
      vehicle: driverFormData.vehicle || (isAr ? "مركبة توصيل مجهزة" : "Courier Van"),
    });
    setShowDriverModal(null);
    showToast(isAr ? "تم إسناد مندوب التوصيل وتحديث خط السير" : "Driver assigned successfully");
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStatusUpdateModal) return;
    updateShipmentStatus(
      showStatusUpdateModal.id,
      statusUpdateForm.status,
      statusUpdateForm.note,
      statusUpdateForm.location
    );
    setShowStatusUpdateModal(null);
    showToast(isAr ? "تم تحديث حالة الشحنة وإضافة نقطة تتبع جديدة" : "Shipment status updated with checkpoint");
  };

  // Helper status color badges
  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case "ready_to_ship":
        return {
          label: isAr ? "جاهز للشحن" : "Ready to Ship",
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          dot: "bg-amber-500",
        };
      case "picked_up":
        return {
          label: isAr ? "تم الاستلام" : "Picked Up",
          bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          dot: "bg-blue-500",
        };
      case "in_transit":
        return {
          label: isAr ? "في الطريق" : "In Transit",
          bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
          dot: "bg-indigo-500 animate-pulse",
        };
      case "out_for_delivery":
        return {
          label: isAr ? "مع المندوب للتسليم" : "Out for Delivery",
          bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
          dot: "bg-orange-500 animate-ping",
        };
      case "delivered":
        return {
          label: isAr ? "تم التسليم بنجاح" : "Delivered",
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          dot: "bg-emerald-500",
        };
      case "exception":
        return {
          label: isAr ? "تأخير / استثناء" : "Exception",
          bg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
          dot: "bg-red-500",
        };
      case "returned":
        return {
          label: isAr ? "مرتجع للمستودع" : "Returned",
          bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
          dot: "bg-slate-500",
        };
      default:
        return {
          label: status,
          bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
          dot: "bg-slate-500",
        };
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-amber-500 selection:text-white" dir={isAr ? "rtl" : "ltr"}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 start-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-surface/95 border border-line text-foreground text-xs font-bold shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Sparkles size={14} className="text-amber-500 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header Banner - Apple & Google Grade Clean Surface */}
      <section className="border-b border-line bg-surface/80 backdrop-blur-md pt-8 pb-7 sm:py-10">
        <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <Truck size={13} className="shrink-0" />
                <span>{isAr ? "منظومة الشحن والتتبع واللوجستيات العالمية" : "Global Logistics & Shipment Intelligence"}</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
                {isAr ? "إدارة الشحنات والتتبع المباشر" : "Shipment Hub & Live Tracking"}
              </h1>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {isAr
                  ? "مركز متكامل لتتبع مسار الطرود خطوة بخطوة بالرمز السري، وإصدار البوالص وإسناد السائقين لشركات الشحن العالمية."
                  : "End-to-end commerce logistics: real-time package tracking with OTP security, merchant fulfillment, and multi-carrier API integration."}
              </p>
            </div>

            {/* Premium Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowCreateShipmentModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>{isAr ? "إنشاء بوليصة شحن" : "New Waybill"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRegisterCarrierModal(true)}
                className="px-3.5 py-2 rounded-xl bg-surface-soft hover:bg-surface-muted active:scale-95 border border-line text-foreground font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Building2 size={14} className="text-amber-500" />
                <span>{isAr ? "تسجيل شركة شحن" : "Register Carrier"}</span>
              </button>
            </div>
          </div>

          {/* Segmented Navigation Tab Bar - Apple Style */}
          <div className="mt-6 flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface-soft border border-line overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("track")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "track"
                  ? "bg-surface text-foreground shadow-xs border border-line"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Navigation size={13} className={activeTab === "track" ? "text-amber-500" : ""} />
              <span>{isAr ? "تتبع الشحنة المباشر" : "Live Tracking"}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("merchant")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "merchant"
                  ? "bg-surface text-foreground shadow-xs border border-line"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Layers size={13} className={activeTab === "merchant" ? "text-amber-500" : ""} />
              <span>{isAr ? "إدارة شحنات التجار" : "Merchant Console"}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-surface-muted text-[10px] font-mono text-muted font-bold">
                {shipments.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("carriers")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "carriers"
                  ? "bg-surface text-foreground shadow-xs border border-line"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Building2 size={13} className={activeTab === "carriers" ? "text-amber-500" : ""} />
              <span>{isAr ? "شركات الشحن المعتمدة" : "Authorized Carriers"}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-surface-muted text-[10px] font-mono text-muted font-bold">
                {carriers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("calculator")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "calculator"
                  ? "bg-surface text-foreground shadow-xs border border-line"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Zap size={13} className={activeTab === "calculator" ? "text-amber-500" : ""} />
              <span>{isAr ? "حاسبة تكاليف الشحن" : "Rate Calculator"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 py-7">
        
        {/* ========================================================================= */}
        {/* TAB 1: LIVE SHOPPER PACKAGE TRACKING (تتبع الشحنة للمتسوق)                */}
        {/* ========================================================================= */}
        {activeTab === "track" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search Box & Quick Pills */}
            <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                    <Search size={16} className="text-amber-500" />
                    <span>{isAr ? "البحث والتتبع الفوري للشحنات" : "Instant Track by AWB / Phone / Order"}</span>
                  </h2>
                  <p className="text-xs text-muted">
                    {isAr
                      ? "أدخل رقم بوليصة الشحن (AWB)، رقم الطلب، أو رقم الهاتف المسجل لتتبع الشحنة فوراً"
                      : "Search by tracking number, order ID, or recipient mobile number"}
                  </p>
                </div>

                {/* Subscribed SMS Ping Simulation */}
                <button
                  type="button"
                  onClick={() => {
                    setSubscribedSms(!subscribedSms);
                    showToast(
                      !subscribedSms
                        ? isAr
                          ? "تم تفعيل إشعارات الواتساب والرسائل النصية SMS للتحديثات اللحظية"
                          : "Subscribed to live SMS & WhatsApp delivery updates"
                        : isAr
                        ? "تم إلغاء الاشتراك في الإشعارات"
                        : "Unsubscribed from SMS updates"
                    );
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    subscribedSms
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-surface-soft border-line text-muted hover:text-foreground"
                  }`}
                >
                  <MessageSquare size={13} className={subscribedSms ? "text-emerald-500" : "text-muted"} />
                  <span>{subscribedSms ? (isAr ? "إشعارات SMS مفعلة ✓" : "SMS Alerts Active ✓") : (isAr ? "تفعيل إشعارات SMS / واتساب" : "Enable SMS Alerts")}</span>
                </button>
              </div>

              {/* Clean Apple-style Input Bar */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? "مثال: AWB-NRX-994820-KSA أو NRX-2026-881920 أو 0501234567" : "e.g. AWB-NRX-994820-KSA or order ID"}
                  className="w-full h-11 px-3.5 ps-10 pe-24 rounded-2xl bg-surface-soft border border-line text-xs font-mono font-bold text-foreground placeholder:text-muted focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                />
                <Search size={16} className="absolute start-3.5 text-muted pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute end-20 text-[11px] font-bold text-muted hover:text-foreground px-2 py-1 cursor-pointer"
                  >
                    {isAr ? "مسح" : "Clear"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const match = getShipmentByAwb(searchQuery.trim());
                    if (match) {
                      setActiveShipmentId(match.id);
                      showToast(isAr ? "تم العثور على الشحنة بنجاح" : "Shipment found");
                    } else {
                      showToast(isAr ? "لم يتم العثور على شحنة بهذا الرقم" : "No shipment found with this ID");
                    }
                  }}
                  className="absolute end-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  {isAr ? "تتبع الآن" : "Track"}
                </button>
              </div>

              {/* Quick Sample Tracking Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                <span className="text-muted text-[11px] font-medium">{isAr ? "شحنات تجريبية سريعة:" : "Quick Samples:"}</span>
                {shipments.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery(s.awbNumber);
                      setActiveShipmentId(s.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      currentShipment?.id === s.id
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold"
                        : "bg-surface-soft border-line text-muted hover:text-foreground"
                    }`}
                  >
                    {s.awbNumber.split("-").slice(0, 3).join("-")} ({getStatusBadge(s.status).label})
                  </button>
                ))}
              </div>
            </div>

            {/* If Shipment Found: Interactive Visualizer */}
            {currentShipment ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left (8 Cols): Live Status Card, Interactive Stepper & Checkpoints */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Status Hero Card */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs space-y-6 relative overflow-hidden">
                    {/* Top Row: Carrier Logo, AWB, Copy & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-surface-soft border border-line p-2 flex items-center justify-center shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={currentShipment.carrierLogo || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100"}
                            alt={currentShipment.carrierName}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted font-bold">{currentShipment.carrierName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${getStatusBadge(currentShipment.status).bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${getStatusBadge(currentShipment.status).dot}`} />
                              {getStatusBadge(currentShipment.status).label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <h3 className="text-sm sm:text-base font-mono font-black text-foreground tracking-tight">
                              {currentShipment.awbNumber}
                            </h3>
                            <button
                              type="button"
                              onClick={() => handleCopyAwb(currentShipment.awbNumber)}
                              className="p-1 rounded-lg hover:bg-surface-soft text-muted hover:text-foreground transition-all cursor-pointer"
                              title={isAr ? "نسخ رقم التتبع" : "Copy AWB"}
                            >
                              {copiedAwb === currentShipment.awbNumber ? (
                                <Check size={13} className="text-emerald-500" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowWaybillModal(currentShipment)}
                          className="px-3 py-1.5 rounded-xl bg-surface-soft hover:bg-surface-muted text-foreground font-bold text-xs flex items-center gap-1.5 border border-line transition-all cursor-pointer"
                        >
                          <Printer size={13} className="text-amber-500" />
                          <span>{isAr ? "طباعة البوليصة" : "Waybill"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowStatusUpdateModal(currentShipment)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1.5 border border-amber-500/20 transition-all cursor-pointer"
                        >
                          <Sliders size={13} />
                          <span>{isAr ? "تحديث الحالة" : "Update"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Estimated Delivery & Security OTP Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Estimated Arrival Banner */}
                      <div className="p-4.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex flex-col justify-between space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
                          <Clock size={13} />
                          <span>{isAr ? "الموعد المقدر للتسليم:" : "Estimated Delivery Window:"}</span>
                        </div>
                        <div className="text-base font-black text-foreground">
                          {currentShipment.estimatedDelivery}
                        </div>
                        <div className="text-[11px] text-muted font-medium pt-1 border-t border-amber-500/10">
                          {isAr ? "من:" : "From:"} {currentShipment.originCity} ← {isAr ? "إلى:" : "To:"} {currentShipment.recipientCity}
                        </div>
                      </div>

                      {/* Security Delivery OTP Box */}
                      <div className="p-4.5 rounded-2xl bg-surface-soft border border-line flex flex-col justify-between space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted font-bold">
                            <Key size={13} className="text-amber-500" />
                            <span>{isAr ? "رمز الاستلام السري (OTP):" : "Security PIN (OTP):"}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                            {isAr ? "تسليم آمن" : "Secure"}
                          </span>
                        </div>
                        <div className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400 tracking-widest">
                          {currentShipment.deliveryOtp || "8821"}
                        </div>
                        <div className="text-[10px] text-muted leading-relaxed pt-1 border-t border-line">
                          {isAr ? "أعطِ هذا الرمز لمندوب التوصيل عند استلام الطرد لتأكيد التسليم" : "Provide this 4-digit code to the courier to confirm delivery"}
                        </div>
                      </div>
                    </div>

                    {/* 5-Step Visual Route Progress Bar */}
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-xs font-bold text-muted">
                        <span>{isAr ? "مستوى تقدم الشحن والتوزيع" : "Shipment Progress Pipeline"}</span>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-black">
                          {currentShipment.status === "delivered"
                            ? "100%"
                            : currentShipment.status === "out_for_delivery"
                            ? "80%"
                            : currentShipment.status === "in_transit"
                            ? "60%"
                            : currentShipment.status === "picked_up"
                            ? "35%"
                            : "15%"}
                        </span>
                      </div>

                      {/* Visual Steps */}
                      <div className="grid grid-cols-5 gap-2 relative">
                        {[
                          { id: "step-1", labelAr: "تجهيز البوليصة", labelEn: "Label Created", active: true },
                          { id: "step-2", labelAr: "استلام الطرد", labelEn: "Picked Up", active: ["picked_up", "in_transit", "out_for_delivery", "delivered"].includes(currentShipment.status) },
                          { id: "step-3", labelAr: "فرز ومحطات", labelEn: "In Transit", active: ["in_transit", "out_for_delivery", "delivered"].includes(currentShipment.status) },
                          { id: "step-4", labelAr: "مع المندوب", labelEn: "Out for Delivery", active: ["out_for_delivery", "delivered"].includes(currentShipment.status) },
                          { id: "step-5", labelAr: "تم التسليم", labelEn: "Delivered", active: currentShipment.status === "delivered" },
                        ].map((step, idx) => (
                          <div key={step.id} className="flex flex-col items-center text-center gap-1.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all ${
                                step.active
                                  ? "bg-amber-500 text-white shadow-xs ring-2 ring-amber-500/20"
                                  : "bg-surface-soft text-muted border border-line"
                              }`}
                            >
                              {step.active ? <Check size={14} /> : idx + 1}
                            </div>
                            <span className={`text-[10px] font-bold leading-tight ${step.active ? "text-foreground font-black" : "text-muted"}`}>
                              {isAr ? step.labelAr : step.labelEn}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Timeline Checkpoints */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-line pb-4">
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                          <MapPin size={16} className="text-amber-500" />
                          <span>{isAr ? "سجل المحطات ومسار الشحنة التفصيلي" : "Checkpoint Timeline"}</span>
                        </h3>
                        <p className="text-xs text-muted mt-0.5">
                          {isAr ? "تحديث فوري من أنظمة الفرز وأجهزة الماسح الضوئي للمناديب" : "Real-time updates from carrier hubs & courier scanners"}
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-surface-soft border border-line text-muted text-xs font-mono font-bold">
                        {currentShipment.checkpoints.length} {isAr ? "محطات" : "Checkpoints"}
                      </span>
                    </div>

                    {/* Timeline List */}
                    <div className="relative ps-5 space-y-4 border-s-2 border-line ms-2">
                      {currentShipment.checkpoints.map((cp, idx) => (
                        <div key={cp.id || idx} className="relative group">
                          {/* Indicator */}
                          <div
                            className={`absolute -start-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                              cp.current
                                ? "bg-amber-500 border-surface ring-4 ring-amber-500/20 scale-110"
                                : cp.passed
                                ? "bg-emerald-500 border-surface text-white"
                                : "bg-surface-soft border-line"
                            }`}
                          >
                            {cp.passed && !cp.current && <span className="w-1 h-1 rounded-full bg-white" />}
                            {cp.current && <span className="w-1 h-1 rounded-full bg-white animate-ping" />}
                          </div>

                          {/* Content Card */}
                          <div
                            className={`p-4 rounded-2xl border transition-all ${
                              cp.current
                                ? "bg-amber-500/5 border-amber-500/30 shadow-xs"
                                : "bg-surface-soft/60 border-line hover:border-line-strong"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                              <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                                <span>{isAr ? cp.titleAr : cp.titleEn}</span>
                                {cp.current && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-black">
                                    {isAr ? "المحطة الحالية" : "Current Hub"}
                                  </span>
                                )}
                              </h4>
                              <div className="text-[11px] font-mono text-muted">
                                {cp.timestamp}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold mt-1.5">
                              <MapPin size={12} />
                              <span>{isAr ? cp.locationAr : cp.locationEn}</span>
                            </div>

                            <p className="text-xs text-muted mt-1.5 leading-relaxed">
                              {isAr ? cp.detailsAr : cp.detailsEn}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right (4 Cols): Courier Profile, Package Specs & Recipient Info */}
                <div className="lg:col-span-4 space-y-5">
                  
                  {/* Courier / Driver Card */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-line pb-3">
                      <div className="flex items-center gap-2">
                        <UserCheck size={15} className="text-amber-500" />
                        <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                          {isAr ? "مندوب وكابتن التوصيل" : "Assigned Courier Driver"}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setDriverFormData({
                            name: currentShipment.driverName || "",
                            phone: currentShipment.driverPhone || "",
                            vehicle: currentShipment.driverVehicle || "",
                          });
                          setShowDriverModal(currentShipment);
                        }}
                        className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        {isAr ? "تعديل المندوب" : "Change"}
                      </button>
                    </div>

                    {currentShipment.driverName ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={currentShipment.driverAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                              alt={currentShipment.driverName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-black text-foreground">{currentShipment.driverName}</div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {isAr ? "متصل ومتاح للتوصيل" : "Online & Active"}
                            </div>
                            <div className="text-[11px] text-muted font-mono mt-0.5">
                              {currentShipment.driverVehicle || (isAr ? "مركبة مجهزة" : "Delivery Van")}
                            </div>
                          </div>
                        </div>

                        {/* Call & WhatsApp Quick Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={`tel:${currentShipment.driverPhone || "+966500000000"}`}
                            className="py-2 px-3 rounded-xl bg-surface-soft hover:bg-surface-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5 border border-line transition-all"
                          >
                            <Phone size={13} className="text-emerald-600 dark:text-emerald-400" />
                            <span>{isAr ? "اتصال" : "Call"}</span>
                          </a>

                          <a
                            href={`https://wa.me/${(currentShipment.driverPhone || "+966500000000").replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                          >
                            <MessageSquare size={13} />
                            <span>{isAr ? "واتساب" : "WhatsApp"}</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-surface-soft border border-line text-center space-y-2.5">
                        <Clock size={18} className="mx-auto text-muted" />
                        <p className="text-xs text-muted">
                          {isAr ? "جاري تعيين وتوجيه الكابتن للشحنة حسب خط السير" : "Assigning local route driver"}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setDriverFormData({ name: "", phone: "", vehicle: "" });
                            setShowDriverModal(currentShipment);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          {isAr ? "تعيين كابتن يدويًا" : "Assign Driver"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Recipient & Destination Info */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-line pb-3">
                      <MapPin size={15} className="text-amber-500" />
                      <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                        {isAr ? "بيانات المستلم وعنوان التسليم" : "Recipient & Destination"}
                      </h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-muted block text-[11px] font-medium">{isAr ? "المستلم:" : "Recipient:"}</span>
                        <strong className="text-foreground text-xs sm:text-sm font-black block mt-0.5">{currentShipment.recipientName}</strong>
                        <div className="text-muted font-mono text-[11px] mt-0.5">{currentShipment.recipientPhone}</div>
                      </div>

                      <div>
                        <span className="text-muted block text-[11px] font-medium">{isAr ? "عنوان التسليم:" : "Address:"}</span>
                        <div className="text-foreground font-medium mt-0.5">{currentShipment.recipientAddress}</div>
                        <div className="text-amber-600 dark:text-amber-400 font-bold text-[11px] mt-0.5">{currentShipment.recipientCity} - {currentShipment.recipientCountry}</div>
                      </div>

                      {currentShipment.notes && (
                        <div className="p-3 rounded-xl bg-surface-soft border border-line text-[11px] text-foreground">
                          <span className="text-amber-600 dark:text-amber-400 font-bold block mb-1">{isAr ? "ملاحظات التوصيل:" : "Delivery Note:"}</span>
                          {currentShipment.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Package Specs & Declared Value */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-line pb-3">
                      <Package size={15} className="text-amber-500" />
                      <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                        {isAr ? "مواصفات الطرد والشحنة" : "Package Specifications"}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-surface-soft border border-line">
                        <span className="text-muted block text-[10px] font-medium">{isAr ? "الوزن الفعلي:" : "Weight:"}</span>
                        <span className="font-mono font-bold text-foreground mt-0.5 block">{currentShipment.packageWeightKg} kg</span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-soft border border-line">
                        <span className="text-muted block text-[10px] font-medium">{isAr ? "الأبعاد (سم):" : "Dimensions:"}</span>
                        <span className="font-mono font-bold text-foreground mt-0.5 block">
                          {currentShipment.dimensions?.length}x{currentShipment.dimensions?.width}x{currentShipment.dimensions?.height}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-soft border border-line">
                        <span className="text-muted block text-[10px] font-medium">{isAr ? "طريقة الدفع:" : "Payment:"}</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 uppercase mt-0.5 block">
                          {currentShipment.paymentType === "cod" ? (isAr ? "دفع عند الاستلام (COD)" : "COD") : (isAr ? "مدفوع مسبقاً" : "Prepaid")}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-soft border border-line">
                        <span className="text-muted block text-[10px] font-medium">{isAr ? "القيمة المصرحة:" : "Declared Value:"}</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                          {formatPrice(currentShipment.declaredValue)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 text-xs">
                      <span className="text-muted block text-[11px] font-medium">{isAr ? "محتويات الطرد:" : "Package Contents:"}</span>
                      <p className="text-foreground font-medium text-[11px] mt-1">{currentShipment.itemsList}</p>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="p-10 rounded-3xl bg-surface border border-line text-center space-y-3">
                <Package size={36} className="mx-auto text-muted" />
                <h3 className="text-base font-bold text-foreground">{isAr ? "لم يتم العثور على شحنة مطابقة" : "No Shipment Found"}</h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  {isAr ? "تأكد من إدخال رقم بوليصة الشحن الصحيح أو اختر من الشحنات التجريبية أعلاه." : "Please verify the tracking number or select from sample shipments."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MERCHANT FULFILLMENT CONSOLE (إدارة شحنات التجار)                   */}
        {/* ========================================================================= */}
        {activeTab === "merchant" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-surface border border-line space-y-1 shadow-xs">
                <span className="text-xs text-muted block">{isAr ? "إجمالي الشحنات" : "Total Shipments"}</span>
                <span className="text-xl font-black text-foreground font-mono">{shipments.length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-line space-y-1 shadow-xs">
                <span className="text-xs text-amber-600 dark:text-amber-400 block">{isAr ? "جاهز للتسليم والشحن" : "Ready to Ship"}</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {shipments.filter((s) => s.status === "ready_to_ship").length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-line space-y-1 shadow-xs">
                <span className="text-xs text-blue-600 dark:text-blue-400 block">{isAr ? "في الطريق مع الناقل" : "In Transit"}</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {shipments.filter((s) => s.status === "in_transit" || s.status === "out_for_delivery").length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-line space-y-1 shadow-xs">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 block">{isAr ? "تم التسليم بنجاح" : "Delivered"}</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {shipments.filter((s) => s.status === "delivered").length}
                </span>
              </div>
            </div>

            {/* Controls, Filters & Bulk Dispatch Bar */}
            <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search in shipments */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={merchantSearch}
                    onChange={(e) => setMerchantSearch(e.target.value)}
                    placeholder={isAr ? "ابحث برقم البوليصة، اسم العميل، المدينة..." : "Search AWB, customer, city..."}
                    className="w-full h-9.5 px-3 ps-8.5 rounded-xl bg-surface-soft border border-line text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-amber-500"
                  />
                  <Search size={13} className="absolute start-2.5 top-3 text-muted pointer-events-none" />
                </div>

                {/* Status Filter Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {[
                    { id: "all", labelAr: "الكل", labelEn: "All" },
                    { id: "ready_to_ship", labelAr: "جاهز للتسليم", labelEn: "Ready" },
                    { id: "in_transit", labelAr: "في الطريق", labelEn: "In Transit" },
                    { id: "out_for_delivery", labelAr: "مع المندوب", labelEn: "Out for Delivery" },
                    { id: "delivered", labelAr: "تم التسليم", labelEn: "Delivered" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setMerchantStatusFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        merchantStatusFilter === filter.id
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-surface-soft border border-line text-muted hover:text-foreground"
                      }`}
                    >
                      {isAr ? filter.labelAr : filter.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Dispatch Action Bar (When shipments selected) */}
              {selectedShipmentIds.length > 0 && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 font-bold">
                    <CheckCircle2 size={15} className="text-amber-500" />
                    <span>
                      {isAr
                        ? `تم تحديد ${selectedShipmentIds.length} شحنة للإسناد المجمع`
                        : `${selectedShipmentIds.length} shipments selected`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted font-semibold">{isAr ? "إسناد للناقل:" : "Carrier:"}</span>
                    {carriers.slice(0, 3).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleBulkDispatch(c.id)}
                        className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer"
                      >
                        {c.code}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedShipmentIds([])}
                      className="px-2.5 py-1 rounded-xl bg-surface border border-line text-muted hover:text-foreground text-xs font-bold cursor-pointer"
                    >
                      {isAr ? "إلغاء التحديد" : "Deselect"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shipments Table / Grid */}
            <div className="rounded-3xl bg-surface border border-line shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-line bg-surface-soft/60 text-muted font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3.5 text-start w-10">
                        <input
                          type="checkbox"
                          checked={selectedShipmentIds.length === filteredMerchantShipments.length && filteredMerchantShipments.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedShipmentIds(filteredMerchantShipments.map((s) => s.id));
                            } else {
                              setSelectedShipmentIds([]);
                            }
                          }}
                          className="rounded border-line cursor-pointer accent-amber-500"
                        />
                      </th>
                      <th className="p-3.5 text-start">{isAr ? "رقم البوليصة والناقل" : "AWB & Carrier"}</th>
                      <th className="p-3.5 text-start">{isAr ? "المستلم والوجهة" : "Recipient & City"}</th>
                      <th className="p-3.5 text-start">{isAr ? "المحتويات والوزن" : "Items & Weight"}</th>
                      <th className="p-3.5 text-start">{isAr ? "الحالة" : "Status"}</th>
                      <th className="p-3.5 text-start">{isAr ? "الكابتن / المندوب" : "Driver"}</th>
                      <th className="p-3.5 text-end">{isAr ? "إجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line font-medium">
                    {filteredMerchantShipments.map((shp) => {
                      const isSelected = selectedShipmentIds.includes(shp.id);
                      const badge = getStatusBadge(shp.status);
                      return (
                        <tr key={shp.id} className="hover:bg-surface-soft/60 transition-colors">
                          <td className="p-3.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedShipmentIds([...selectedShipmentIds, shp.id]);
                                } else {
                                  setSelectedShipmentIds(selectedShipmentIds.filter((id) => id !== shp.id));
                                }
                              }}
                              className="rounded border-line cursor-pointer accent-amber-500"
                            />
                          </td>
                          <td className="p-3.5">
                            <div className="font-mono font-bold text-foreground text-xs">{shp.awbNumber}</div>
                            <div className="text-[11px] text-muted flex items-center gap-1">
                              <span>{shp.carrierName}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-foreground font-bold">{shp.recipientName}</div>
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">{shp.recipientCity} - {shp.recipientCountry}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-muted text-[11px] truncate max-w-[160px]">{shp.itemsList}</div>
                            <div className="text-muted font-mono text-[10px]">{shp.packageWeightKg} kg | {formatPrice(shp.declaredValue)}</div>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${badge.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {shp.driverName ? (
                              <div className="text-foreground text-xs font-bold">{shp.driverName}</div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setDriverFormData({ name: "", phone: "", vehicle: "" });
                                  setShowDriverModal(shp);
                                }}
                                className="text-amber-600 dark:text-amber-400 hover:underline text-[11px] font-bold cursor-pointer"
                              >
                                {isAr ? "+ إسناد مندوب" : "+ Assign"}
                              </button>
                            )}
                          </td>
                          <td className="p-3.5 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveShipmentId(shp.id);
                                  setSearchQuery(shp.awbNumber);
                                  setActiveTab("track");
                                }}
                                className="p-1.5 rounded-lg bg-surface-soft hover:bg-surface-muted text-muted hover:text-foreground transition-all cursor-pointer"
                                title={isAr ? "تتبع مباشر" : "Track"}
                              >
                                <Navigation size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setShowWaybillModal(shp)}
                                className="p-1.5 rounded-lg bg-surface-soft hover:bg-surface-muted text-amber-600 dark:text-amber-400 transition-all cursor-pointer"
                                title={isAr ? "طباعة البوليصة" : "Print Label"}
                              >
                                <Printer size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setShowStatusUpdateModal(shp)}
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-all cursor-pointer"
                                title={isAr ? "تحديث الحالة" : "Update State"}
                              >
                                <Sliders size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredMerchantShipments.length === 0 && (
                <div className="p-8 text-center text-muted text-xs">
                  {isAr ? "لا توجد شحنات مطابقة لخيارات التصفية" : "No shipments found for this filter"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CARRIER INTEGRATIONS & REGISTRY (دليل وشركات الشحن)               */}
        {/* ========================================================================= */}
        {activeTab === "carriers" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                    <Building2 size={16} className="text-amber-500" />
                    <span>{isAr ? "شبكة وشركات الشحن اللوجستية المعتمدة" : "Authorized Courier & Logistics Partners"}</span>
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    {isAr ? "ربط برمجيات حقيقي API" : "Live API Enabled"}
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {isAr
                    ? "إدارة مفاتيح الربط الحقيقية (API Keys & Secrets)، فحص الاتصال بالخوادم، ومزامنة إشعارات الـ Webhooks لتحديث الشحنات تلقائياً."
                    : "Manage live production and sandbox API credentials, run real-time handshake diagnostics, and configure status webhooks."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRegisterCarrierModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>{isAr ? "تسجيل شركة شحن جديدة" : "Add Partner"}</span>
              </button>
            </div>

            {/* Carriers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {carriers.map((carrier) => (
                <div
                  key={carrier.id}
                  className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4 relative overflow-hidden flex flex-col justify-between hover:border-line-strong transition-all"
                >
                  <div className="space-y-3.5">
                    {/* Header: Logo, Name, Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-surface-soft border border-line p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={carrier.logoUrl}
                            alt={carrier.nameAr}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-black text-foreground">{isAr ? carrier.nameAr : carrier.nameEn}</h3>
                          <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">[{carrier.code}]</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            carrier.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-surface-soft text-muted border-line"
                          }`}
                        >
                          {carrier.status === "active" ? (isAr ? "نشط ✓" : "Active") : (isAr ? "متوقف" : "Inactive")}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                            carrier.integrationStatus === "connected"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : carrier.integrationStatus === "sandbox"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              : carrier.integrationStatus === "error"
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                              : "bg-surface-soft text-muted border-line"
                          }`}
                        >
                          {carrier.integrationStatus === "connected"
                            ? isAr ? "API متصل حي" : "Live API"
                            : carrier.integrationStatus === "sandbox"
                            ? isAr ? "وضع تجريبي Sandbox" : "Sandbox"
                            : carrier.integrationStatus === "error"
                            ? isAr ? "خطأ في المفاتيح" : "API Error"
                            : isAr ? "بانتظار المفاتيح" : "Keys Required"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      {isAr ? carrier.descriptionAr : carrier.descriptionEn}
                    </p>

                    {/* Integration Credential Status */}
                    <div className="p-2.5 rounded-2xl bg-surface-soft border border-line text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted flex items-center gap-1">
                          <Key size={11} className="text-amber-500" />
                          <span>{isAr ? "حالة الربط البرمجي:" : "Integration Status:"}</span>
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {carrier.apiKey ? (isAr ? "تم إدخال المفتاح ✓" : "Key Configured") : (isAr ? "لم يتم الإدخال بعد" : "No Key Set")}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted truncate">
                        {carrier.lastTestMessage || (isAr ? "بانتظار تكوين مفاتيح الربط الحقيقية" : "Pending setup")}
                      </div>
                    </div>

                    {/* Stats Specs */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-surface-soft border border-line text-center text-xs">
                      <div>
                        <span className="text-muted block text-[10px]">{isAr ? "السعر الأساسي" : "Base Rate"}</span>
                        <span className="font-mono font-bold text-foreground">{formatPrice(carrier.baseCost)}</span>
                      </div>
                      <div>
                        <span className="text-muted block text-[10px]">{isAr ? "مدة التوصيل" : "SLA"}</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{carrier.slaDaysMin}-{carrier.slaDaysMax} {isAr ? "يوم" : "days"}</span>
                      </div>
                      <div>
                        <span className="text-muted block text-[10px]">{isAr ? "دقة الالتزام" : "On-Time"}</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{carrier.onTimeRate}%</span>
                      </div>
                    </div>

                    {/* Coverage Countries */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-muted font-bold block">{isAr ? "الدول المشمولة للتغطية:" : "Supported Regions:"}</span>
                      <div className="flex flex-wrap gap-1">
                        {carrier.supportedCountries.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-surface-soft border border-line text-muted text-[10px] font-bold">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action buttons */}
                  <div className="pt-3 border-t border-line flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        toggleCarrierStatus(carrier.id, carrier.status === "active" ? "inactive" : "active");
                        showToast(isAr ? "تم تحديث حالة تفعيل شركة الشحن" : "Carrier status toggled");
                      }}
                      className="text-xs font-bold text-muted hover:text-foreground cursor-pointer"
                    >
                      {carrier.status === "active" ? (isAr ? "إيقاف مؤقت" : "Deactivate") : (isAr ? "تفعيل" : "Activate")}
                    </button>

                    <button
                      type="button"
                      onClick={() => setManagingCarrier(carrier)}
                      className="px-3 py-1.5 rounded-xl bg-foreground text-background hover:opacity-90 active:scale-95 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Key size={12} className="text-amber-400" />
                      <span>{isAr ? "إدارة مفاتيح الربط" : "Manage API Keys"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SHIPPING RATE & TRANSIT CALCULATOR (حاسبة تكاليف وأسعار الشحن)     */}
        {/* ========================================================================= */}
        {activeTab === "calculator" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Left: Input Form */}
            <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs space-y-5">
              <div>
                <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" />
                  <span>{isAr ? "حاسبة تكاليف ورسوم الشحن الذكية" : "Shipping Rate & SLA Estimator"}</span>
                </h2>
                <p className="text-xs text-muted">
                  {isAr ? "قارن بين أفضل عروض شركات الشحن المعتمدة في ثوانٍ" : "Compare rates across all authorized carrier partners"}
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Origin Country */}
                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "بلد الانطلاق والشحن:" : "Origin Country:"}</label>
                  <select
                    value={calcOrigin}
                    onChange={(e) => setCalcOrigin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="المملكة العربية السعودية">المملكة العربية السعودية (KSA)</option>
                    <option value="مصر">مصر (Egypt)</option>
                    <option value="الإمارات">الإمارات (UAE)</option>
                    <option value="الكويت">الكويت (Kuwait)</option>
                    <option value="قطر">قطر (Qatar)</option>
                    <option value="الولايات المتحدة">الولايات المتحدة (USA)</option>
                  </select>
                </div>

                {/* Destination Country */}
                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "بلد الوصول والتسليم:" : "Destination Country:"}</label>
                  <select
                    value={calcDest}
                    onChange={(e) => setCalcDest(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="مصر">مصر (Egypt)</option>
                    <option value="المملكة العربية السعودية">المملكة العربية السعودية (KSA)</option>
                    <option value="الإمارات">الإمارات (UAE)</option>
                    <option value="الكويت">الكويت (Kuwait)</option>
                    <option value="قطر">قطر (Qatar)</option>
                    <option value="الولايات المتحدة">الولايات المتحدة (USA)</option>
                  </select>
                </div>

                {/* Package Weight */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-muted">{isAr ? "وزن الطرد الإجمالي (كجم):" : "Package Weight (kg):"}</label>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{calcWeight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="30"
                    step="0.5"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Speed Type */}
                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "سرعة ونوع الخدمة:" : "Service Speed:"}</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "standard", labelAr: "عادي", labelEn: "Standard" },
                      { id: "priority", labelAr: "أولوية", labelEn: "Priority" },
                      { id: "same_day", labelAr: "فوري", labelEn: "Same Day" },
                    ].map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => setCalcSpeed(sp.id as "standard" | "priority" | "same_day")}
                        className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          calcSpeed === sp.id
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-surface-soft border border-line text-muted hover:text-foreground"
                        }`}
                      >
                        {isAr ? sp.labelAr : sp.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Results Comparison Grid */}
            <div className="lg:col-span-2 space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-surface border border-line flex justify-between items-center text-xs shadow-xs">
                <span className="text-foreground font-bold">
                  {isAr ? `نتائج مقارنة الأسعار لوزن (${calcWeight} كجم):` : `Carrier Quotes for (${calcWeight} kg):`}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">
                  {calculatedQuotes.length} {isAr ? "خيارات متاحة" : "Options"}
                </span>
              </div>

              <div className="space-y-3">
                {calculatedQuotes.map((quote) => (
                  <div
                    key={quote.carrierId}
                    className="p-4 sm:p-5 rounded-2xl bg-surface border border-line hover:border-amber-500/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-surface-soft border border-line p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={quote.logoUrl} alt={quote.carrierName} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-foreground">{quote.carrierName}</h4>
                          {quote.isFastest && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-black">
                              {isAr ? "الأسرع ⚡" : "Fastest"}
                            </span>
                          )}
                          {quote.isCheapest && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-black">
                              {isAr ? "الأوفر 💰" : "Best Value"}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted mt-0.5">{quote.serviceType}</div>
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-0.5 flex items-center gap-1">
                          <Clock size={11} />
                          <span>{quote.deliveryEstimateDays}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 border-line pt-2.5 sm:pt-0">
                      <div className="text-base sm:text-lg font-black text-foreground font-mono">
                        {formatPrice(quote.costEgp)}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewShipmentData({
                            ...newShipmentData,
                            carrierId: quote.carrierId,
                            originCountry: calcOrigin,
                            recipientCountry: calcDest,
                            packageWeightKg: calcWeight,
                            shippingSpeed: calcSpeed,
                          });
                          setShowCreateShipmentModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                      >
                        {isAr ? "شحن بهذا السعر" : "Book Shipment"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW SHIPMENT & AIR WAYBILL (إنشاء بوليصة شحن جديدة)        */}
      {/* ========================================================================= */}
      {showCreateShipmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-surface border border-line rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-line pb-3.5">
              <div>
                <h3 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                  <Plus size={16} className="text-amber-500" />
                  <span>{isAr ? "إصدار بوليصة شحن جديدة (AWB)" : "Generate Air Waybill (AWB)"}</span>
                </h3>
                <p className="text-xs text-muted">
                  {isAr ? "أدخل تفاصيل المستلم والناقل لتوليد باركود التتبع الفوري" : "Enter recipient details and select courier partner"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateShipmentModal(false)}
                className="p-1.5 rounded-lg text-muted hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShipmentSubmit} className="space-y-3.5 text-xs">
              {/* Carrier Selection */}
              <div className="space-y-1">
                <label className="font-bold text-muted">{isAr ? "شركة الشحن الناقلة:" : "Carrier Partner:"}</label>
                <select
                  value={newShipmentData.carrierId}
                  onChange={(e) => setNewShipmentData({ ...newShipmentData, carrierId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-bold focus:outline-none focus:border-amber-500"
                >
                  {carriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameAr} - ({c.code}) - {formatPrice(c.baseCost)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "اسم المستلم بالكامل:" : "Recipient Name:"}</label>
                  <input
                    type="text"
                    required
                    value={newShipmentData.recipientName}
                    onChange={(e) => setNewShipmentData({ ...newShipmentData, recipientName: e.target.value })}
                    placeholder={isAr ? "مثال: عبد الله ناصر الشمري" : "Recipient Full Name"}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "رقم هاتف المستلم (واتساب):" : "Mobile Phone:"}</label>
                  <input
                    type="text"
                    required
                    value={newShipmentData.recipientPhone}
                    onChange={(e) => setNewShipmentData({ ...newShipmentData, recipientPhone: e.target.value })}
                    placeholder={isAr ? "مثال: +966 50 123 4567" : "+966 50 123 4567"}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Destination City & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "مدينة التسليم:" : "City:"}</label>
                  <input
                    type="text"
                    value={newShipmentData.recipientCity}
                    onChange={(e) => setNewShipmentData({ ...newShipmentData, recipientCity: e.target.value })}
                    placeholder={isAr ? "مثال: الرياض / القاهرة / دبي" : "City"}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "العنوان التفصيلي:" : "Full Address:"}</label>
                  <input
                    type="text"
                    value={newShipmentData.recipientAddress}
                    onChange={(e) => setNewShipmentData({ ...newShipmentData, recipientAddress: e.target.value })}
                    placeholder={isAr ? "الحي، الشارع، المبنى، رقم الشقة" : "Street, building, apartment"}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Weight, Items & Declared Value */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "الوزن (كجم):" : "Weight (kg):"}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newShipmentData.packageWeightKg}
                    onChange={(e) => setNewShipmentData({ ...newShipmentData, packageWeightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "طريقة التحصيل:" : "Payment:"}</label>
                  <select
                    value={newShipmentData.paymentType}
                    onChange={(e) => setNewShipmentData({ ...newShipmentData, paymentType: e.target.value as "prepaid" | "cod" })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="prepaid">{isAr ? "مدفوع مسبقاً (Prepaid)" : "Prepaid"}</option>
                    <option value="cod">{isAr ? "دفع عند الاستلام (COD)" : "COD"}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "القيمة المصرحة:" : "Declared Value:"}</label>
                  <input
                    type="number"
                    value={newShipmentData.declaredValue}
                    onChange={(e) => setNewShipmentData({ ...newShipmentData, declaredValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-1">
                <label className="font-bold text-muted">{isAr ? "وصف ومحتويات الطرد:" : "Package Contents:"}</label>
                <input
                  type="text"
                  value={newShipmentData.itemsList}
                  onChange={(e) => setNewShipmentData({ ...newShipmentData, itemsList: e.target.value })}
                  placeholder={isAr ? "مثال: طقم ساعات ذكية + ملحقات شاحن سريع" : "Contents description"}
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-line flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateShipmentModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface-soft text-muted hover:text-foreground font-bold text-xs cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Printer size={13} />
                  <span>{isAr ? "إصدار البوليصة فوراً" : "Generate Waybill"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REGISTER SHIPPING CARRIER (تسجيل شركة شحن معتمدة)                */}
      {/* ========================================================================= */}
      {showRegisterCarrierModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-surface border border-line rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-line pb-3.5">
              <div>
                <h3 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                  <Building2 size={16} className="text-amber-500" />
                  <span>{isAr ? "تسجيل شركة شحن وربط الـ API" : "Register Logistics Partner"}</span>
                </h3>
                <p className="text-xs text-muted">
                  {isAr ? "ربط مزود لوجستي جديد بالمنصة لتلقي طلبات الشحن وتتبع الطرود" : "Onboard a new courier to provide shipping rates and live webhooks"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterCarrierModal(false)}
                className="p-1.5 rounded-lg text-muted hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterCarrierSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "اسم شركة الشحن (بالعربي):" : "Carrier Name (AR):"}</label>
                  <input
                    type="text"
                    required
                    value={newCarrierData.nameAr}
                    onChange={(e) => setNewCarrierData({ ...newCarrierData, nameAr: e.target.value })}
                    placeholder={isAr ? "مثال: البريد السريع المتكامل" : "Carrier Name"}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "الكود التعريفي (Code):" : "Carrier Code:"}</label>
                  <input
                    type="text"
                    required
                    value={newCarrierData.code}
                    onChange={(e) => setNewCarrierData({ ...newCarrierData, code: e.target.value.toUpperCase() })}
                    placeholder={isAr ? "مثال: EXPRESS_KSA" : "EXPRESS_CODE"}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "التصنيف:" : "Type:"}</label>
                  <select
                    value={newCarrierData.type}
                    onChange={(e) => setNewCarrierData({ ...newCarrierData, type: e.target.value as CarrierType })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="domestic">{isAr ? "شحن محلي داخلي" : "Domestic"}</option>
                    <option value="international">{isAr ? "شحن دولي جوي" : "International"}</option>
                    <option value="platform_fleet">{isAr ? "أسطول المنصة المباشر" : "Platform Fleet"}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "السعر الأساسي:" : "Base Cost:"}</label>
                  <input
                    type="number"
                    value={newCarrierData.baseCost}
                    onChange={(e) => setNewCarrierData({ ...newCarrierData, baseCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "سعر الكيلو الإضافي:" : "Per Kg Rate:"}</label>
                  <input
                    type="number"
                    value={newCarrierData.perKgRate}
                    onChange={(e) => setNewCarrierData({ ...newCarrierData, perKgRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted">{isAr ? "الدول المشمولة (مفصولة بفواصل):" : "Supported Countries:"}</label>
                <input
                  type="text"
                  value={newCarrierData.supportedCountries}
                  onChange={(e) => setNewCarrierData({ ...newCarrierData, supportedCountries: e.target.value })}
                  placeholder="المملكة العربية السعودية, مصر, الإمارات"
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* API Credentials on Registration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-surface-soft border border-line">
                <div className="space-y-1">
                  <label className="font-bold text-muted flex items-center gap-1">
                    <Key size={12} className="text-amber-500" />
                    <span>{isAr ? "مفتاح الربط (API Key):" : "API Key:"}</span>
                  </label>
                  <input
                    type="text"
                    value={newCarrierData.apiKey}
                    onChange={(e) => setNewCarrierData({ ...newCarrierData, apiKey: e.target.value })}
                    placeholder="e.g. LIVE_OR_TEST_API_KEY"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-foreground font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted">{isAr ? "رقم الحساب التجاري (Account No):" : "Account Number:"}</label>
                  <input
                    type="text"
                    value={newCarrierData.accountNumber}
                    onChange={(e) => setNewCarrierData({ ...newCarrierData, accountNumber: e.target.value })}
                    placeholder="e.g. ARX-GCC-9901"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-foreground font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-line flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterCarrierModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface-soft text-muted hover:text-foreground font-bold text-xs cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>{isAr ? "تسجيل واعتماد الشركة" : "Register & Authorize"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: AIR WAYBILL & BARCODE PRINT MODAL (معاينة وطباعة البوليصة)       */}
      {/* ========================================================================= */}
      {showWaybillModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header: Carrier Logo & Barcode */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                    NX
                  </div>
                  <span className="font-black text-sm tracking-tight">NOORMEXA LOGISTICS</span>
                </div>
                <div className="text-xs text-slate-600 font-bold mt-0.5">
                  {showWaybillModal.carrierName}
                </div>
              </div>

              <div className="text-end">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">{isAr ? "بوليصة شحن جوي / بري" : "AIR WAYBILL (AWB)"}</span>
                <span className="font-mono font-black text-xs sm:text-sm text-slate-900">{showWaybillModal.awbNumber}</span>
              </div>
            </div>

            {/* Visual Barcode Simulator */}
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-center space-y-1.5">
              <div className="font-mono font-black text-xl sm:text-2xl tracking-[0.35em] py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 select-all">
                ||| | |||| || | ||||| || |||
              </div>
              <div className="font-mono text-[11px] font-bold text-slate-700">{showWaybillModal.awbNumber}</div>
            </div>

            {/* Sender & Receiver Info */}
            <div className="grid grid-cols-2 gap-3 text-xs border border-slate-200 p-3.5 rounded-2xl">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">{isAr ? "المرسل (المتجر):" : "SHIP FROM:"}</span>
                <strong className="text-slate-900 block">{showWaybillModal.storeName}</strong>
                <div className="text-slate-600 text-[11px]">{showWaybillModal.originWarehouse}</div>
                <div className="text-slate-600 font-bold">{showWaybillModal.originCity}, {showWaybillModal.originCountry}</div>
              </div>

              <div className="space-y-1 border-s border-slate-200 ps-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">{isAr ? "المستلم (العميل):" : "SHIP TO:"}</span>
                <strong className="text-slate-900 block">{showWaybillModal.recipientName}</strong>
                <div className="text-slate-600 text-[11px] font-mono">{showWaybillModal.recipientPhone}</div>
                <div className="text-slate-600 text-[11px]">{showWaybillModal.recipientAddress}</div>
                <div className="text-slate-900 font-black">{showWaybillModal.recipientCity}, {showWaybillModal.recipientCountry}</div>
              </div>
            </div>

            {/* Package Details & OTP Code */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block">{isAr ? "الوزن" : "WEIGHT"}</span>
                <span className="font-mono font-bold text-slate-900">{showWaybillModal.packageWeightKg} KG</span>
              </div>
              <div className="p-2.5 bg-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block">{isAr ? "الدفع" : "PAYMENT"}</span>
                <span className="font-bold text-amber-600 uppercase">
                  {showWaybillModal.paymentType === "cod" ? "COD" : "PREPAID"}
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                <span className="text-[10px] text-amber-400 font-bold block">{isAr ? "رمز الاستلام" : "OTP"}</span>
                <span className="font-mono font-black text-amber-400">{showWaybillModal.deliveryOtp || "7841"}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowWaybillModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-xs text-slate-700 cursor-pointer"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                  showToast(isAr ? "تم إرسال أمر الطباعة بنجاح" : "Printed successfully");
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer size={13} />
                <span>{isAr ? "طباعة البوليصة الحرارية (4x6)" : "Print (4x6)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ASSIGN DRIVER (إسناد مندوب توصيل)                                 */}
      {/* ========================================================================= */}
      {showDriverModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface border border-line rounded-3xl p-5 shadow-2xl space-y-3.5">
            <div className="flex justify-between items-center border-b border-line pb-2.5">
              <h3 className="text-xs sm:text-sm font-black text-foreground flex items-center gap-1.5">
                <UserCheck size={15} className="text-amber-500" />
                <span>{isAr ? "إسناد كابتن ومندوب توصيل" : "Assign Courier Driver"}</span>
              </h3>
              <button type="button" onClick={() => setShowDriverModal(null)} className="text-muted hover:text-foreground">✕</button>
            </div>

            <form onSubmit={handleDriverSubmit} className="space-y-2.5 text-xs">
              <div className="space-y-1">
                <label className="text-muted font-bold">{isAr ? "اسم الكابتن:" : "Driver Name:"}</label>
                <input
                  type="text"
                  required
                  value={driverFormData.name}
                  onChange={(e) => setDriverFormData({ ...driverFormData, name: e.target.value })}
                  placeholder={isAr ? "مثال: الكابتن محمد عبد الرحمن" : "Driver Name"}
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted font-bold">{isAr ? "رقم الهاتف / الواتساب:" : "Mobile Phone:"}</label>
                <input
                  type="text"
                  value={driverFormData.phone}
                  onChange={(e) => setDriverFormData({ ...driverFormData, phone: e.target.value })}
                  placeholder="+966 55 123 4567"
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted font-bold">{isAr ? "بيانات المركبة واللوحة:" : "Vehicle Details:"}</label>
                <input
                  type="text"
                  value={driverFormData.vehicle}
                  onChange={(e) => setDriverFormData({ ...driverFormData, vehicle: e.target.value })}
                  placeholder={isAr ? "فان تويوتا هايس - لوحة (أ ب ج 1234)" : "Toyota Van - ABC 1234"}
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2.5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDriverModal(null)}
                  className="px-3 py-1.5 rounded-xl bg-surface-soft text-muted font-bold text-xs cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {isAr ? "حفظ وإسناد" : "Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: STATUS & CHECKPOINT UPDATER (تحديث الحالة ونقطة التتبع)          */}
      {/* ========================================================================= */}
      {showStatusUpdateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface border border-line rounded-3xl p-5 shadow-2xl space-y-3.5">
            <div className="flex justify-between items-center border-b border-line pb-2.5">
              <h3 className="text-xs sm:text-sm font-black text-foreground flex items-center gap-1.5">
                <Sliders size={15} className="text-amber-500" />
                <span>{isAr ? "تحديث حالة الشحنة والمسار" : "Update Shipment State"}</span>
              </h3>
              <button type="button" onClick={() => setShowStatusUpdateModal(null)} className="text-muted hover:text-foreground">✕</button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-2.5 text-xs">
              <div className="space-y-1">
                <label className="text-muted font-bold">{isAr ? "الحالة الجديدة:" : "New State:"}</label>
                <select
                  value={statusUpdateForm.status}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, status: e.target.value as ShipmentStatus })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="ready_to_ship">{isAr ? "جاهز للشحن (Ready to Ship)" : "Ready to Ship"}</option>
                  <option value="picked_up">{isAr ? "تم الاستلام من المستودع (Picked Up)" : "Picked Up"}</option>
                  <option value="in_transit">{isAr ? "في الطريق بين المحطات (In Transit)" : "In Transit"}</option>
                  <option value="out_for_delivery">{isAr ? "مع المندوب للتسليم النهائي (Out for Delivery)" : "Out for Delivery"}</option>
                  <option value="delivered">{isAr ? "تم التسليم للعميل بنجاح (Delivered)" : "Delivered"}</option>
                  <option value="exception">{isAr ? "استثناء / تأجيل التسليم (Exception)" : "Exception"}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted font-bold">{isAr ? "موقع المحطة الحالية:" : "Current Location:"}</label>
                <input
                  type="text"
                  value={statusUpdateForm.location}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, location: e.target.value })}
                  placeholder={isAr ? "مثال: مركز فرز وتوزيع شمال الرياض" : "e.g. North Riyadh Hub"}
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted font-bold">{isAr ? "ملاحظات وتفاصيل التحديث:" : "Update Note:"}</label>
                <input
                  type="text"
                  value={statusUpdateForm.note}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, note: e.target.value })}
                  placeholder={isAr ? "مثال: تم فرز الشحنة وإسنادها لخط السير السريع" : "Checkpoint details"}
                  className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-line text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2.5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatusUpdateModal(null)}
                  className="px-3 py-1.5 rounded-xl bg-surface-soft text-muted font-bold text-xs cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {isAr ? "تحديث المسار فوراً" : "Update State"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: CARRIER API CREDENTIALS & INTEGRATION MANAGER                     */}
      {/* ========================================================================= */}
      {managingCarrier && (
        <CarrierIntegrationManager
          carrier={managingCarrier}
          isAr={isAr}
          onUpdate={(updates) => {
            updateCarrier(managingCarrier.id, updates);
            setManagingCarrier((prev) => (prev ? { ...prev, ...updates } : null));
          }}
          onClose={() => setManagingCarrier(null)}
          onToast={showToast}
        />
      )}

    </div>
  );
}

export default function ShippingLogisticsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-muted flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>جاري تحميل بيانات الشحن واللوجستيات...</span>
        </div>
      }
    >
      <ShippingLogisticsContent />
    </Suspense>
  );
}
