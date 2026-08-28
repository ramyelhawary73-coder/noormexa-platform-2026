"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Truck,
  Navigation,
  CheckCircle2,
  Phone,
  MessageSquare,
  Key,
  ShieldCheck,
  MapPin,
  Clock,
  Compass,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  LocateFixed,
  Package,
  Layers,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import type { Shipment, ShipmentStatus } from "@/types/marketplace";

export default function CourierDispatchApp() {
  const { shipments, updateShipmentStatus } = useMarketplace();

  // Active driver identity
  const [driverName, setDriverName] = useState("الكابتن أحمد المنصور");
  const [vehicleNumber, setVehicleNumber] = useState("أ ن ب 4482");
  const [isBroadcastingGps, setIsBroadcastingGps] = useState(true);
  const [driverGps, setDriverGps] = useState<{ lat: number; lng: number } | null>(null);

  // Selected shipment for active dispatch
  const activeShipments = shipments.filter(
    (s) => s.status === "out_for_delivery" || s.status === "ready_to_ship" || s.status === "in_transit"
  );
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(
    () => activeShipments[0]?.id || shipments[0]?.id || ""
  );

  // OTP Verification modal state
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [deliveredSuccess, setDeliveredSuccess] = useState(false);

  const selectedShipment = shipments.find((s) => s.id === selectedShipmentId) || shipments[0];

  // Watch real device GPS position for driver
  const updateDriverLocation = useCallback(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDriverGps({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Driver GPS warning:", err.message);
          // Fallback to Riyadh default
          setDriverGps({ lat: 24.7136, lng: 46.6753 });
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    updateDriverLocation();
    const interval = setInterval(() => {
      if (isBroadcastingGps) {
        updateDriverLocation();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isBroadcastingGps, updateDriverLocation]);

  // Handle verify delivery OTP
  const handleVerifyAndDeliver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;

    const correctOtp = selectedShipment.deliveryOtp || "7841";
    if (otpInput.trim() === correctOtp.trim()) {
      updateShipmentStatus(selectedShipment.id, "delivered", "تم التسليم للعميل بنجاح");
      setDeliveredSuccess(true);
      setOtpError(false);
      setTimeout(() => {
        setDeliveredSuccess(false);
        setOtpInput("");
      }, 4000);
    } else {
      setOtpError(true);
    }
  };

  // Google Maps navigation direct url for driver
  const targetAddress = selectedShipment
    ? encodeURIComponent(`${selectedShipment.recipientAddress}, ${selectedShipment.recipientCity}`)
    : "";
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetAddress}&travelmode=driving`;

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 font-sans pb-24">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-30 bg-[#0c1628]/95 backdrop-blur-md border-b border-white/10 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold">
            <Truck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-white">NOORMEXA Driver Dispatch</h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white">الكابتن</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {driverName} • {vehicleNumber}
            </p>
          </div>
        </div>

        {/* GPS Live Broadcast Status Toggle */}
        <button
          type="button"
          onClick={() => setIsBroadcastingGps((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            isBroadcastingGps
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse"
              : "bg-slate-800 border-white/10 text-slate-400"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isBroadcastingGps ? "bg-emerald-400" : "bg-slate-500"}`} />
          <span>{isBroadcastingGps ? "GPS متصل وبث حي" : "GPS معطل"}</span>
        </button>
      </header>

      {/* Main App Container */}
      <main className="max-w-3xl mx-auto px-4 py-5 space-y-5">
        {/* GPS Live Coordinates Banner */}
        <div className="p-3.5 rounded-2xl bg-[#0f1d35] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LocateFixed size={18} className="text-orange-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-400 block">موقعك الحالي الفعلي (Driver GPS):</span>
              <span className="text-xs font-mono font-bold text-white">
                {driverGps ? `${driverGps.lat.toFixed(5)}° N, ${driverGps.lng.toFixed(5)}° E` : "جارِ استقبال إشارة الأقمار الصناعية..."}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={updateDriverLocation}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
            title="تحديث الإشارة"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Active Assigned Deliveries Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Package size={15} className="text-orange-400" />
              <span>مهام التوصيل المسندة إليك ({activeShipments.length})</span>
            </h2>
            <span className="text-[11px] text-orange-400 font-bold">اليوم</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeShipments.map((shp) => {
              const isSelected = shp.id === selectedShipment?.id;
              return (
                <button
                  type="button"
                  key={shp.id}
                  onClick={() => {
                    setSelectedShipmentId(shp.id);
                    setOtpInput("");
                    setDeliveredSuccess(false);
                    setOtpError(false);
                  }}
                  className={`p-3.5 rounded-2xl border text-start transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? "bg-orange-500/15 border-orange-500/60 shadow-lg shadow-orange-500/10"
                      : "bg-[#0c1628] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-xs font-bold text-orange-400">{shp.awbNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        shp.status === "delivered"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {shp.status === "delivered" ? "تم التسليم" : "جاهز للتسليم"}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">{shp.recipientName}</div>
                    <div className="text-[11px] text-slate-400 truncate">{shp.recipientAddress}</div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2">
                    <span>{shp.recipientCity}</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {shp.paymentType === "cod" ? `تحصيل: ${shp.codAmount} ر.س` : "مدفوع مسبقاً"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Mission Details Card */}
        {selectedShipment && (
          <div className="p-5 rounded-3xl bg-[#0c1628] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 block">الشحنة الحالية النشطة</span>
                <h3 className="font-mono font-black text-orange-400 text-sm">{selectedShipment.awbNumber}</h3>
              </div>
              <a
                href={navUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg transition-all"
              >
                <Navigation size={14} />
                <span>بدء الملاحة بخرائط Google</span>
              </a>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400">بيانات العميل المستلم:</span>
                <div className="font-bold text-white text-sm">{selectedShipment.recipientName}</div>
                <div className="text-slate-300 flex items-center gap-1">
                  <MapPin size={13} className="text-orange-400 shrink-0" />
                  <span>
                    {selectedShipment.recipientAddress}, {selectedShipment.recipientCity}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between gap-2">
                <span className="text-[10px] text-slate-400">التواصل مع العميل:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedShipment.recipientPhone}`}
                    className="flex-1 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 flex items-center justify-center gap-1 font-bold text-xs"
                  >
                    <Phone size={13} />
                    <span>اتصال</span>
                  </a>
                  <a
                    href={`https://wa.me/${selectedShipment.recipientPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1 font-bold text-xs"
                  >
                    <MessageSquare size={13} />
                    <span>واتساب</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Delivery Confirmation & OTP Box */}
            <div className="p-4 rounded-2xl bg-[#08101e] border border-orange-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-orange-400" />
                <h4 className="text-xs font-bold text-white">إتمام التسليم وإدخال الرمز السري (OTP)</h4>
              </div>
              <p className="text-[11px] text-slate-400">
                اطلب من العميل تزويدك برمز الاستلام المكون من 4 أرقام لتسليم الطرد وتأكيد الشحنة سحابياً فوراً.
              </p>

              {deliveredSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-xs font-bold">
                  <CheckCircle2 size={16} />
                  <span>تم تأكيد وتوثيق تسليم الشحنة بنجاح وحفظها في السحابة!</span>
                </div>
              ) : (
                <form onSubmit={handleVerifyAndDeliver} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="أدخل رمز OTP (مثال: 7841)"
                    className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1"
                  >
                    <CheckCircle2 size={14} />
                    <span>تأكيد التسليم</span>
                  </button>
                </form>
              )}

              {otpError && (
                <div className="text-[11px] text-rose-400 flex items-center gap-1 font-bold">
                  <AlertCircle size={13} />
                  <span>الرمز السري غير صحيح، يرجى التأكد من العميل.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
