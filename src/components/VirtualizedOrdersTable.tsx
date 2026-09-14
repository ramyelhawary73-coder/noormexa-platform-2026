"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  Check,
  ChevronRight,
  ExternalLink,
  DollarSign,
  Package,
  Layers,
} from "lucide-react";
import type { Order } from "@/types/marketplace";

interface VirtualizedOrdersProps {
  orders: Order[];
  formatPrice: (amountInEGP: number) => string;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  onExportCsv: () => void;
  exportNotice: boolean;
  isAr: boolean;
}

// Fixed row heights: Compact row = 76px, Expanded row = 240px
const COMPACT_ROW_HEIGHT = 76;
const EXPANDED_ROW_HEIGHT = 248;
const BUFFER_ITEMS = 6;
const CONTAINER_HEIGHT = 620;

export function VirtualizedOrdersTable({
  orders,
  formatPrice,
  updateOrderStatus,
  onExportCsv,
  exportNotice,
  isAr,
}: VirtualizedOrdersProps) {
  // Local high-performance filtering and sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  // Virtual scroll viewport tracking
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle row expansion for reconciliation details
  const toggleRowExpansion = useCallback((orderId: string) => {
    setExpandedOrderIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  }, []);

  // Filtered & Sorted orders memoized for smooth 60fps performance
  const processedOrders = useMemo(() => {
    let result = orders;

    // 1. Filter by Status
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    // 2. Filter by Payment Status
    if (paymentFilter !== "all") {
      result = result.filter((o) => (o.payment_status || "paid") === paymentFilter);
    }

    // 3. Search by Order#, Tracking#, Customer Name, Phone, City, Store ID
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter((o) => {
        const orderNum = o.orderNumber?.toLowerCase() || "";
        const trackNum = o.trackingNumber?.toLowerCase() || "";
        const custName = o.shipping_info?.fullName?.toLowerCase() || "";
        const phone = o.shipping_info?.phone || "";
        const city = o.shipping_info?.city?.toLowerCase() || "";
        const store = o.store_name?.toLowerCase() || o.store_id?.toLowerCase() || "";
        return (
          orderNum.includes(q) ||
          trackNum.includes(q) ||
          custName.includes(q) ||
          phone.includes(q) ||
          city.includes(q) ||
          store.includes(q)
        );
      });
    }

    // 4. Sorting
    const sorted = [...result];
    sorted.sort((a, b) => {
      if (sortBy === "amount_desc") {
        return (b.total_amount || 0) - (a.total_amount || 0);
      }
      if (sortBy === "amount_asc") {
        return (a.total_amount || 0) - (b.total_amount || 0);
      }
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (sortBy === "date_asc") {
        return timeA - timeB;
      }
      return timeB - timeA;
    });

    return sorted;
  }, [orders, statusFilter, paymentFilter, searchTerm, sortBy]);

  // Financial reconciliation metrics for currently filtered list
  const metrics = useMemo(() => {
    let totalGross = 0;
    let totalCommission = 0;
    let totalVat = 0;
    let totalShipping = 0;
    let totalItems = 0;

    for (let i = 0; i < processedOrders.length; i++) {
      const o = processedOrders[i];
      totalGross += o.total_amount || 0;
      totalCommission += o.commission_amount || 0;
      totalVat += o.vat_amount || 0;
      totalShipping += o.shipping_cost || 0;
      if (o.items && Array.isArray(o.items)) {
        for (let j = 0; j < o.items.length; j++) {
          totalItems += o.items[j].quantity || 0;
        }
      }
    }

    const netPayable = Math.max(0, totalGross - totalCommission);

    return {
      count: processedOrders.length,
      totalGross,
      totalCommission,
      totalVat,
      totalShipping,
      netPayable,
      totalItems,
      aov: processedOrders.length > 0 ? totalGross / processedOrders.length : 0,
    };
  }, [processedOrders]);

  // Dynamic row positions and total height calculation for virtualization
  const { rowOffsets, totalHeight } = useMemo(() => {
    const offsets: number[] = new Array(processedOrders.length);
    let runningHeight = 0;

    for (let i = 0; i < processedOrders.length; i++) {
      offsets[i] = runningHeight;
      const isExpanded = !!expandedOrderIds[processedOrders[i].id];
      runningHeight += isExpanded ? EXPANDED_ROW_HEIGHT : COMPACT_ROW_HEIGHT;
    }

    return { rowOffsets: offsets, totalHeight: runningHeight };
  }, [processedOrders, expandedOrderIds]);

  // Determine which rows to render based on scroll position + buffer
  const visibleRange = useMemo(() => {
    if (processedOrders.length === 0) return { startIndex: 0, endIndex: 0 };

    const viewTop = scrollTop;
    const viewBottom = scrollTop + CONTAINER_HEIGHT;

    // Binary search for startIndex
    let low = 0;
    let high = processedOrders.length - 1;
    let start = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const isExpanded = !!expandedOrderIds[processedOrders[mid].id];
      const h = isExpanded ? EXPANDED_ROW_HEIGHT : COMPACT_ROW_HEIGHT;
      const bottom = rowOffsets[mid] + h;

      if (bottom >= viewTop) {
        start = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    // Binary search or linear scan for endIndex
    let end = start;
    while (end < processedOrders.length && rowOffsets[end] <= viewBottom) {
      end++;
    }

    const bufferedStart = Math.max(0, start - BUFFER_ITEMS);
    const bufferedEnd = Math.min(processedOrders.length, end + BUFFER_ITEMS);

    return {
      startIndex: bufferedStart,
      endIndex: bufferedEnd,
    };
  }, [scrollTop, processedOrders, rowOffsets, expandedOrderIds]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const visibleOrders = useMemo(() => {
    const items: Array<{
      order: Order;
      index: number;
      top: number;
      height: number;
      isExpanded: boolean;
    }> = [];

    for (let i = visibleRange.startIndex; i < visibleRange.endIndex; i++) {
      const order = processedOrders[i];
      if (order) {
        const isExpanded = !!expandedOrderIds[order.id];
        const height = isExpanded ? EXPANDED_ROW_HEIGHT : COMPACT_ROW_HEIGHT;
        items.push({
          order,
          index: i,
          top: rowOffsets[i],
          height,
          isExpanded,
        });
      }
    }

    return items;
  }, [visibleRange, processedOrders, rowOffsets, expandedOrderIds]);

  const statusBadge = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "shipped":
        return "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30";
      case "processing":
        return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "paid":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "pending":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "cancelled":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-gray-500/15 text-gray-500 border-gray-500/30";
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    if (isAr) {
      switch (status) {
        case "pending": return "قيد الانتظار";
        case "paid": return "مدفوع ومؤكد";
        case "processing": return "جاري التجهيز";
        case "shipped": return "تم الشحن";
        case "delivered": return "تم التسليم";
        case "cancelled": return "ملغي";
        default: return status;
      }
    }
    return status.toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* 1. Quick Financial Reconciliation Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-surface-soft border border-line">
          <div className="flex items-center justify-between text-muted text-[11px] font-semibold mb-1">
            <span>{isAr ? "إجمالي التداول (Gross)" : "Gross Volume"}</span>
            <DollarSign size={13} className="text-gold" />
          </div>
          <div className="text-base sm:text-lg font-black text-foreground">
            {formatPrice(metrics.totalGross)}
          </div>
          <div className="text-[10px] text-muted">
            {isAr ? `${metrics.count} طلب محدد` : `${metrics.count} filtered orders`}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-soft border border-line">
          <div className="flex items-center justify-between text-muted text-[11px] font-semibold mb-1">
            <span>{isAr ? "عمولة المنصة (Platform)" : "Net Commission"}</span>
            <Layers size={13} className="text-purple-500" />
          </div>
          <div className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400">
            {formatPrice(metrics.totalCommission)}
          </div>
          <div className="text-[10px] text-muted">
            {isAr ? `متوسط الطلب: ${formatPrice(metrics.aov)}` : `AOV: ${formatPrice(metrics.aov)}`}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-soft border border-line">
          <div className="flex items-center justify-between text-muted text-[11px] font-semibold mb-1">
            <span>{isAr ? "مستحقات التجار (Payable)" : "Vendor Payable"}</span>
            <DollarSign size={13} className="text-emerald-500" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
            {formatPrice(metrics.netPayable)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">
            {isAr ? "جاهز للتسوية" : "Reconciliation ready"}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-soft border border-line">
          <div className="flex items-center justify-between text-muted text-[11px] font-semibold mb-1">
            <span>{isAr ? "الضرائب والشحن" : "VAT & Shipping"}</span>
            <Package size={13} className="text-blue-500" />
          </div>
          <div className="text-base sm:text-lg font-black text-foreground">
            {formatPrice(metrics.totalVat + metrics.totalShipping)}
          </div>
          <div className="text-[10px] text-muted">
            {isAr ? `${metrics.totalItems} قطعة مباعة` : `${metrics.totalItems} items sold`}
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Real-time Search, Filters, Sorting & CSV Export */}
      <div className="p-4 rounded-2xl bg-surface-soft border border-line flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder={
              isAr
                ? "بحث بالطلب، التتبع، اسم العميل، الهاتف، المتجر..."
                : "Search order #, tracking, customer, phone, store..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-10 pe-4 py-2 rounded-xl bg-surface border border-line text-xs font-semibold text-foreground placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-muted hover:text-foreground bg-surface-soft px-1.5 py-0.5 rounded-md"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters and Sorting Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-surface border border-line rounded-xl px-2.5 py-1.5">
            <Filter size={13} className="text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 text-foreground font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">{isAr ? "كل الحالات" : "All Statuses"}</option>
              <option value="pending">{isAr ? "قيد الانتظار" : "Pending"}</option>
              <option value="paid">{isAr ? "مدفوع" : "Paid"}</option>
              <option value="processing">{isAr ? "جاري التجهيز" : "Processing"}</option>
              <option value="shipped">{isAr ? "تم الشحن" : "Shipped"}</option>
              <option value="delivered">{isAr ? "تم التسليم" : "Delivered"}</option>
              <option value="cancelled">{isAr ? "ملغي" : "Cancelled"}</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5 bg-surface border border-line rounded-xl px-2.5 py-1.5">
            <DollarSign size={13} className="text-muted" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-transparent border-0 text-foreground font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">{isAr ? "كل المدفوعات" : "All Payments"}</option>
              <option value="paid">{isAr ? "تم الدفع (Paid)" : "Paid"}</option>
              <option value="pending">{isAr ? "معلق (Pending)" : "Pending"}</option>
              <option value="failed">{isAr ? "فشل (Failed)" : "Failed"}</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-surface border border-line rounded-xl px-2.5 py-1.5">
            <ArrowUpDown size={13} className="text-muted" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date_desc" | "date_asc" | "amount_desc" | "amount_asc")
              }
              className="bg-transparent border-0 text-foreground font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="date_desc">{isAr ? "الأحدث أولاً" : "Newest"}</option>
              <option value="date_asc">{isAr ? "الأقدم أولاً" : "Oldest"}</option>
              <option value="amount_desc">{isAr ? "القيمة: الأعلى" : "Amount: High"}</option>
              <option value="amount_asc">{isAr ? "القيمة: الأقل" : "Amount: Low"}</option>
            </select>
          </div>

          {/* Export to CSV Button */}
          <button
            type="button"
            onClick={onExportCsv}
            disabled={orders.length === 0}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 touch-manipulation shrink-0"
            title={isAr ? "تصدير كشف التسوية المالية كملف CSV" : "Export financial reconciliation CSV"}
          >
            <FileSpreadsheet size={14} />
            <span>{isAr ? "تصدير CSV" : "Export CSV"}</span>
            <Download size={12} className="opacity-80" />
          </button>
        </div>
      </div>

      {/* Export Notice Badge */}
      {exportNotice && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check size={14} />
          <span>
            {isAr
              ? "تم تصدير كشف التسوية المالية بنجاح متضمناً تفاصيل العمولات والمستحقات!"
              : "Financial reconciliation CSV exported successfully with commissions & vendor payouts!"}
          </span>
        </div>
      )}

      {/* Virtualization Performance Stats Banner */}
      <div className="flex items-center justify-between text-[11px] text-muted px-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {isAr
              ? `عرض افتراضي فائق السرعة: ${processedOrders.length} سجل متاح (عرض النطاق النشط في الذاكرة)`
              : `High-Performance Virtualization: ${processedOrders.length} records ready (rendering visible viewport window)`}
          </span>
        </div>
        <div>
          {searchTerm || statusFilter !== "all" || paymentFilter !== "all" ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPaymentFilter("all");
              }}
              className="text-gold hover:underline font-bold"
            >
              {isAr ? "إعادة ضبط التصفية" : "Reset Filters"}
            </button>
          ) : null}
        </div>
      </div>

      {/* 3. Virtualized Container */}
      {processedOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-soft border border-line text-muted text-xs space-y-2">
          <Package size={28} className="mx-auto opacity-40 text-gold" />
          <p className="font-bold text-foreground">
            {isAr ? "لا توجد طلبات مطابقة للبحث أو التصفية الحالية" : "No orders matching current search or filters"}
          </p>
          <p className="text-[11px]">
            {isAr
              ? "جرّب تغيير كلمات البحث أو تغيير حالة الطلب والدفع"
              : "Try adjusting your search query or status filters"}
          </p>
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="relative overflow-y-auto overflow-x-hidden rounded-2xl border border-line bg-surface select-none"
          style={{ height: CONTAINER_HEIGHT }}
        >
          {/* Scroll spacer ensuring correct scrollbar thumb size */}
          <div style={{ height: totalHeight, width: "100%", position: "relative" }}>
            {visibleOrders.map(({ order: ord, top, height, isExpanded }) => {
              const vendorPayable = Math.max(0, ord.total_amount - (ord.commission_amount || 0));
              const itemsCount = ord.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

              return (
                <div
                  key={ord.id}
                  style={{
                    position: "absolute",
                    top,
                    left: 0,
                    right: 0,
                    height,
                  }}
                  className="px-3 py-1.5"
                >
                  <div
                    className={`h-full rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                      isExpanded
                        ? "bg-surface-soft border-gold/40 shadow-sm"
                        : "bg-surface hover:bg-surface-soft border-line/70"
                    }`}
                  >
                    {/* Primary Row Header */}
                    <div className="p-3 flex items-center justify-between gap-3 text-xs">
                      {/* Order Identification & Customer */}
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleRowExpansion(ord.id)}
                          className="w-6 h-6 rounded-lg bg-surface border border-line flex items-center justify-center text-muted hover:text-foreground shrink-0 transition-transform cursor-pointer"
                          title={isAr ? "عرض تفاصيل التسوية المالية" : "Toggle reconciliation breakdown"}
                        >
                          <ChevronRight
                            size={14}
                            className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                          />
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-foreground text-xs truncate">
                              {ord.orderNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase ${statusBadge(
                                ord.status
                              )}`}
                            >
                              {getStatusLabel(ord.status)}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted truncate mt-0.5">
                            <span className="text-foreground font-semibold">
                              {ord.shipping_info?.fullName || "عميل"}
                            </span>
                            <span className="mx-1">•</span>
                            <span>{ord.shipping_info?.city || "المدينة"}</span>
                            <span className="mx-1">•</span>
                            <span>{ord.shipping_info?.phone || ""}</span>
                          </div>
                        </div>
                      </div>

                      {/* Financial Amount & Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-end">
                          <div className="font-black text-foreground text-sm">
                            {formatPrice(ord.total_amount)}
                          </div>
                          <div className="text-[10px] text-muted">
                            {isAr ? "عمولة:" : "Fee:"}{" "}
                            <span className="text-purple-600 dark:text-purple-400 font-bold">
                              {formatPrice(ord.commission_amount || 0)}
                            </span>
                          </div>
                        </div>

                        {/* Quick Status Select */}
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as Order["status"])}
                          className="px-2 py-1 rounded-lg bg-surface border border-line text-foreground font-bold text-[11px] focus:outline-none focus:border-gold cursor-pointer"
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="paid">مدفوع</option>
                          <option value="processing">جاري التجهيز</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التسليم</option>
                          <option value="cancelled">ملغي</option>
                        </select>

                        <Link
                          href={`/orders?track=${ord.trackingNumber}`}
                          className="p-1.5 rounded-lg text-gold hover:bg-gold/10 transition-colors"
                          title={isAr ? "تتبع الشحنة الحي" : "Live Tracking"}
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>

                    {/* Expanded Financial Reconciliation Details Pane */}
                    {isExpanded && (
                      <div className="border-t border-line/80 px-4 py-3 bg-surface/60 space-y-2 text-xs animate-in fade-in duration-150">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div className="p-2 rounded-lg bg-surface border border-line/60">
                            <span className="text-muted block text-[10px]">{isAr ? "المتجر المستفيد:" : "Store:"}</span>
                            <span className="font-bold text-foreground truncate block">
                              {ord.store_name || ord.store_id || "المتجر الرسمي"}
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-surface border border-line/60">
                            <span className="text-muted block text-[10px]">{isAr ? "طريقة الدفع:" : "Payment Method:"}</span>
                            <span className="font-mono font-bold text-foreground uppercase truncate block">
                              {ord.payment_method || "Stripe/Gateway"} ({ord.payment_status || "paid"})
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-surface border border-line/60">
                            <span className="text-muted block text-[10px]">{isAr ? "رقم التتبع واللوجستيات:" : "Tracking & Logistics:"}</span>
                            <span className="font-mono font-bold text-gold truncate block">
                              {ord.trackingNumber}
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-surface border border-line/60">
                            <span className="text-muted block text-[10px]">{isAr ? "صافي مستحق التاجر:" : "Net Vendor Payable:"}</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 block">
                              {formatPrice(vendorPayable)}
                            </span>
                          </div>
                        </div>

                        {/* Order Items Breakdown */}
                        <div className="pt-1">
                          <div className="text-[11px] font-bold text-muted mb-1 flex items-center justify-between">
                            <span>{isAr ? `العناصر المشتراة (${itemsCount} قطعة):` : `Ordered Items (${itemsCount}):`}</span>
                            <span>
                              {isAr ? "تاريخ الطلب:" : "Date:"}{" "}
                              {ord.created_at ? new Date(ord.created_at).toLocaleString(isAr ? "ar-EG" : "en-US") : ""}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {ord.items && ord.items.length > 0 ? (
                              ord.items.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-surface border border-line text-[10px] text-foreground font-semibold"
                                >
                                  {item.product_name} × {item.quantity} ({formatPrice(item.unit_price)})
                                </span>
                              ))
                            ) : (
                              <span className="text-muted text-[10px] italic">
                                {isAr ? "لا توجد تفاصيل عناصر مسجلة" : "No item line details available"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
