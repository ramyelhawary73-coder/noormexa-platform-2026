"use client";

import { useEffect, useState } from "react";
import { Shipment, generateAwbQrDataUrl } from "@/lib/shippingService";
import {
  Printer,
  X,
  QrCode,
  Package,
  MapPin,
  Phone,
  Building2,
  Copy,
  Check,
} from "lucide-react";

interface PrintableWaybillProps {
  shipment: Shipment;
  onClose?: () => void;
  isAr?: boolean;
}

export default function PrintableWaybill({
  shipment,
  onClose,
  isAr = true,
}: PrintableWaybillProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    generateAwbQrDataUrl(shipment.awb_number).then((url) => {
      if (isMounted && url) {
        setQrDataUrl(url);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [shipment.awb_number]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTrackLink = () => {
    const url = `${window.location.origin}/shipping?track=${shipment.awb_number}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Top Floating Control Bar (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <QrCode size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black">
                {isAr ? "بوليصة الشحن الرسمية والباركود الذكي" : "Official Waybill & Smart QR"}
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">{shipment.awb_number}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTrackLink}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all text-slate-200"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? (isAr ? "تم النسخ" : "Copied") : (isAr ? "نسخ الرابط" : "Copy Link")}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>{isAr ? "طباعة البوليصة" : "Print Label"}</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Printable Official Waybill Document Area */}
        <div id="printable-waybill-content" className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-900 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-black text-xs uppercase tracking-wider">
                  NOORMEXA EXPRESS
                </span>
                <span className="text-xs font-bold text-slate-600">منظومة الشحن الموحدة</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
                بوليصة شحن جوي وبري رسمية (AWB)
              </h1>
              <p className="text-[11px] text-slate-500 font-mono">
                DATE: {new Date(shipment.created_at).toLocaleDateString("en-US")} | ORDER ID: {shipment.order_id}
              </p>
            </div>

            {/* Carrier Info */}
            <div className="text-end">
              <div className="text-xs font-black text-slate-900">{shipment.carrier_name}</div>
              <div className="text-[11px] font-bold text-orange-600 font-mono uppercase">
                TRACKING: {shipment.carrier_code}
              </div>
              <div className="text-[10px] text-slate-500">مستودع الفرز والتوزيع المركزي</div>
            </div>
          </div>

          {/* Barcode & Big AWB Identification */}
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Air Waybill Number (AWB)
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-slate-950">
                {shipment.awb_number}
              </div>
              {/* Simulated visual barcode stripes */}
              <div className="flex items-center justify-center sm:justify-start gap-0.5 pt-1.5 h-9 opacity-85">
                {[4, 2, 6, 1, 3, 5, 2, 4, 1, 3, 6, 2, 4, 1, 5, 3, 2, 6, 4, 2, 5, 1, 3, 4, 6, 2].map(
                  (w, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 h-full rounded-xs"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  )
                )}
              </div>
            </div>

            {/* Payment & COD Badge */}
            <div className="text-center sm:text-end border-t sm:border-t-0 sm:border-s border-slate-300 pt-3 sm:pt-0 sm:ps-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                طريقة السداد (Payment Method)
              </span>
              <div
                className={`text-base font-black px-3 py-1 rounded-xl inline-block mt-1 ${
                  shipment.payment_type === "cod"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                {shipment.payment_type === "cod"
                  ? `تحصيل عند الاستلام (COD: ${shipment.cod_amount || shipment.declared_value} ${shipment.currency})`
                  : "مدفوع مسبقاً (PREPAID)"}
              </div>
            </div>
          </div>

          {/* Shipper & Consignee Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sender (From) */}
            <div className="p-4 rounded-2xl border border-slate-300 bg-white space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                  <Building2 size={13} className="text-blue-600" />
                  <span>المرسل / التاجر (SHIPPER / FROM)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">STORE ID: {shipment.store_id}</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-black text-slate-900 text-sm">{shipment.sender_name}</div>
                <div className="text-slate-600 flex items-start gap-1">
                  <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                  <span>{shipment.sender_address}, {shipment.sender_city}</span>
                </div>
                <div className="text-slate-600 flex items-center gap-1 font-mono">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{shipment.sender_phone}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-bold">{shipment.sender_country}</div>
              </div>
            </div>

            {/* Recipient (To) */}
            <div className="p-4 rounded-2xl border-2 border-slate-900 bg-amber-50/30 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                <span className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                  <MapPin size={13} className="text-orange-600" />
                  <span>المستلم / الوجهة (CONSIGNEE / TO)</span>
                </span>
                <span className="text-[10px] font-bold text-orange-600 uppercase">PRIORITY DELIVERY</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-black text-slate-950 text-sm">{shipment.recipient_name}</div>
                <div className="text-slate-800 font-medium flex items-start gap-1">
                  <MapPin size={13} className="text-orange-500 mt-0.5 shrink-0" />
                  <span>
                    {shipment.recipient_address} - {shipment.recipient_district || ""}, {shipment.recipient_city}
                  </span>
                </div>
                <div className="text-slate-900 font-mono font-bold flex items-center gap-1">
                  <Phone size={13} className="text-slate-500 shrink-0" />
                  <span>{shipment.recipient_phone}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono">
                  <span>POSTAL: {shipment.recipient_postal_code || "11564"}</span>
                  <span>•</span>
                  <span>{shipment.recipient_country}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Package Specs & QR Code Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-2 border-slate-900 rounded-2xl p-4 bg-slate-50">
            {/* Specs */}
            <div className="sm:col-span-2 space-y-3">
              <div className="text-xs font-black text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Package size={14} className="text-slate-700" />
                <span>مواصفات الطرد والمحتويات (PARCEL DETAILS)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">الوزن الفعلي:</span>
                  <span className="font-black font-mono text-slate-900">{shipment.package_weight_kg} KG</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">الأبعاد:</span>
                  <span className="font-black font-mono text-slate-900">{shipment.package_dimensions || "30x20x15 cm"}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">القيمة المصرحة:</span>
                  <span className="font-black font-mono text-slate-900">{shipment.declared_value} {shipment.currency}</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-500 block font-bold">وصف محتويات الشحنة:</span>
                <span className="font-bold text-slate-900">{shipment.items_summary} ({shipment.items_count} قطع)</span>
              </div>

              {/* Security OTP Alert Box */}
              <div className="p-3 rounded-xl bg-orange-100 border border-orange-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-orange-900 block">
                    رمز التأكيد السري للتسليم (DELIVERY OTP)
                  </span>
                  <span className="text-[11px] text-orange-800">
                    لا تسلم الطرد إلا بعد مطابقة هذا الرمز مع العميل
                  </span>
                </div>
                <div className="text-xl font-black font-mono text-orange-950 bg-white px-3 py-1 rounded-lg border border-orange-300 tracking-widest">
                  {shipment.delivery_otp}
                </div>
              </div>
            </div>

            {/* QR Code Scannable Area */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-300 text-center space-y-2">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
                SCAN TO LIVE TRACK
              </span>

              {/* Real Rendered QR Code */}
              <div className="w-36 h-36 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center shadow-xs">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR for ${shipment.awb_number}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode size={64} className="text-slate-400 animate-pulse" />
                )}
              </div>

              <span className="text-[10px] text-slate-500 font-bold leading-tight">
                امسح الرمز بكاميرا الهاتف للتتبع الجغرافي الفوري
              </span>
            </div>
          </div>

          {/* Footer & Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-3 border-t border-slate-300 text-[11px] text-slate-600">
            <div className="space-y-6">
              <div>توقيع واستلام مندوب شركة الشحن: _____________________</div>
              <div className="text-[10px] text-slate-400">التاريخ والوقت: {new Date().toLocaleTimeString("ar-SA")}</div>
            </div>

            <div className="space-y-6 text-end">
              <div>توقيع واستلام العميل المستلم: _____________________</div>
              <div className="text-[10px] text-slate-400">منصة نورميكسا المعتمدة © NOORMEXA Global Logistics</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
