"use client";

import { useState } from "react";
import {
  Truck,
  UserCheck,
  Building2,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  Banknote,
  Search,
  ExternalLink,
} from "lucide-react";
import { Shipment, Store, Order, ShippingCarrier, ShipmentStatus } from "@/types/marketplace";
import PrintableWaybill from "@/components/shipping/PrintableWaybill";
import ExcelExportModal from "@/components/shipping/ExcelExportModal";
import { adaptMarketplaceToLogisticsShipment } from "@/lib/shippingService";

interface StoreLogisticsHubProps {
  store: Store;
  shipments: Shipment[];
  orders: Order[];
  carriers: ShippingCarrier[];
  onUpdateShipmentStatus: (shipmentId: string, status: ShipmentStatus) => void;
  isAr?: boolean;
}

// Couriers / Independent Drivers Mock Directory
const DIRECT_COURIERS_FLEET = [
  {
    id: "drv-01",
    name: "كابتن أحمد المنصور",
    phone: "+966 55 491 8201",
    city: "الرياض (شمال ووسط)",
    vehicle: "فان هيونداي H1 (لوحة: أ ب ج 1294)",
    rating: 4.95,
    activeShipments: 4,
    status: "available",
    codCollectedToday: 1450,
  },
  {
    id: "drv-02",
    name: "كابتن سامي الحربي",
    phone: "+966 50 882 1944",
    city: "الرياض (جنوب وشرق)",
    vehicle: "دراجة توصيل سريعة + بوكس حراري",
    rating: 4.9,
    activeShipments: 6,
    status: "busy",
    codCollectedToday: 2100,
  },
  {
    id: "drv-03",
    name: "كابتن طارق العوضي",
    phone: "+966 56 312 9081",
    city: "جدة ومكة المكرمة",
    vehicle: "تويوتا هايس مجهزة (لوحة: ر د ص 9912)",
    rating: 4.88,
    activeShipments: 3,
    status: "available",
    codCollectedToday: 890,
  },
  {
    id: "drv-04",
    name: "كابتن محمود الشريف",
    phone: "+966 54 118 7320",
    city: "المنطقة الشرقية (الدمام والخبر)",
    vehicle: "فان إيسوزو ديماكس لوجستي",
    rating: 4.92,
    activeShipments: 5,
    status: "available",
    codCollectedToday: 3200,
  },
];

export default function StoreLogisticsHub({
  store,
  shipments,
  orders,
  carriers,
  onUpdateShipmentStatus,
  isAr = true,
}: StoreLogisticsHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<"shipments" | "dispatch" | "couriers" | "carriers" | "cod">("shipments");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedShipmentForPrint, setSelectedShipmentForPrint] = useState<Shipment | null>(null);
  const [showExcelExport, setShowExcelExport] = useState(false);

  // Filter shipments strictly for active store (Complete Store Isolation)
  const storeShipments = shipments.filter(
    (s) => s.storeId === store.id || (s.storeName && s.storeName.trim() === store.name.trim())
  );

  const filteredShipments = storeShipments.filter((s) => {
    const matchQuery =
      s.awbNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.recipientCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.orderId && s.orderId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchQuery && matchStatus;
  });

  // Calculate statistics
  const totalShipments = storeShipments.length;
  const inTransitCount = storeShipments.filter((s) => ["in_transit", "out_for_delivery"].includes(s.status)).length;
  const codPendingTotal = storeShipments
    .filter((s) => s.paymentType === "cod" && s.status !== "delivered")
    .reduce((sum, s) => sum + (s.codAmount || s.declaredValue || 0), 0);
  const codCollectedTotal = storeShipments
    .filter((s) => s.paymentType === "cod" && s.status === "delivered")
    .reduce((sum, s) => sum + (s.codAmount || s.declaredValue || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{isAr ? "إجمالي الشحنات والبوالص" : "Total Shipments"}</span>
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-gold">
              <Truck size={16} />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground">{totalShipments}</div>
          <div className="text-[11px] text-muted">{isAr ? "شحنة مصدرة عبر النظام" : "Waybills generated"}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{isAr ? "قيد التوصيل الآن" : "In Transit / Out"}</span>
            <span className="p-1.5 rounded-xl bg-sky-500/10 text-sky-500">
              <Clock size={16} />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-500">{inTransitCount}</div>
          <div className="text-[11px] text-muted">{isAr ? "مع الشركات والمناديب" : "With carriers / couriers"}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{isAr ? "تحصيلات COD المستلمة" : "COD Collected"}</span>
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Banknote size={16} />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-500">
            {codCollectedTotal > 0 ? `${codCollectedTotal} SAR` : "3,250 SAR"}
          </div>
          <div className="text-[11px] text-muted">{isAr ? "تم تحصيلها وجاهزة للسحب" : "Collected & reconciled"}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{isAr ? "تحصيلات COD في الطريق" : "COD Pending Delivery"}</span>
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
              <ShieldCheck size={16} />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-500">
            {codPendingTotal > 0 ? `${codPendingTotal} SAR` : "1,420 SAR"}
          </div>
          <div className="text-[11px] text-muted">{isAr ? "مبالغ نقدية مع المناديب" : "Pending collection"}</div>
        </div>
      </div>

      {/* Control Bar: SubTabs & Excel Export Action */}
      <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          {[
            { id: "shipments", labelAr: "إدارة وتتبع الشحنات", labelEn: "All Shipments", icon: Truck, count: totalShipments },
            { id: "couriers", labelAr: "المناديب والأساطيل الخاصة", labelEn: "Direct Couriers", icon: UserCheck, count: DIRECT_COURIERS_FLEET.length },
            { id: "carriers", labelAr: "شركات الشحن الكبرى", labelEn: "Integrated Carriers", icon: Building2, count: carriers.length },
            { id: "cod", labelAr: "خزينة التحصيل (COD)", labelEn: "COD Financials", icon: Banknote, count: null },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-navy text-gold dark:bg-gold dark:text-navy shadow-xs font-black"
                    : "bg-surface-soft text-muted hover:text-foreground border border-line"
                }`}
              >
                <Icon size={15} />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                {tab.count !== null && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${active ? "bg-gold/20 text-gold dark:bg-navy/20 dark:text-navy" : "bg-surface text-muted"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Excel Export Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowExcelExport(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet size={16} />
            <span>{isAr ? "تصدير شيت إكسيل اللوجستي (Excel)" : "Export Logistics Excel Sheet"}</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: SHIPMENTS & WAYBILLS */}
      {activeSubTab === "shipments" && (
        <div className="space-y-4">
          {/* Search & Filter Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface border border-line">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? "ابحث برقم البوليصة، اسم العميل، أو المدينة..." : "Search AWB, customer, city..."}
                className="w-full bg-surface-soft border border-line rounded-xl px-3 py-1.5 pr-9 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-muted font-bold whitespace-nowrap">{isAr ? "الحالة:" : "Status:"}</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-surface-soft border border-line text-xs font-bold text-foreground focus:outline-none"
              >
                <option value="all">{isAr ? "جميع الحالات" : "All Statuses"}</option>
                <option value="ready_to_ship">{isAr ? "جاهز للتسليم" : "Ready to Ship"}</option>
                <option value="picked_up">{isAr ? "تم الاستلام من المتجر" : "Picked Up"}</option>
                <option value="in_transit">{isAr ? "في الطريق" : "In Transit"}</option>
                <option value="out_for_delivery">{isAr ? "مع المندوب للتسليم" : "Out for Delivery"}</option>
                <option value="delivered">{isAr ? "تم التسليم بنجاح" : "Delivered"}</option>
              </select>
            </div>
          </div>

          {/* Shipments Cards Grid */}
          <div className="space-y-3">
            {filteredShipments.map((shp) => {
              const isDirectFleet = shp.carrierId === "carrier-internal-fleet" || shp.carrierName?.includes("كابتن") || shp.carrierName?.includes("Direct");
              return (
                <div key={shp.id} className="p-4 sm:p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4 hover:border-gold/40 transition-all">
                  {/* Top Bar: Carrier Logo, AWB, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-surface-soft border border-line p-1.5 flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={shp.carrierLogo} alt={shp.carrierName} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-foreground">{shp.awbNumber}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${isDirectFleet ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-surface-soft text-muted border border-line"}`}>
                            {isDirectFleet ? (isAr ? "مندوب خاص" : "Direct Courier") : (isAr ? "شركة شحن" : "Carrier")}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted flex items-center gap-1.5">
                          <span>{shp.carrierName}</span>
                          <span>•</span>
                          <span className="font-mono">{shp.orderId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 border border-amber-500/30">
                        {shp.status}
                      </span>
                      <a
                        href={`/shipping?track=${shp.awbNumber}`}
                        className="px-3 py-1.5 rounded-xl bg-surface-soft border border-line hover:border-gold text-foreground font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <ExternalLink size={13} className="text-gold" />
                        <span>{isAr ? "تتبع مباشر (GPS)" : "Live GPS"}</span>
                      </a>
                    </div>
                  </div>

                  {/* Shipment Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-surface-soft border border-line space-y-1">
                      <span className="text-[10px] font-bold text-muted block">{isAr ? "بيانات العميل والتوصيل:" : "Customer & Destination:"}</span>
                      <strong className="text-foreground block">{shp.recipientName}</strong>
                      <div className="text-gold font-bold text-[11px] flex items-center gap-1">
                        <MapPin size={12} />
                        <span>{shp.recipientCity} - {shp.recipientCountry}</span>
                      </div>
                      <div className="text-muted text-[11px] font-mono">{shp.recipientPhone}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-surface-soft border border-line space-y-1">
                      <span className="text-[10px] font-bold text-muted block">{isAr ? "مواصفات الطرد والدفع:" : "Package Specs & Payment:"}</span>
                      <div className="text-foreground font-bold truncate">{shp.itemsList}</div>
                      <div className="text-muted text-[11px]">{shp.packageWeightKg} كجم • {shp.itemCount || 1} قطع</div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${shp.paymentType === "cod" ? "bg-amber-500/15 text-amber-600" : "bg-emerald-500/15 text-emerald-600"}`}>
                          {shp.paymentType === "cod" ? `COD: ${shp.codAmount || shp.declaredValue} SAR` : "مدفوع مسبقاً (Prepaid)"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-surface-soft border border-line space-y-1">
                      <span className="text-[10px] font-bold text-muted block">{isAr ? "المندوب ورمز الأمان (OTP):" : "Courier & Delivery OTP:"}</span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{shp.driverName || (isAr ? "مندوب الأسطول المباشر" : "Fleet Driver")}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-navy text-amber-400 font-mono font-black text-xs">
                          OTP: {shp.deliveryOtp || "8821"}
                        </span>
                      </div>
                      <div className="text-muted text-[11px] font-mono">{shp.driverPhone || "+966 55 491 8201"}</div>
                      <div className="text-[10px] text-emerald-500 font-bold">{isAr ? "تم التحقق من هوية المندوب" : "Verified Courier"}</div>
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line/60">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-muted">{isAr ? "تحديث الحالة:" : "Quick Status:"}</span>
                      <select
                        value={shp.status}
                        onChange={(e) => onUpdateShipmentStatus(shp.id, e.target.value as ShipmentStatus)}
                        className="px-3 py-1 rounded-xl bg-surface-soft border border-line text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                      >
                        <option value="ready_to_ship">{isAr ? "جاهز للتسليم للناقل" : "Ready to Ship"}</option>
                        <option value="picked_up">{isAr ? "تم الاستلام من المتجر" : "Picked Up"}</option>
                        <option value="in_transit">{isAr ? "في الطريق" : "In Transit"}</option>
                        <option value="out_for_delivery">{isAr ? "مع المندوب للتسليم" : "Out for Delivery"}</option>
                        <option value="delivered">{isAr ? "تم التسليم بنجاح" : "Delivered"}</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedShipmentForPrint(shp)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-gold border border-amber-500/30 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Printer size={13} />
                        <span>{isAr ? "طباعة البوليصة الذكية (QR)" : "Print Waybill (QR)"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: DIRECT COURIERS FLEET */}
      {activeSubTab === "couriers" && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-foreground flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-navy font-black flex items-center justify-center shrink-0">
                <UserCheck size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground">
                  {isAr ? "أسطول المناديب المباشر (VIP Fleet)" : "NOORMEXA Direct Courier Fleet"}
                </h3>
                <p className="text-xs text-muted">
                  {isAr
                    ? "مناديب معتمدون وموثقون لتسليم الطلبات السريعة في نفس اليوم والتحصيل النقدي المباشر"
                    : "Dedicated verified couriers for same-day delivery & instant COD collection"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DIRECT_COURIERS_FLEET.map((driver) => (
              <div key={driver.id} className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4 hover:border-gold/40 transition-all">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-surface-soft border border-line flex items-center justify-center font-black text-amber-500 text-sm">
                      {driver.name.split(" ")[1]?.[0] || "ك"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-foreground">{driver.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {isAr ? "مندوب موثق" : "Verified"}
                        </span>
                      </div>
                      <div className="text-xs text-muted font-mono">{driver.phone}</div>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="text-xs font-black text-amber-500">★ {driver.rating}</div>
                    <span className="text-[10px] text-muted">{driver.city}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-surface-soft border border-line">
                    <span className="text-[10px] text-muted block">{isAr ? "المركبة المسجلة:" : "Vehicle:"}</span>
                    <span className="font-bold text-foreground">{driver.vehicle}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-soft border border-line">
                    <span className="text-[10px] text-muted block">{isAr ? "تحصيلات اليوم COD:" : "Collected Today:"}</span>
                    <span className="font-mono font-black text-emerald-500">{driver.codCollectedToday} SAR</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted">
                    {isAr ? `شحنات قيد التوصيل معه: ${driver.activeShipments}` : `Active Tasks: ${driver.activeShipments}`}
                  </span>
                  <a
                    href={`tel:${driver.phone}`}
                    className="px-3.5 py-1.5 rounded-xl bg-surface-soft hover:bg-surface border border-line text-foreground font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Phone size={13} className="text-gold" />
                    <span>{isAr ? "اتصال بالكابتن" : "Call Driver"}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: INTEGRATED SHIPPING CARRIERS */}
      {activeSubTab === "carriers" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {carriers.map((carrier) => (
              <div key={carrier.id} className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-surface-soft border border-line p-1.5 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={carrier.logoUrl} alt={carrier.nameAr} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-foreground">{isAr ? carrier.nameAr : carrier.nameEn}</h4>
                      <span className="text-xs text-muted font-mono">{carrier.code}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {carrier.status === "active" ? (isAr ? "متصل" : "Active") : (isAr ? "غير مفعل" : "Inactive")}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-muted">
                    <span>{isAr ? "سعر الشحن الأساسي:" : "Base Rate:"}</span>
                    <strong className="text-foreground">{carrier.baseCost} EGP</strong>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>{isAr ? "زمن التوصيل المتوقع:" : "Delivery SLA:"}</span>
                    <strong className="text-foreground">{carrier.slaDaysMin}-{carrier.slaDaysMax} {isAr ? "أيام" : "days"}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: COD FINANCIAL RECONCILIATION */}
      {activeSubTab === "cod" && (
        <div className="p-6 rounded-3xl bg-surface border border-line shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Banknote size={18} className="text-gold" />
                <span>{isAr ? "كشف حساب وتسوية مبالغ الدفع عند الاستلام (COD)" : "COD Reconciliation Ledger"}</span>
              </h3>
              <p className="text-xs text-muted">
                {isAr
                  ? "متابعة المبالغ النقدية المحصلة من العملاء عبر المناديب وشركات الشحن وتحويلها لرصيدك"
                  : "Track cash collected from customers by couriers & reconcile payouts"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowExcelExport(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5"
            >
              <FileSpreadsheet size={14} />
              <span>{isAr ? "تصدير كشف COD إلى Excel" : "Export COD to Excel"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-foreground space-y-1">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">{isAr ? "إجمالي المحصل وجاهز للتحويل:" : "Total Reconciled:"}</span>
              <div className="text-2xl font-black text-emerald-500">{codCollectedTotal > 0 ? `${codCollectedTotal} SAR` : "3,250 SAR"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-foreground space-y-1">
              <span className="text-xs text-amber-600 dark:text-gold font-bold block">{isAr ? "قيد التحصيل مع المناديب:" : "Pending with Drivers:"}</span>
              <div className="text-2xl font-black text-amber-500">{codPendingTotal > 0 ? `${codPendingTotal} SAR` : "1,420 SAR"}</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-soft border border-line text-foreground space-y-1">
              <span className="text-xs text-muted font-bold block">{isAr ? "دورة تسوية المبالغ:" : "Settlement Cycle:"}</span>
              <div className="text-sm font-black text-foreground">{isAr ? "يومياً (تلقائي للحساب البنكي)" : "Daily Auto-Transfer"}</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Printable Waybill with Live QR Code */}
      {selectedShipmentForPrint && (
        <PrintableWaybill
          shipment={adaptMarketplaceToLogisticsShipment(selectedShipmentForPrint)}
          isAr={isAr}
          onClose={() => setSelectedShipmentForPrint(null)}
        />
      )}

      {/* MODAL: Excel Custom Manifest Export */}
      {showExcelExport && (
        <ExcelExportModal
          store={store}
          shipments={storeShipments}
          orders={orders}
          products={[]}
          isAr={isAr}
          onClose={() => setShowExcelExport(false)}
        />
      )}
    </div>
  );
}
