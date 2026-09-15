"use client";

import React, { useState, useMemo } from "react";
import {
  Globe2,
  MapPin,
  Building2,
  CheckCircle2,
  Sparkles,
  Coins,
  ChevronDown,
} from "lucide-react";
import {
  COUNTRIES_DATA,
  CountryRegionData,
  AdministrativeDivision,
  CityItem,
  getCountryByCode,
  getCountryByName,
} from "@/data/regionsData";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";

interface CascadingRegionDropdownsProps {
  onLocationSelected?: (info: {
    country: CountryRegionData;
    division?: AdministrativeDivision;
    city?: CityItem;
  }) => void;
  compact?: boolean;
}

export default function CascadingRegionDropdowns({
  onLocationSelected,
  compact = false,
}: CascadingRegionDropdownsProps) {
  const { isAr } = useLanguage();
  const { location, selectLocationFromHierarchy } = useLocation();

  const initialCountry = useMemo(() => {
    if (location.countryCode && getCountryByCode(location.countryCode)) {
      return getCountryByCode(location.countryCode)!;
    }
    const match = getCountryByName(location.countryAr || location.countryEn);
    return match || COUNTRIES_DATA[0];
  }, [location]);

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCountry.code);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(
    () => initialCountry.divisions[0]?.id || ""
  );
  const [selectedCityId, setSelectedCityId] = useState<string>(
    () => initialCountry.divisions[0]?.cities[0]?.id || ""
  );

  const activeCountry = useMemo(() => {
    return getCountryByCode(selectedCountryCode) || COUNTRIES_DATA[0];
  }, [selectedCountryCode]);

  const availableDivisions = useMemo(() => {
    return activeCountry.divisions || [];
  }, [activeCountry]);

  // Reset division & city when country changes
  const handleCountryChange = (newCode: string) => {
    setSelectedCountryCode(newCode);
    const country = getCountryByCode(newCode);
    if (country && country.divisions.length > 0) {
      const firstDiv = country.divisions[0];
      setSelectedDivisionId(firstDiv.id);
      setSelectedCityId(firstDiv.cities[0]?.id || "");
    } else {
      setSelectedDivisionId("");
      setSelectedCityId("");
    }
  };

  const activeDivision = useMemo(() => {
    return (
      availableDivisions.find((d) => d.id === selectedDivisionId) ||
      availableDivisions[0]
    );
  }, [availableDivisions, selectedDivisionId]);

  const availableCities = useMemo(() => {
    return activeDivision?.cities || [];
  }, [activeDivision]);

  const handleDivisionChange = (newDivId: string) => {
    setSelectedDivisionId(newDivId);
    const div = availableDivisions.find((d) => d.id === newDivId);
    if (div && div.cities.length > 0) {
      setSelectedCityId(div.cities[0].id);
    } else {
      setSelectedCityId("");
    }
  };

  const activeCity = useMemo(() => {
    return availableCities.find((c) => c.id === selectedCityId) || availableCities[0];
  }, [availableCities, selectedCityId]);

  const handleConfirm = () => {
    selectLocationFromHierarchy(selectedCountryCode, selectedDivisionId, selectedCityId);
    if (onLocationSelected && activeCountry) {
      onLocationSelected({
        country: activeCountry,
        division: activeDivision,
        city: activeCity,
      });
    }
  };

  return (
    <div
      id="cascading-location-selector"
      className={`rounded-2xl border border-slate-800 bg-slate-900/90 ${
        compact ? "p-3 space-y-3" : "p-4 sm:p-5 space-y-4 shadow-xl"
      }`}
    >
      {/* Title & Badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Globe2 size={16} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <span>{isAr ? "التحديد بالتقسيم الإداري الرسمي" : "Administrative Cascading Selector"}</span>
              <span className="text-[10px] bg-orange-500/20 text-orange-300 font-bold px-1.5 py-0.5 rounded border border-orange-500/30">
                {isAr ? "دقيق وفوري" : "Instant"}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {isAr
                ? "اختر الدولة ⬅️ الجهة أو المحافظة ⬅️ المدينة لضبط العملة والتوصيل تلقائياً"
                : "Select Country ⬅️ Region/State ⬅️ City to synchronize shipping & currency"}
            </p>
          </div>
        </div>

        {/* Active Currency Badge */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
          <Coins size={13} className="text-amber-400" />
          <span className="text-[11px] text-slate-300 font-bold">
            {isAr ? "عملة الدولة:" : "Country Currency:"}
          </span>
          <span className="text-[11px] font-mono font-black text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
            {activeCountry?.currency}
          </span>
        </div>
      </div>

      {/* 3 Cascading Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Dropdown 1: Country */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
            <span>{isAr ? "1. الدولة" : "1. Country"}</span>
            <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <select
              id="cascading-country-select"
              value={selectedCountryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full appearance-none bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-8 pl-8 transition-colors cursor-pointer"
            >
              {COUNTRIES_DATA.map((country) => (
                <option key={country.code} value={country.code} className="bg-slate-900 text-white py-1">
                  {country.flag} {isAr ? country.nameAr : country.nameEn} ({country.currency})
                </option>
              ))}
            </select>
            <div className="absolute start-2.5 top-3 text-base pointer-events-none">
              {activeCountry.flag}
            </div>
            <div className="absolute end-2.5 top-3 text-slate-400 pointer-events-none">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Dropdown 2: Division (Region / Governorate / Emirate) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
            <span>2. {isAr ? activeCountry.divisionLabelAr : activeCountry.divisionLabelEn}</span>
            <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <select
              id="cascading-division-select"
              value={selectedDivisionId}
              onChange={(e) => handleDivisionChange(e.target.value)}
              disabled={availableDivisions.length === 0}
              className="w-full appearance-none bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-8 pl-8 transition-colors cursor-pointer disabled:opacity-50"
            >
              {availableDivisions.map((div) => (
                <option key={div.id} value={div.id} className="bg-slate-900 text-white py-1">
                  {isAr ? div.nameAr : div.nameEn}
                </option>
              ))}
            </select>
            <div className="absolute start-2.5 top-3 text-slate-400 pointer-events-none">
              <Building2 size={14} />
            </div>
            <div className="absolute end-2.5 top-3 text-slate-400 pointer-events-none">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Dropdown 3: City */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
            <span>{isAr ? "3. المدينة / المركز" : "3. City / Area"}</span>
            <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <select
              id="cascading-city-select"
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              disabled={availableCities.length === 0}
              className="w-full appearance-none bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-8 pl-8 transition-colors cursor-pointer disabled:opacity-50"
            >
              {availableCities.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white py-1">
                  {isAr ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>
            <div className="absolute start-2.5 top-3 text-orange-400 pointer-events-none">
              <MapPin size={14} />
            </div>
            <div className="absolute end-2.5 top-3 text-slate-400 pointer-events-none">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Card & Apply Button */}
      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">
              {isAr ? "الوجهة المختارة:" : "Selected Destination:"}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-white">
                {activeCity ? (isAr ? activeCity.nameAr : activeCity.nameEn) : ""}
              </span>
              <span className="text-[11px] text-slate-400">
                • {activeDivision ? (isAr ? activeDivision.nameAr : activeDivision.nameEn) : ""}
              </span>
              <span className="text-[11px] text-slate-300 font-bold">
                ({activeCountry.flag} {isAr ? activeCountry.nameAr : activeCountry.nameEn})
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          id="confirm-cascading-location-btn"
          onClick={handleConfirm}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles size={14} />
          <span>
            {isAr
              ? `اعتماد الوجهة وتحديث الموقع للعملة (${activeCountry.currency})`
              : `Apply Location & Switch to (${activeCountry.currency})`}
          </span>
        </button>
      </div>
    </div>
  );
}
