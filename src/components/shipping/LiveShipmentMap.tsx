"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

interface LiveShipmentMapProps {
  shipment: Shipment;
  isAr?: boolean;
}

export default function LiveShipmentMap({ shipment, isAr = true }: LiveShipmentMapProps) {
  const [mapStyle, setMapStyle] = useState<"nav" | "satellite" | "minimal">("nav");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [liveSpeed, setLiveSpeed] = useState<number>(() =>
    shipment.courier?.current_speed_kmh || (shipment.status === "out_for_delivery" ? 44 : 0)
  );
  const [driverOffset, setDriverOffset] = useState({ x: 0, y: 0 });

  // Subtle live driver telemetry pulse animation
  useEffect(() => {
    if (shipment.status !== "out_for_delivery" && shipment.status !== "in_transit") {
      return;
    }

    const interval = setInterval(() => {
      // Simulate subtle speed variations
      setLiveSpeed((prev) => {
        const delta = (Math.random() - 0.5) * 6;
        const next = Math.max(25, Math.min(68, prev + delta));
        return Math.round(next);
      });

      // Simulate micro GPS movement
      setDriverOffset((prev) => ({
        x: prev.x + (Math.random() - 0.48) * 1.2,
        y: prev.y + (Math.random() - 0.52) * 1.2,
      }));
    }, 2400);

    return () => clearInterval(interval);
  }, [shipment.status]);

  const isDelivered = shipment.status === "delivered";
  const isOutForDelivery = shipment.status === "out_for_delivery";
  const isInTransit = shipment.status === "in_transit";

  // Coordinates normalized inside our interactive SVG map viewport (600 x 340)
  const originPoint = { x: 90, y: 260, name: shipment.sender_city, label: isAr ? "المستودع الرئيسي" : "Origin Hub" };
  const transitHub = { x: 250, y: 170, name: "محطة الفرز المركزية", label: isAr ? "مركز الفرز" : "Transit Hub" };
  const courierLivePos = {
    x: isDelivered ? 510 : isOutForDelivery ? 410 + driverOffset.x : 250,
    y: isDelivered ? 80 : isOutForDelivery ? 120 + driverOffset.y : 170,
  };
  const destinationPoint = {
    x: 510,
    y: 80,
    name: shipment.recipient_city,
    label: isAr ? "عنوان العميل" : "Destination",
  };

  // Route path bezier curve
  const routePath = `M ${originPoint.x} ${originPoint.y} Q ${originPoint.x + 80} ${originPoint.y - 60}, ${transitHub.x} ${transitHub.y} T ${destinationPoint.x} ${destinationPoint.y}`;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-line bg-surface transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : "w-full shadow-sm"
      }`}
    >
      {/* Top Map Header & Controls */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-surface-soft/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
            <Compass size={18} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-foreground">
                {isAr ? "الخريطة المباشرة والتتبع الجغرافي الحي" : "Live GPS Telemetry & Route Map"}
              </h3>
              {isOutForDelivery && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {isAr ? "تتبع مباشر نشط" : "Live GPS Active"}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted">
              {shipment.sender_city} ⬅️ {shipment.recipient_city} | {shipment.carrier_name}
            </p>
          </div>
        </div>

        {/* Map Control Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Map Style Selector */}
          <div className="hidden sm:flex items-center bg-surface border border-line rounded-xl p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setMapStyle("nav")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapStyle === "nav" ? "bg-orange-500 text-white shadow-xs" : "text-muted hover:text-foreground"
              }`}
            >
              {isAr ? "ملاحة" : "Nav"}
            </button>
            <button
              type="button"
              onClick={() => setMapStyle("satellite")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapStyle === "satellite" ? "bg-orange-500 text-white shadow-xs" : "text-muted hover:text-foreground"
              }`}
            >
              {isAr ? "قمر صناعي" : "Satellite"}
            </button>
            <button
              type="button"
              onClick={() => setMapStyle("minimal")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapStyle === "minimal" ? "bg-orange-500 text-white shadow-xs" : "text-muted hover:text-foreground"
              }`}
            >
              {isAr ? "رادار" : "Radar"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setZoomLevel((z) => (z === 1 ? 1.25 : 1))}
            className="w-8 h-8 rounded-xl bg-surface border border-line flex items-center justify-center text-foreground hover:border-orange-500 transition-all"
            title={isAr ? "تكبير/تصغير الخريطة" : "Zoom Map"}
          >
            <Layers size={14} />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            className="w-8 h-8 rounded-xl bg-surface border border-line flex items-center justify-center text-foreground hover:border-orange-500 transition-all"
            title={isFullscreen ? (isAr ? "تصغير" : "Exit Fullscreen") : (isAr ? "ملء الشاشة" : "Fullscreen")}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div
        className={`relative w-full overflow-hidden transition-all duration-300 ${
          isFullscreen ? "h-[calc(100vh-140px)]" : "h-[300px] sm:h-[380px]"
        } ${
          mapStyle === "satellite"
            ? "bg-[#0b1b2b]"
            : mapStyle === "minimal"
            ? "bg-[#0a0f18]"
            : "bg-[#0f172a] dark:bg-[#080d1a]"
        }`}
      >
        {/* Visual Map Grid & Road Lines Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Decorative Ambient Radial Glow */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* SVG Route & Topology */}
        <svg
          viewBox="0 0 600 340"
          className="w-full h-full object-cover select-none transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Gradient for the active route line */}
            <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>

            {/* Glowing filter for courier */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* City Grid Road Meshes (Stylized Roads) */}
          <path
            d="M 50 120 L 550 120 M 120 40 L 120 300 M 380 40 L 380 300 M 40 220 L 560 220 M 240 60 L 240 310"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
          />

          {/* Secondary Highway Arterials */}
          <path
            d="M 80 290 Q 220 220 300 240 T 540 180"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Main Delivery Route Background (Base Shadow) */}
          <path
            d={routePath}
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />

          {/* Main Delivery Route Highway Line */}
          <path
            d={routePath}
            stroke="url(#routeGradient)"
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Animated Traveling Pulse Dash */}
          <path
            d={routePath}
            stroke="#ffffff"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="10 18"
            strokeLinecap="round"
            className="animate-pulse"
            opacity="0.9"
          />

          {/* 1. Origin Node (Warehouse) */}
          <g transform={`translate(${originPoint.x}, ${originPoint.y})`}>
            <circle r="16" fill="#3b82f6" fillOpacity="0.2" className="animate-ping" />
            <circle r="12" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" />
            <circle r="5" fill="#3b82f6" />
          </g>

          {/* 2. Transit Sorting Hub Node */}
          <g transform={`translate(${transitHub.x}, ${transitHub.y})`}>
            <circle r="14" fill="#f59e0b" fillOpacity="0.2" />
            <circle r="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
            <circle r="4" fill="#f59e0b" />
          </g>

          {/* 3. Destination Node (Customer Home) */}
          <g transform={`translate(${destinationPoint.x}, ${destinationPoint.y})`}>
            <circle r="18" fill="#10b981" fillOpacity="0.2" className="animate-pulse" />
            <circle r="14" fill="#1e293b" stroke="#10b981" strokeWidth="2.5" />
            <circle r="6" fill="#10b981" />
          </g>

          {/* 4. Live Courier Van / Marker (Animated position) */}
          {(isOutForDelivery || isInTransit) && !isDelivered && (
            <g
              transform={`translate(${courierLivePos.x}, ${courierLivePos.y})`}
              filter="url(#glow)"
            >
              {/* Radar Wave */}
              <circle r="26" fill="#f97316" fillOpacity="0.2" className="animate-ping" />
              <circle r="18" fill="#ea580c" stroke="#ffffff" strokeWidth="2.5" />
              {/* Van vector icon */}
              <path
                d="M -7 -4 L 2 -4 L 6 0 L 7 4 L -7 4 Z"
                fill="#ffffff"
              />
              <circle cx="-4" cy="5" r="1.5" fill="#0f172a" />
              <circle cx="4" cy="5" r="1.5" fill="#0f172a" />
            </g>
          )}
        </svg>

        {/* Floating Interactive Label Cards directly over the Map */}
        {/* Origin Label */}
        <div
          className="absolute text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-900/90 text-slate-200 border border-blue-500/40 shadow-md backdrop-blur-xs flex items-center gap-1 pointer-events-none"
          style={{ left: "12%", bottom: "20%" }}
        >
          <Building2 size={11} className="text-blue-400" />
          <span>{originPoint.name}</span>
        </div>

        {/* Courier Telemetry Bubble (Floating near vehicle) */}
        {(isOutForDelivery || isInTransit) && !isDelivered && (
          <div
            className="absolute -translate-x-1/2 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-950/95 text-white border border-orange-500/60 shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-none animate-bounce-slow"
            style={{
              left: `${(courierLivePos.x / 600) * 100}%`,
              top: `${Math.max(10, (courierLivePos.y / 340) * 100 - 18)}%`,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span className="font-mono text-orange-400">{liveSpeed} km/h</span>
            <span className="text-[10px] text-slate-300 border-s border-slate-700 ps-1.5">
              {shipment.courier?.name || (isAr ? "كابتن التوصيل" : "Courier")}
            </span>
          </div>
        )}

        {/* Destination Label */}
        <div
          className="absolute text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-900/90 text-emerald-300 border border-emerald-500/40 shadow-md backdrop-blur-xs flex items-center gap-1 pointer-events-none"
          style={{ right: "12%", top: "18%" }}
        >
          <Home size={11} className="text-emerald-400" />
          <span>{destinationPoint.name}</span>
        </div>

        {/* Bottom Telemetry HUD Bar */}
        <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 p-3 flex flex-wrap items-center justify-between gap-3 text-white text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Navigation size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">
                {isDelivered
                  ? (isAr ? "حالة التسليم" : "Delivery Status")
                  : (isAr ? "المسافة والوقت التقديري المتبقي" : "Estimated Remaining ETA")}
              </div>
              <div className="font-black text-white text-xs sm:text-sm flex items-center gap-2">
                {isDelivered ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    {isAr ? "تم التسليم بنجاح وتأكيد البوليصة" : "Delivered & Verified"}
                  </span>
                ) : (
                  <>
                    <span className="text-orange-400 font-mono">
                      {isOutForDelivery ? "3.8 km" : "120 km"}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-200">
                      {shipment.estimated_delivery_time || (isAr ? "اليوم خلال ساعتين" : "Within 2 hrs")}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="hidden sm:block">
              <span className="text-slate-400 block text-[10px]">{isAr ? "سرعة المندوب:" : "Speed:"}</span>
              <span className="font-mono font-bold text-orange-400">{liveSpeed} KM/H</span>
            </div>

            <div className="hidden sm:block">
              <span className="text-slate-400 block text-[10px]">{isAr ? "الرمز السري للتسليم:" : "Delivery OTP:"}</span>
              <span className="font-mono font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                {shipment.delivery_otp}
              </span>
            </div>

            <div className="text-end">
              <span className="text-slate-400 block text-[10px]">{isAr ? "الناقل المعتمد:" : "Carrier:"}</span>
              <span className="font-bold text-slate-200">{shipment.carrier_name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
