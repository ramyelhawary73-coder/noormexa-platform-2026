"use client";

import React, { useState, useMemo } from "react";
import {
  MapPin,
  LocateFixed,
  Search,
  Check,
  AlertTriangle,
  X,
  ShieldCheck,
  Navigation,
  Globe2,
  Wifi,
  ChevronRight,
  Info,
} from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { useLanguage } from "@/context/LanguageContext";

export default function LocationSelectorModal() {
  const { isAr } = useLanguage();
  const {
    location,
    isLocating,
    locatingType,
    permissionState,
    feedback,
    clearFeedback,
    isModalOpen,
    closeLocationModal,
    detectGps,
    detectIp,
    selectPopularDestination,
    selectCityByName,
    popularDestinations,
    cityList,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>("ALL");

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return Object.entries(cityList)
      .filter(([key, item]) => {
        return (
          key.includes(q) ||
          item.cityAr.toLowerCase().includes(q) ||
          item.cityEn.toLowerCase().includes(q) ||
          item.countryAr.toLowerCase().includes(q) ||
          item.countryEn.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [searchQuery, cityList]);

  // Countries for tab filter
  const countryFilters = [
    { code: "ALL", labelAr: "الكل", labelEn: "All" },
    { code: "SA", labelAr: "🇸🇦 السعودية", labelEn: "🇸🇦 Saudi" },
    { code: "EG", labelAr: "🇪🇬 مصر", labelEn: "🇪🇬 Egypt" },
    { code: "AE", labelAr: "🇦🇪 الإمارات", labelEn: "🇦🇪 UAE" },
    { code: "KW", labelAr: "🇰🇼 الكويت", labelEn: "🇰🇼 Kuwait" },
    { code: "QA", labelAr: "🇶🇦 قطر", labelEn: "🇶🇦 Qatar" },
    { code: "GLOBAL", labelAr: "🌍 دولي", labelEn: "🌍 Global" },
  ];

  const filteredDestinations = useMemo(() => {
    if (selectedCountryFilter === "ALL") return popularDestinations;
    if (selectedCountryFilter === "GLOBAL") {
      return popularDestinations.filter((d) => !["SA", "EG", "AE", "KW", "QA"].includes(d.countryCode));
    }
    return popularDestinations.filter((d) => d.countryCode === selectedCountryFilter);
  }, [selectedCountryFilter, popularDestinations]);

  if (!isModalOpen) return null;

  return (
    <div
      id="location-selector-backdrop"
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLocationModal();
      }}
    >
      <div
        id="location-selector-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
        className="bg-slate-900 border border-slate-700/80 text-slate-100 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <MapPin size={20} className="animate-bounce" />
            </div>
            <div>
              <h2 id="location-modal-title" className="text-base sm:text-lg font-black text-white">
                {isAr ? "تحديد وجهة التوصيل والموقع الجغرافي" : "Select Delivery Destination & Geolocation"}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? "حدد مدينتك لعرض أوقات الشحن والتوصيل الدقيقة والأسعار المحلية"
                  : "Choose your city for accurate shipping times, logistics hubs, and local pricing"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeLocationModal}
            aria-label={isAr ? "إغلاق" : "Close"}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 max-h-[calc(92vh-140px)]">
          {/* Real-Time Visual Feedback / Toast Banner */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 ${
                feedback.type === "success"
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                  : feedback.type === "warning"
                  ? "bg-amber-950/60 border-amber-500/40 text-amber-200"
                  : feedback.type === "error"
                  ? "bg-red-950/60 border-red-500/40 text-red-200"
                  : "bg-cyan-950/60 border-cyan-500/40 text-cyan-200"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {feedback.type === "success" ? (
                  <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : feedback.type === "warning" ? (
                  <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Info size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">{feedback.title}</h4>
                  <p className="text-[11px] sm:text-xs opacity-90 mt-0.5">{feedback.message}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearFeedback}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Currently Active Detected Location Card */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <Navigation size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  {isAr ? "الوجهة المحددة حالياً للتوصيل:" : "Current Delivery Destination:"}
                </span>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <span className="text-sm sm:text-base font-black text-white">
                    {isAr ? location.cityAr : location.cityEn}، {isAr ? location.countryAr : location.countryEn}
                  </span>
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      location.source === "gps"
                        ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                        : location.source === "ip"
                        ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                        : location.source === "city_lookup"
                        ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                        : "bg-slate-700 border border-slate-600 text-slate-300"
                    }`}
                  >
                    {location.source === "gps" ? (
                      <>
                        <LocateFixed size={10} className="text-emerald-400" />
                        <span>GPS فضائي {location.accuracyMeters ? `(±${Math.round(location.accuracyMeters)}m)` : ""}</span>
                      </>
                    ) : location.source === "ip" ? (
                      <>
                        <Wifi size={10} className="text-cyan-400" />
                        <span>تقدير شبكة IP</span>
                      </>
                    ) : location.source === "city_lookup" ? (
                      <>
                        <MapPin size={10} className="text-amber-400" />
                        <span>مدينة مختارة</span>
                      </>
                    ) : (
                      <>
                        <Globe2 size={10} />
                        <span>افتراضي</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-mono bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              {location.currency}
            </span>
          </div>

          {/* Action 1: GPS Real Detection Button & IP Geolocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Live GPS Detection Button with Auto Fallback */}
            <button
              type="button"
              onClick={() => detectGps(true)}
              disabled={isLocating}
              className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-start"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                  <LocateFixed size={20} className={isLocating && locatingType === "gps" ? "animate-spin" : ""} />
                </div>
                <div>
                  <span className="block font-black">
                    {isLocating && locatingType === "gps"
                      ? isAr ? "جاري التقاط إشارة GPS..." : "Acquiring GPS Signal..."
                      : isAr ? "تحديد موقعي الدقيق عبر GPS" : "Detect My Live GPS Location"}
                  </span>
                  <span className="text-[11px] text-white/80 block">
                    {isAr ? "دقة عالية (تحويل تلقائي لـ IP عند الحظر)" : "High accuracy (auto IP fallback if blocked)"}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className={isAr ? "rotate-180" : ""} />
            </button>

            {/* IP Geolocation Button */}
            <button
              type="button"
              onClick={() => detectIp()}
              disabled={isLocating}
              className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 text-start group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Wifi size={18} className={isLocating && locatingType === "ip" ? "animate-pulse" : ""} />
                </div>
                <div>
                  <span className="block font-bold text-white">
                    {isLocating && locatingType === "ip"
                      ? isAr ? "جاري فحص الشبكة..." : "Detecting via IP..."
                      : isAr ? "كشف الموقع عبر شبكة الإنترنت" : "Detect via IP Network"}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {isAr ? "بدون طلب إذن وصول (تقديري)" : "Zero-permission estimate"}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className={isAr ? "rotate-180 text-slate-400" : "text-slate-400"} />
            </button>
          </div>

          {/* Permission Blocked Guide & Fallback Banner */}
          {permissionState === "denied" && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm">
                    {isAr ? "تم رفض إذن GPS — تم تطبيق التحديد التقديري عبر الإنترنت (IP)" : "GPS Permission Blocked — Operating on IP Fallback"}
                  </span>
                  <p className="text-[11px] text-amber-200/90 mt-0.5">
                    {isAr
                      ? "إذا أردت دقة GPS عالية، انقر على رمز القفل 🔒 بجانب الرابط في شريط عنوان المتصفح ⬅️ فعّل 'الموقع الجغرافي' ثم انقر إعادة المحاولة."
                      : "To enable precise GPS, click the lock icon 🔒 in your browser address bar ➡️ Turn on 'Location' and retry."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => detectGps(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-xs shrink-0 transition-colors cursor-pointer"
              >
                {isAr ? "إعادة محاولة GPS" : "Retry GPS"}
              </button>
            </div>
          )}

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              {isAr ? "أو ابحث عن مدينتك / محافظتك:" : "Or search for your city/province:"}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? "اكتب اسم المدينة (مثل: الرياض، القاهرة، دبي، الإسكندرية...)" : "Type city name (e.g. Riyadh, Cairo, Dubai, London...)"}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 pl-10 pr-10"
              />
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-1.5 space-y-1 shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      selectCityByName(item.cityAr);
                      setSearchQuery("");
                    }}
                    className="w-full px-3 py-2 rounded-lg text-start text-xs flex items-center justify-between hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-orange-400" />
                      <span className="font-bold">{isAr ? item.cityAr : item.cityEn}</span>
                      <span className="text-slate-400 text-[11px]">({isAr ? item.countryAr : item.countryEn})</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      {item.currency}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Select Popular Destinations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                {isAr ? "الوجهات الأكثر طلباً في الشرق الأوسط والعالم:" : "Popular Middle Eastern & Global Destinations:"}
              </span>
            </div>

            {/* Country Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {countryFilters.map((tab) => (
                <button
                  key={tab.code}
                  type="button"
                  onClick={() => setSelectedCountryFilter(tab.code)}
                  className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                    selectedCountryFilter === tab.code
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  {isAr ? tab.labelAr : tab.labelEn}
                </button>
              ))}
            </div>

            {/* Destination Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredDestinations.map((dest) => {
                const isSelected =
                  location.cityAr === dest.cityAr ||
                  location.cityEn.toLowerCase() === dest.cityEn.toLowerCase();

                return (
                  <button
                    key={dest.key}
                    type="button"
                    onClick={() => selectPopularDestination(dest)}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-orange-500/15 border-orange-500/60 text-white shadow-sm ring-1 ring-orange-500/40"
                        : "bg-slate-800/60 border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-base">{dest.flagEmoji}</span>
                      {isSelected && <Check size={14} className="text-orange-400 font-bold" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-white">
                        {isAr ? dest.cityAr : dest.cityEn}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {isAr ? dest.countryAr : dest.countryEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>{isAr ? "البيانات محمية ومشفرة وفق معايير الخصوصية" : "Privacy Protected & End-to-End Secure"}</span>
          </div>

          <button
            type="button"
            onClick={closeLocationModal}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            {isAr ? "حفظ وإغلاق" : "Save & Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
