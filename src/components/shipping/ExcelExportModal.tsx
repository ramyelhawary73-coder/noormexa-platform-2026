"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  X,
  Package,
  Truck,
  Layers,
  FileCheck,
} from "lucide-react";
import { Shipment, Order, Product, Store } from "@/types/marketplace";
import { generateCsvManifest, downloadCsvFile } from "@/lib/excelExportService";

interface ExcelExportModalProps {
  store: Store;
  shipments: Shipment[];
  orders: Order[];
  products: Product[];
  onClose: () => void;
  isAr?: boolean;
}

type ExportSheetType =
  | "carrier_manifest" // شيت إرسال للشركات والمناديب مع العناوين والبوالص
  | "cod_reconciliation" // شيت تحصيل المبالغ النقدية COD
  | "inventory_shipping" // شيت المنتجات مع مواصفات وأوزان الشحن
  | "full_orders_export"; // شيت شامل للطلبات والعملاء

export default function ExcelExportModal({
  store,
  shipments,
  orders,
  products,
  onClose,
  isAr = true,
}: ExcelExportModalProps) {
  const [selectedType, setSelectedType] = useState<ExportSheetType>("carrier_manifest");
  const [carrierFilter, setCarrierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Filter shipments strictly for the active store
  const filteredShipments = shipments.filter((shp) => {
    const matchStore = shp.storeId === store.id || (shp.storeName && shp.storeName.trim() === store.name.trim());
    const matchCarrier = carrierFilter === "all" || shp.carrierId === carrierFilter || shp.carrierName === carrierFilter;
    const matchStatus = statusFilter === "all" || shp.status === statusFilter;
    return matchStore && matchCarrier && matchStatus;
  });

  const handleExport = () => {
    setIsExporting(true);
    const dateStr = new Date().toISOString().split("T")[0];

    try {
      if (selectedType === "carrier_manifest") {
        // Official Carrier & Courier Dispatch Manifest
        const headers = [
          "رقم البوليصة (AWB)",
          "رقم الطلب (Order ID)",
          "تاريخ الشحن",
          "اسم العميل المستلم",
          "هاتف المستلم",
          "الدولة",
          "المدينة",
          "العنوان التفصيلي",
          "شركة الشحن / المندوب",
          "نوع الناقل",
          "اسم المندوب المسند",
          "هاتف المندوب",
          "طريقة الدفع",
          "مبلغ التحصيل (COD)",
          "الوزن (كجم)",
          "محتويات الشحنة",
          "عدد القطع",
          "رمز الأمان (OTP)",
          "حالة الشحنة الحالية",
          "ملاحظات التوصيل",
          "اسم المتجر التابع",
        ];

        const rows = filteredShipments.map((s) => [
          s.awbNumber,
          s.orderId,
          s.created_at ? new Date(s.created_at).toLocaleDateString("ar-SA") : dateStr,
          s.recipientName,
          s.recipientPhone,
          s.recipientCountry,
          s.recipientCity,
          s.recipientAddress,
          s.carrierName,
          s.carrierId === "carrier-internal-fleet" ? "مندوب خاص (Direct Fleet)" : "شركة شحن لوجستية",
          s.driverName || "بانتظار التعيين",
          s.driverPhone || "-",
          s.paymentType === "cod" ? "الدفع عند الاستلام (COD)" : "مدفوع مسبقاً (Prepaid)",
          s.paymentType === "cod" ? s.codAmount || s.declaredValue : 0,
          s.packageWeightKg,
          s.itemsList,
          s.itemCount,
          s.deliveryOtp || "8821",
          s.status,
          s.notes || "يرجى الاتصال بالعميل قبل الوصول",
          store.name,
        ]);

        const csv = generateCsvManifest(headers, rows);
        const filename = `NOORMEXA_Logistics_Manifest_${store.slug}_${dateStr}.csv`;
        downloadCsvFile(filename, csv);
      } else if (selectedType === "cod_reconciliation") {
        // COD Financial Collection Reconciliation
        const headers = [
          "رقم البوليصة (AWB)",
          "رقم الطلب",
          "اسم المستلم",
          "المدينة",
          "الناقل / المندوب المسند",
          "المبلغ المطلوب تحصيله (SAR)",
          "حالة التسليم",
          "رمز الأمان OTP",
          "تاريخ التحديث",
          "حالة التحصيل المالي للمتجر",
        ];

        const codShipments = filteredShipments.filter((s) => s.paymentType === "cod");
        const rows = (codShipments.length > 0 ? codShipments : filteredShipments).map((s) => [
          s.awbNumber,
          s.orderId,
          s.recipientName,
          s.recipientCity,
          s.driverName ? `${s.driverName} (${s.carrierName})` : s.carrierName,
          s.codAmount || s.declaredValue || 150,
          s.status,
          s.deliveryOtp || "8821",
          dateStr,
          s.status === "delivered" ? "تم التحصيل وجاهز للتحويل" : "قيد التحصيل مع المندوب",
        ]);

        const csv = generateCsvManifest(headers, rows);
        const filename = `NOORMEXA_COD_Collections_${store.slug}_${dateStr}.csv`;
        downloadCsvFile(filename, csv);
      } else if (selectedType === "inventory_shipping") {
        // Products with Shipping Specs & Dimensions
        const headers = [
          "معرف المنتج (SKU / ID)",
          "اسم المنتج بالعربية",
          "الاسم بالإنجليزية",
          "القسم الرئيسي",
          "السعر الأساسي (SAR)",
          "سعر الخصم",
          "الكمية في المستودع",
          "وزن الشحن التقريبي (كجم)",
          "أبعاد الطرد (طول x عرض x ارتفاع)",
          "حالة الشحن المجاني",
          "المتجر",
        ];

        const storeProducts = products.filter((p) => p.store_id === store.id);
        const rows = (storeProducts.length > 0 ? storeProducts : products.filter((p) => p.store_name === store.name)).map((p) => [
          p.id,
          p.name,
          p.name_en || p.name,
          p.category_id,
          p.price,
          p.original_price || p.price,
          p.stock ?? 50,
          "1.2",
          "30x20x15 cm",
          p.free_shipping ? "نعم (شحن مجاني)" : "لا",
          store.name,
        ]);

        const csv = generateCsvManifest(headers, rows);
        const filename = `NOORMEXA_Products_Shipping_Specs_${store.slug}_${dateStr}.csv`;
        downloadCsvFile(filename, csv);
      } else {
        // Full Orders & Address Book Export strictly for this store
        const headers = [
          "رقم الطلب (Order #)",
          "تاريخ ووقت الطلب",
          "اسم العميل",
          "رقم الجوال",
          "الدولة",
          "المدينة",
          "العنوان بالتفصيل",
          "عدد المنتجات",
          "إجمالي الطلب",
          "طريقة الدفع",
          "حالة الطلب",
          "حالة الشحن",
          "رقم البوليصة المرتبط",
        ];

        const storeOrders = orders.filter((o) => o.store_id === store.id || (o.store_name && o.store_name.trim() === store.name.trim()));
        const rows = storeOrders.map((o) => [
          o.orderNumber,
          new Date(o.created_at).toLocaleString("ar-SA"),
          o.shipping_info.fullName,
          o.shipping_info.phone,
          o.shipping_info.country,
          o.shipping_info.city,
          o.shipping_info.address,
          o.items.length,
          o.total_amount,
          o.payment_method,
          o.status,
          o.carrier || "جاهز للشحن",
          o.trackingNumber || "لم تُصدر بعد",
        ]);

        const csv = generateCsvManifest(headers, rows);
        const filename = `NOORMEXA_Orders_Master_Export_${store.slug}_${dateStr}.csv`;
        downloadCsvFile(filename, csv);
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-surface border border-line text-foreground rounded-3xl shadow-2xl overflow-hidden space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-surface-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <span>{isAr ? "تصدير شيت إكسيل اللوجستي المعتمد" : "Official Logistics Excel Export"}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-bold text-[10px]">
                  NOORMEXA
                </span>
              </h2>
              <p className="text-xs text-muted">
                {isAr
                  ? `تصدير بيانات متجر (${store.name}) للشركات والمناديب والتحصيل`
                  : `Export store manifests and dispatch sheets`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-surface border border-line hover:border-gold flex items-center justify-center text-muted hover:text-foreground transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 space-y-5">
          {/* Export Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-foreground block">
              {isAr ? "اختر نوع شيت الإكسيل المراد تصديره:" : "Select Export Sheet Template:"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: "carrier_manifest",
                  titleAr: "بوالص وتكليفات الشحن (للمناديب والشركات)",
                  titleEn: "Carrier & Courier Dispatch Manifest",
                  descAr: "شيت كامل بالعناوين، البوالص، أرقام التواصل، والـ OTP للمناديب والشركات",
                  icon: Truck,
                },
                {
                  id: "cod_reconciliation",
                  titleAr: "كشف تحصيل المبالغ عند الاستلام (COD)",
                  titleEn: "Cash on Delivery (COD) Collections",
                  descAr: "حصر المبالغ المالية المحصلة والمستحقة على المناديب وشركات الشحن",
                  icon: FileCheck,
                },
                {
                  id: "inventory_shipping",
                  titleAr: "كتالوج المنتجات مع أوزان وأبعاد الشحن",
                  titleEn: "Product Catalog with Shipping Specs",
                  descAr: "قائمة المنتجات مع الأوزان والأبعاد ومحطة التخزين لإمداد شركات الشحن",
                  icon: Package,
                },
                {
                  id: "full_orders_export",
                  titleAr: "سجل الطلبات الشامل وبيانات العملاء",
                  titleEn: "Master Orders & Addresses Export",
                  descAr: "شيت بجميع تفاصيل الطلبات، العناوين، وحالات الدفع والتجهيز",
                  icon: Layers,
                },
              ].map((item) => {
                const Icon = item.icon;
                const active = selectedType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedType(item.id as ExportSheetType)}
                    className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      active
                        ? "bg-amber-500/10 border-amber-500 text-foreground ring-1 ring-amber-500/30"
                        : "bg-surface-soft border-line hover:border-amber-500/50 text-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={active ? "text-amber-500" : "text-muted"} />
                        <span className="text-xs font-black text-foreground">
                          {isAr ? item.titleAr : item.titleEn}
                        </span>
                      </div>
                      {active && <CheckCircle2 size={16} className="text-amber-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed">
                      {isAr ? item.descAr : item.titleEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters for Carrier Manifest */}
          {selectedType === "carrier_manifest" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-surface-soft border border-line">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">
                  {isAr ? "تصفية حسب الناقل / المندوب:" : "Filter by Carrier / Courier:"}
                </label>
                <select
                  value={carrierFilter}
                  onChange={(e) => setCarrierFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-surface border border-line text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="all">{isAr ? "جميع الشركات والمناديب" : "All Carriers & Couriers"}</option>
                  <option value="NRX_FLEET">{isAr ? "أسطول المناديب المباشر (VIP)" : "NRX Fleet Couriers"}</option>
                  <option value="SMSA">SMSA Express</option>
                  <option value="ARAMEX">Aramex Global</option>
                  <option value="BOSTA">Bosta Logistics</option>
                  <option value="DHL">DHL Express</option>
                  <option value="SPL">SPL Saudi Post</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted block">
                  {isAr ? "تصفية حسب حالة الشحنة:" : "Filter by Status:"}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-surface border border-line text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="all">{isAr ? "جميع الحالات" : "All Statuses"}</option>
                  <option value="ready_to_ship">{isAr ? "جاهز للتسليم للناقل" : "Ready to Ship"}</option>
                  <option value="picked_up">{isAr ? "تم الاستلام من المتجر" : "Picked Up"}</option>
                  <option value="in_transit">{isAr ? "في الطريق" : "In Transit"}</option>
                  <option value="out_for_delivery">{isAr ? "مع المندوب للتسليم" : "Out for Delivery"}</option>
                  <option value="delivered">{isAr ? "تم التسليم بنجاح" : "Delivered"}</option>
                </select>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {exportSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} />
              <span>
                {isAr
                  ? "تم تصدير وتحميل شيت الإكسيل بنجاح متوافقاً مع الترميز العربي UTF-8!"
                  : "Excel sheet exported successfully with full UTF-8 Arabic support!"}
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-line bg-surface-soft flex items-center justify-between">
          <span className="text-[11px] text-muted font-bold">
            {isAr ? "ترميز احترافي UTF-8 BOM متوافق 100% مع Microsoft Excel" : "100% Excel UTF-8 Compatible"}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface border border-line text-foreground text-xs font-bold hover:bg-surface-soft transition-all cursor-pointer"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Download size={14} />
              <span>
                {isExporting
                  ? isAr
                    ? "جاري التصدير..."
                    : "Exporting..."
                  : isAr
                  ? "تحميل شيت الإكسيل الآن"
                  : "Download Excel"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
