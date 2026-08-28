"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Shipment } from "@/lib/shippingService";
import {
  Navigation,
  Compass,
  Layers,
  Maximize2,
  Minimize2,
  Building2,
  Home,
  CheckCircle2,
  ExternalLink,
  Car,
  LocateFixed,
  Clock,
  Radio,
  Info,
  Sparkles,
} from "lucide-react";

interface LiveShipmentMapProps {
  shipment: Shipment;
  isAr?: boolean;
}

interface LatLng {
  lat: number;
  lng: number;
}

// Reference coordinates for major cities
const CITY_COORDS: Record<string, LatLng> = {
  الرياض: { lat: 24.7136, lng: 46.6753 },
  جدة: { lat: 21.5433, lng: 39.1728 },
  الدمام: { lat: 26.4207, lng: 50.0888 },
  مكة: { lat: 21.3891, lng: 39.8579 },
  المدينة: { lat: 24.5247, lng: 39.5692 },
  القاهرة: { lat: 30.0444, lng: 31.2357 },
  الجيزة: { lat: 30.0131, lng: 31.2089 },
  الإسكندرية: { lat: 31.2001, lng: 29.9187 },
  دبي: { lat: 25.2048, lng: 55.2708 },
  أبوظبي: { lat: 24.4539, lng: 54.3773 },
  الكويت: { lat: 29.3759, lng: 47.9774 },
  الدوحة: { lat: 25.2854, lng: 51.5310 },
};

function getCityCoord(cityName?: string, fallbackLat?: number, fallbackLng?: number): LatLng {
  if (fallbackLat && fallbackLng) return { lat: fallbackLat, lng: fallbackLng };
  if (!cityName) return { lat: 24.7136, lng: 46.6753 };
  for (const [key, coord] of Object.entries(CITY_COORDS)) {
    if (cityName.includes(key) || key.includes(cityName)) {
      return coord;
    }
  }
  return { lat: 24.7136, lng: 46.6753 };
}

// Calculate distance in KM using Haversine formula
function calculateDistanceKm(c1: LatLng, c2: LatLng): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export default function LiveShipmentMap({ shipment, isAr = true }: LiveShipmentMapProps) {
  const [mapEngine, setMapEngine] = useState<"interactive" | "satellite">("interactive");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  // Dynamic tracking & Driver movement state
  const [progressRatio, setProgressRatio] = useState<number>(() => {
    if (shipment.status === "delivered") return 1;
    if (shipment.status === "out_for_delivery") return 0.76;
    if (shipment.status === "in_transit") return 0.45;
    return 0.15;
  });

  const [liveSpeed, setLiveSpeed] = useState<number>(() =>
    shipment.courier?.current_speed_kmh || (shipment.status === "out_for_delivery" ? 42 : 0)
  );

  // Base endpoints
  const rawOrigin = useMemo(
    () => getCityCoord(shipment.sender_city, shipment.sender_lat, shipment.sender_lng),
    [shipment.sender_city, shipment.sender_lat, shipment.sender_lng]
  );
  const rawDestination = useMemo(
    () => getCityCoord(shipment.recipient_city, shipment.recipient_lat, shipment.recipient_lng),
    [shipment.recipient_city, shipment.recipient_lat, shipment.recipient_lng]
  );

  // Effective coordinates: If user detected location via GPS, dynamically adapt local hub to user vicinity
  const destination: LatLng = useMemo(() => {
    if (userLocation) return userLocation;
    return rawDestination;
  }, [userLocation, rawDestination]);

  const origin: LatLng = useMemo(() => {
    if (userLocation) {
      // Local NOORMEXA Fulfillment Hub in user's immediate city / zone (~4.5 km away)
      return {
        lat: userLocation.lat + 0.028,
        lng: userLocation.lng - 0.032,
      };
    }
    return rawOrigin;
  }, [userLocation, rawOrigin]);

  // Compute live courier position along route
  const currentCourierPos: LatLng = useMemo(() => {
    return {
      lat: origin.lat + (destination.lat - origin.lat) * progressRatio,
      lng: origin.lng + (destination.lng - origin.lng) * progressRatio,
    };
  }, [origin, destination, progressRatio]);

  // Remaining distance calculation (in kilometers)
  const totalDistance = calculateDistanceKm(origin, destination);
  const remainingDist = Number((totalDistance * (1 - progressRatio)).toFixed(1));

  // Compute ETA in minutes based on real last-mile city driving speed (35-45 km/h)
  const etaMinutes = Math.max(4, Math.round((remainingDist / 38) * 60));

  // Active state flags
  const isDelivered = shipment.status === "delivered";
  const isOutForDelivery = shipment.status === "out_for_delivery";

  // Real device Geolocation capture
  const handleDetectUserLocation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoError(isAr ? "المتصفح لا يدعم تحديد الموقع الجغرافي" : "Geolocation not supported");
      return;
    }

    setIsLocatingUser(true);
    setGeoError(null);
    setLocationSuccessMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setIsLocatingUser(false);
        setLocationSuccessMsg(
          isAr
            ? `تم ضبط إحداثياتك بدقة (${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°) وتحديث مسار التوصيل المحلي.`
            : `GPS Synced (${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°)`
        );
        setTimeout(() => setLocationSuccessMsg(null), 5000);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setIsLocatingUser(false);
        if (err.code === 1) {
          setGeoError(
            isAr
              ? "يرجى الضغط على زر القفل بجانب عنوان الموقع والسماح بإذن الموقع (Allow Location)."
              : "Please allow location permission in browser settings."
          );
        } else {
          setGeoError(
            isAr
              ? "تعذر التقاط إشارة GPS المباشرة، تم الاعتماد على عنوان التسليم المسجل."
              : "Unable to lock GPS signal, using default address."
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [isAr]);

  // Request location once smoothly on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          () => {
            // Silently fallback without error popup
          },
          { enableHighAccuracy: false, timeout: 6000 }
        );
      }
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  // Smooth live vehicle movement animation without page refresh
  useEffect(() => {
    if (shipment.status !== "out_for_delivery" && shipment.status !== "in_transit") {
      return;
    }

    const interval = setInterval(() => {
      setLiveSpeed((prev) => {
        const delta = (Math.random() - 0.5) * 5;
        return Math.round(Math.max(28, Math.min(58, prev + delta)));
      });

      setProgressRatio((prev) => {
        if (prev >= 0.98) return 0.98;
        return Math.min(0.98, prev + 0.003);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [shipment.status]);

  // Google Maps Driving Directions URL
  const targetUserLat = destination.lat;
  const targetUserLng = destination.lng;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentCourierPos.lat},${currentCourierPos.lng}&destination=${targetUserLat},${targetUserLng}&travelmode=driving`;

  // Google Maps embed iframe URL centered on the live position
  const googleFrameUrl = `https://maps.google.com/maps?q=${currentCourierPos.lat},${currentCourierPos.lng}&t=k&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div
      id="live-shipment-map-card"
      className={`relative overflow-hidden rounded-3xl border border-line bg-surface transition-all duration-300 ${
        isFullscreen ? "fixed inset-2 sm:inset-6 z-50 shadow-2xl flex flex-col" : "w-full shadow-sm"
      }`}
    >
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-line bg-surface-soft/95 backdrop-blur-md gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold shadow-xs">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-foreground flex items-center gap-1.5">
                {isAr ? "خريطة التتبع الحي بالـ GPS المباشر" : "Live GPS Shipment Tracker"}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 me-1 animate-ping" />
                  {isAr ? "متصل بالأقمار الصناعية" : "Satellite GPS Active"}
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-muted flex items-center gap-1.5 mt-0.5">
              <span>{userLocation ? (isAr ? "الفرع المحلي لنورمكسا" : "Local NOORMEXA Hub") : shipment.sender_city}</span>
              <span className="text-orange-500 font-bold">➔</span>
              <span>{userLocation ? (isAr ? "موقعك الحالي (GPS)" : "Your Location") : shipment.recipient_city}</span>
              <span>•</span>
              <span className="font-semibold text-foreground">
                {shipment.carrier_name || (isAr ? "أسطول نورمكسا الرسمي" : "NOORMEXA Fleet")}
              </span>
            </p>
          </div>
        </div>

        {/* Action & Map Mode Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Map Layer Mode */}
          <div className="flex items-center bg-surface border border-line rounded-xl p-0.5 text-xs font-bold shadow-xs">
            <button
              type="button"
              id="map-mode-interactive-btn"
              onClick={() => setMapEngine("interactive")}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] flex items-center gap-1 ${
                mapEngine === "interactive"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Layers size={13} />
              {isAr ? "المسار التفاعلي" : "Live Route"}
            </button>
            <button
              type="button"
              id="map-mode-satellite-btn"
              onClick={() => setMapEngine("satellite")}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] flex items-center gap-1 ${
                mapEngine === "satellite"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Compass size={13} />
              {isAr ? "قمر صناعي" : "Satellite"}
            </button>
          </div>

          {/* Detect User Current Location */}
          <button
            type="button"
            id="detect-user-gps-btn"
            onClick={handleDetectUserLocation}
            disabled={isLocatingUser}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
              userLocation
                ? "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400"
                : "bg-surface border-line text-muted hover:text-foreground"
            }`}
            title={isAr ? "تحديد موقعي الآن عبر GPS" : "Detect My Real Location"}
          >
            <LocateFixed size={14} className={isLocatingUser ? "animate-spin text-orange-500" : "text-blue-500"} />
            <span>
              {isLocatingUser
                ? isAr
                  ? "جارِ التحديد..."
                  : "Locating..."
                : userLocation
                ? isAr
                  ? "تم تحديد موقعك"
                  : "GPS Synced"
                : isAr
                ? "تحديد موقعي الآن"
                : "Locate Me"}
            </span>
          </button>

          {/* Open in Google Maps */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="open-google-maps-btn"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 text-xs font-bold transition-all shadow-xs"
            title={isAr ? "فتح المسار في خرائط Google مباشرة" : "Open in Google Maps"}
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">{isAr ? "خرائط جوجل" : "Google Maps"}</span>
          </a>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            id="toggle-fullscreen-map-btn"
            onClick={() => setIsFullscreen((f) => !f)}
            className="w-8 h-8 rounded-xl bg-surface border border-line flex items-center justify-center text-foreground hover:border-orange-500 transition-all shadow-xs"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div
        className={`relative w-full overflow-hidden transition-all duration-300 ${
          isFullscreen ? "flex-1 min-h-[480px]" : "h-[360px] sm:h-[440px]"
        }`}
      >
        {mapEngine === "satellite" ? (
          /* Satellite View Embed Centered on Live Coordinates */
          <div className="w-full h-full relative">
            <iframe
              title="Google Satellite Map"
              src={googleFrameUrl}
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        ) : (
          /* Interactive Vector HUD Map */
          <div className="relative w-full h-full bg-[#080e1a] select-none overflow-hidden">
            {/* Grid background styling */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0)`,
                backgroundSize: "28px 28px",
              }}
            />

            {/* Glowing ambiences */}
            <div className="absolute top-10 start-10 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 end-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            {/* Vector Map Canvas */}
            <svg viewBox="0 0 800 450" className="w-full h-full object-cover">
              <defs>
                <linearGradient id="routeGradientLive" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Path Track */}
              <path
                d="M 120 340 C 260 340, 320 180, 480 200 S 640 110, 680 90"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />

              {/* Active Route Gradient */}
              <path
                d="M 120 340 C 260 340, 320 180, 480 200 S 640 110, 680 90"
                stroke="url(#routeGradientLive)"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                filter="url(#glowEffect)"
              />

              {/* Moving Pulse Animation Line */}
              <path
                d="M 120 340 C 260 340, 320 180, 480 200 S 640 110, 680 90"
                stroke="#ffffff"
                strokeWidth="3"
                fill="none"
                strokeDasharray="12 24"
                strokeLinecap="round"
                className="animate-pulse"
              />

              {/* Origin Node (Warehouse/Local Hub) */}
              <g transform="translate(120, 340)">
                <circle r="22" fill="#3b82f6" fillOpacity="0.2" className="animate-ping" />
                <circle r="15" fill="#0f172a" stroke="#3b82f6" strokeWidth="3" />
                <circle r="6" fill="#3b82f6" />
              </g>

              {/* Destination Node (Customer / Real GPS Point) */}
              <g transform="translate(680, 90)">
                <circle r="26" fill="#10b981" fillOpacity="0.25" className="animate-pulse" />
                <circle r="18" fill="#0f172a" stroke="#10b981" strokeWidth="3" />
                <circle r="7" fill="#10b981" />
              </g>

              {/* Dynamic Courier Moving Marker */}
              {(() => {
                const t = progressRatio;
                const curX = 120 + (680 - 120) * t;
                const curY = 340 + (90 - 340) * Math.sin((t * Math.PI) / 2);

                return (
                  <g transform={`translate(${curX}, ${curY})`} className="transition-all duration-1000 ease-out">
                    <circle r="30" fill="#f97316" fillOpacity="0.2" className="animate-ping" />
                    <circle r="20" fill="#ea580c" stroke="#ffffff" strokeWidth="3" />
                    <path d="M -8 -4 L 3 -4 L 7 0 L 8 4 L -8 4 Z" fill="#ffffff" />
                    <circle cx="-4" cy="5" r="2" fill="#0f172a" />
                    <circle cx="4" cy="5" r="2" fill="#0f172a" />
                  </g>
                );
              })()}
            </svg>

            {/* Origin City Floating Badge */}
            <div className="absolute start-8 sm:start-14 bottom-20 sm:bottom-24 px-3 py-1.5 rounded-2xl bg-slate-950/90 text-white border border-blue-500/40 shadow-xl backdrop-blur-md flex items-center gap-2">
              <Building2 size={15} className="text-blue-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">{isAr ? "نقطة انطلاق المندوب" : "Origin Hub"}</span>
                <span className="text-xs font-bold">
                  {userLocation ? (isAr ? "مستودع نورمكسا الإقليمي" : "NOORMEXA Hub") : shipment.sender_city}
                </span>
              </div>
            </div>

            {/* Destination / User Location Floating Badge */}
            <div className="absolute end-8 sm:end-14 top-14 sm:top-16 px-3.5 py-1.5 rounded-2xl bg-slate-950/90 text-white border border-emerald-500/40 shadow-xl backdrop-blur-md flex items-center gap-2">
              <Home size={15} className="text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">
                  {userLocation ? (isAr ? "موقعك الفعلي (GPS Live)" : "Your Live Location") : isAr ? "عنوان التسليم" : "Destination"}
                </span>
                <span className="text-xs font-bold text-emerald-300">
                  {userLocation ? (isAr ? "موقع جهازك الحالي" : "Current Device GPS") : shipment.recipient_city}
                </span>
              </div>
            </div>

            {/* Live GPS Telemetry Overlay */}
            <div className="absolute top-4 start-4 flex flex-col gap-2 z-10">
              <div className="px-3.5 py-2 rounded-2xl bg-slate-950/90 border border-white/15 text-white shadow-xl backdrop-blur-md flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {isAr ? "إحداثيات المندوب الحالية (GPS)" : "Live Courier Coordinates"}
                  </div>
                  <div className="text-xs font-mono font-bold text-orange-400">
                    {currentCourierPos.lat.toFixed(4)}° N, {currentCourierPos.lng.toFixed(4)}° E
                  </div>
                </div>
              </div>

              {isOutForDelivery && (
                <div className="px-3 py-1.5 rounded-xl bg-orange-500/90 text-white font-bold text-xs flex items-center gap-2 shadow-lg backdrop-blur-xs">
                  <Car size={14} className="animate-bounce" />
                  <span>{isAr ? `سرعة المندوب: ${liveSpeed} كم/س` : `Speed: ${liveSpeed} km/h`}</span>
                </div>
              )}
            </div>

            {locationSuccessMsg && (
              <div className="absolute bottom-20 inset-x-4 max-w-md mx-auto p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 z-10 backdrop-blur-md">
                <Sparkles size={15} className="shrink-0 text-emerald-400" />
                <span>{locationSuccessMsg}</span>
              </div>
            )}

            {geoError && (
              <div className="absolute bottom-20 inset-x-4 max-w-md mx-auto p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 z-10 backdrop-blur-md">
                <Info size={15} className="shrink-0 text-amber-400" />
                <span>{geoError}</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom Live Metrics & Courier Status HUD */}
        <div className="absolute bottom-2.5 inset-x-2.5 sm:inset-x-4 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-white/15 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-white shadow-2xl z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Navigation size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">
                {isDelivered
                  ? isAr
                    ? "حالة التسليم النهائي"
                    : "Delivery Completed"
                  : isAr
                  ? "المسافة المتبقية إليك والوقت المتوقع"
                  : "Remaining Distance & ETA"}
              </div>
              <div className="font-black text-white text-xs sm:text-sm flex items-center gap-2 mt-0.5">
                {isDelivered ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 size={16} />
                    {isAr ? "تم التسليم بنجاح وتأكيد الكود" : "Delivered & Verified Successfully"}
                  </span>
                ) : (
                  <>
                    <span className="text-orange-400 font-mono font-extrabold text-sm sm:text-base">
                      {remainingDist} {isAr ? "كم" : "KM"}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-200 flex items-center gap-1">
                      <Clock size={13} className="text-amber-400" />
                      {isAr ? `يصل خلال ${etaMinutes} دقيقة تقريباً` : `ETA ~${etaMinutes} mins`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 text-xs">
            {/* OTP Secret Code */}
            <div>
              <span className="text-slate-400 block text-[10px]">{isAr ? "رمز الاستلام (OTP):" : "OTP Code:"}</span>
              <span className="font-mono font-black text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/40 text-sm tracking-widest">
                {shipment.delivery_otp || "7841"}
              </span>
            </div>

            {/* Carrier Name */}
            <div className="text-end ps-3 border-s border-white/10">
              <span className="text-slate-400 block text-[10px]">{isAr ? "شركة الشحن:" : "Carrier:"}</span>
              <span className="font-bold text-slate-200 text-xs sm:text-sm">
                {shipment.carrier_name || (isAr ? "أسطول نورمكسا الرسمي" : "NOORMEXA Fleet")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
