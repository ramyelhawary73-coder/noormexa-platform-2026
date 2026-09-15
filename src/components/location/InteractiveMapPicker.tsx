"use client";

import React, { useState, useCallback } from "react";
import {
  MapPin,
  LocateFixed,
  Search,
  Check,
  Navigation,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import {
  reverseGeocodeCoordinates,
  getNearestFulfillmentHub,
  CITY_COORDINATES_DB,
  LatLng,
  DetectedLocation,
} from "@/lib/locationService";

interface InteractiveMapPickerProps {
  onLocationConfirmed?: (loc: DetectedLocation) => void;
}

export default function InteractiveMapPicker({ onLocationConfirmed }: InteractiveMapPickerProps) {
  const { isAr } = useLanguage();
  const { location, selectMapCoordinates, isLocating, locatingType, detectGps } = useLocation();

  // Active pin coordinates (default to current location)
  const [pinCoords, setPinCoords] = useState<LatLng>(() => ({
    lat: location.lat || 33.5731, // Default Casablanca or current
    lng: location.lng || -7.5898,
  }));

  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Address details resolved from coordinates
  const [resolvedAddress, setResolvedAddress] = useState<{
    formatted: string;
    city: string;
    region?: string;
    country: string;
    countryCode: string;
    currency: string;
    street?: string;
    district?: string;
  }>(() => ({
    formatted: location.formattedAddress || `${location.cityAr}، ${location.countryAr}`,
    city: isAr ? location.cityAr : location.cityEn,
    region: isAr ? location.regionAr : location.regionEn,
    country: isAr ? location.countryAr : location.countryEn,
    countryCode: location.countryCode || "MA",
    currency: location.currency || "MAD",
    street: location.street,
    district: location.district,
  }));

  // Reverse geocode when pin moves (debounced)
  const fetchAddressForCoords = useCallback(
    async (lat: number, lng: number) => {
      setIsReverseGeocoding(true);
      try {
        const rev = await reverseGeocodeCoordinates(lat, lng, isAr ? "ar" : "en");
        setResolvedAddress({
          formatted: rev.formattedAddress || `${rev.cityAr}، ${rev.countryAr}`,
          city: isAr ? rev.cityAr : rev.cityEn,
          region: rev.region || rev.governorate,
          country: isAr ? rev.countryAr : rev.countryEn,
          countryCode: rev.countryCode,
          currency: rev.currency,
          street: rev.street,
          district: rev.district,
        });
      } catch {
        // Fallback gracefully
        setResolvedAddress((prev) => ({
          ...prev,
          formatted: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
        }));
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [isAr]
  );

  // Nearest fulfillment hub for calculated pin
  const nearestHub = getNearestFulfillmentHub(pinCoords);

  // Handle map click / move
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate delta from center in pixels
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = (x - centerX) / (rect.width / 2);
    const deltaY = (y - centerY) / (rect.height / 2);

    // Approximate coordinate shift based on zoom level
    const factor = 0.05 / Math.pow(2, zoomLevel - 11);
    const newLat = Number((pinCoords.lat - deltaY * factor).toFixed(5));
    const newLng = Number((pinCoords.lng + deltaX * factor).toFixed(5));

    setPinCoords({ lat: newLat, lng: newLng });
    fetchAddressForCoords(newLat, newLng);
  };

  // Search place
  const handleSearchPlace = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    // Check in predefined cities
    const found = Object.values(CITY_COORDINATES_DB).find(
      (c) =>
        c.cityAr.toLowerCase().includes(q) ||
        c.cityEn.toLowerCase().includes(q) ||
        q.includes(c.cityAr.toLowerCase()) ||
        q.includes(c.cityEn.toLowerCase())
    );

    if (found) {
      setPinCoords({ lat: found.lat, lng: found.lng });
      fetchAddressForCoords(found.lat, found.lng);
      setSearchFeedback(null);
      setZoomLevel(13);
    } else {
      setSearchFeedback(
        isAr ? "لم نجد المدينة بالاسم المحدد، يمكنك تحديد موقعك على الخريطة مباشرة أو عبر GPS" : "City not found in quick list. Click on the map or use GPS."
      );
    }
  };

  // Live GPS Capture
  const handleCaptureLiveGps = async () => {
    const success = await detectGps(true);
    if (success && location.lat && location.lng) {
      setPinCoords({ lat: location.lat, lng: location.lng });
      fetchAddressForCoords(location.lat, location.lng);
      setZoomLevel(15);
    }
  };

  // Confirm and Save
  const handleConfirmLocation = async () => {
    const updated = await selectMapCoordinates(pinCoords.lat, pinCoords.lng);
    if (onLocationConfirmed) {
      onLocationConfirmed(updated);
    }
  };

  return (
    <div id="interactive-map-picker-container" className="space-y-4">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <form onSubmit={handleSearchPlace} className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchFeedback(null);
            }}
            placeholder={
              isAr
                ? "ابحث عن موقع (الدار البيضاء، الرباط، مراكش، القاهرة، الرياض...)"
                : "Search location (Casablanca, Rabat, Marrakech, Cairo, Riyadh...)"
            }
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 pl-9 pr-9"
          />
          <Search size={14} className="absolute start-3 top-2.5 text-slate-400" />
          <button
            type="submit"
            className="absolute end-1.5 top-1.5 px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold cursor-pointer transition-colors"
          >
            {isAr ? "انتقال" : "Go"}
          </button>
        </form>

        {/* Live GPS Capture Button */}
        <button
          type="button"
          onClick={handleCaptureLiveGps}
          disabled={isLocating}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-900/30 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <LocateFixed size={14} className={isLocating && locatingType === "gps" ? "animate-spin" : ""} />
          <span>{isLocating ? (isAr ? "جاري الالتقاط..." : "Locating...") : (isAr ? "التقاط موقعي بدقة (GPS)" : "Live GPS Pinpoint")}</span>
        </button>
      </div>

      {searchFeedback && (
        <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
          {searchFeedback}
        </p>
      )}

      {/* Interactive Map Canvas Stage */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner h-64 sm:h-80 select-none">
        {/* Real OpenStreetMap Tile Map Background via Iframe / Slippy Tiles */}
        <iframe
          title="Interactive Pinpoint Map"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${pinCoords.lng - 0.04}%2C${pinCoords.lat - 0.03}%2C${pinCoords.lng + 0.04}%2C${pinCoords.lat + 0.03}&layer=mapnik&marker=${pinCoords.lat}%2C${pinCoords.lng}`}
          className="w-full h-full border-0 pointer-events-none opacity-90 contrast-125"
        />

        {/* Clickable Overlay to capture clicks anywhere on the map */}
        <div
          onClick={handleMapClick}
          className="absolute inset-0 cursor-crosshair z-10"
          title={isAr ? "انقر في أي مكان لتغيير مكان المؤشر" : "Click anywhere to move pin"}
        />

        {/* Center Target Crosshair & Floating Pin Animation */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="relative -top-5 flex flex-col items-center animate-bounce">
            {/* Ping animation under pin */}
            <div className="w-8 h-8 rounded-full bg-orange-500/30 animate-ping absolute -bottom-1" />
            <div className="p-2.5 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 text-white shadow-xl shadow-orange-500/40 border-2 border-white ring-4 ring-orange-500/20">
              <MapPin size={22} className="fill-white" />
            </div>
            <div className="w-2.5 h-1 bg-black/50 rounded-full blur-[1px] mt-1" />
          </div>
        </div>

        {/* Top Control Badges */}
        <div className="absolute top-3 start-3 z-30 flex items-center gap-2 pointer-events-auto">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-slate-300 shadow">
            <span>Lat: {pinCoords.lat.toFixed(4)}°</span>
            <span className="mx-1">•</span>
            <span>Lng: {pinCoords.lng.toFixed(4)}°</span>
          </div>

          {isReverseGeocoding && (
            <div className="px-2.5 py-1 rounded-lg bg-orange-500/90 text-white text-[10px] font-bold animate-pulse shadow">
              {isAr ? "جاري قراءة العنوان..." : "Resolving address..."}
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="absolute end-3 top-3 z-30 flex flex-col gap-1 pointer-events-auto">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(18, z + 1))}
            className="w-7 h-7 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center cursor-pointer transition-colors shadow"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(5, z - 1))}
            className="w-7 h-7 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center cursor-pointer transition-colors shadow"
          >
            <ZoomOut size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              setPinCoords({ lat: 33.5731, lng: -7.5898 });
              fetchAddressForCoords(33.5731, -7.5898);
            }}
            title={isAr ? "إعادة الضبط" : "Reset"}
            className="w-7 h-7 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center cursor-pointer transition-colors shadow"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Instructions pill overlay */}
        <div className="absolute bottom-3 inset-x-3 z-30 flex items-center justify-center pointer-events-none">
          <div className="px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-[11px] text-slate-300 shadow-lg flex items-center gap-1.5">
            <Navigation size={12} className="text-orange-400 shrink-0" />
            <span>{isAr ? "انقر على أي نقطة في الخريطة لتثبيت مؤشر التوصيل" : "Click anywhere on the map to set delivery pin"}</span>
          </div>
        </div>
      </div>

      {/* Real-time Address Card & Logistics Details */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {isAr ? "العنوان المحدد عبر الخريطة:" : "Pinned Delivery Address:"}
            </span>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-sm sm:text-base font-black text-white">
                {resolvedAddress.city}
                {resolvedAddress.region ? `، ${resolvedAddress.region}` : ""}
                {resolvedAddress.country ? ` (${resolvedAddress.country})` : ""}
              </span>
              <span className="text-[10px] font-bold bg-orange-500/20 border border-orange-500/40 text-orange-300 px-2 py-0.5 rounded-md">
                {resolvedAddress.currency}
              </span>
            </div>
            {resolvedAddress.formatted && (
              <p className="text-xs text-slate-300 mt-1">
                {resolvedAddress.formatted}
              </p>
            )}
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            id="confirm-map-pin-btn"
            onClick={handleConfirmLocation}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Check size={16} />
            <span>{isAr ? "تأكيد هذا الموقع كعنوان للتوصيل" : "Confirm Pin as Delivery Destination"}</span>
          </button>
        </div>

        {/* Nearest Logistics Fulfillment Hub Info */}
        {nearestHub && (
          <div className="pt-2.5 border-t border-slate-700/80 flex items-center justify-between gap-3 text-xs text-slate-400 flex-wrap">
            <div className="flex items-center gap-2">
              <Truck size={14} className="text-cyan-400 shrink-0" />
              <span>
                {isAr ? "أقرب محطة توزيع لوجستية:" : "Nearest Logistics Hub:"}{" "}
                <strong className="text-slate-200">{isAr ? nearestHub.nameAr : nearestHub.nameEn}</strong>{" "}
                ({isAr ? nearestHub.cityAr : nearestHub.cityEn})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
              <ShieldCheck size={13} />
              <span>{nearestHub.code} • {isAr ? "شحن سريع ومباشر" : "Express Hub Dispatch"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
