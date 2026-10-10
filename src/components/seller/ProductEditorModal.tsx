"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, CircleAlert, Eye, FileText, Images, Loader2, Package, Save, X } from "lucide-react";
import SmartImageUploadField from "@/components/SmartImageUploadField";
import styles from "./ProductEditorModal.module.css";
import type { Category, Product } from "@/types/marketplace";
import {
  initialProductDraft, isDraftSellable, isLegacyPreviewDescription,
  requiresSaleConfirmation, validateProductDraft,
  type ProductEditorDraft, type ProductEditorIssue,
} from "@/lib/productEditorRules";

type Tab = "basic" | "media" | "pricing" | "publish";

type Props = {
  product: Product | null;
  categories: Category[];
  storeName: string;
  isAr: boolean;
  onClose: () => void;
  onSave: (draft: ProductEditorDraft) => Promise<{ success: boolean; error?: string }>;
};

export default function ProductEditorModal({
  product, categories, storeName, isAr, onClose, onSave,
}: Props) {
  const [baseline] = useState(() => initialProductDraft(product, categories[0]?.id ?? ""));
  const [draft, setDraft] = useState<ProductEditorDraft>(baseline);
  const [tab, setTab] = useState<Tab>("basic");
  const [issue, setIssue] = useState<ProductEditorIssue | null>(null);
  const [remoteError, setRemoteError] = useState("");
  const [verifiedSale, setVerifiedSale] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingGuard = useRef(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const sellable = isDraftSellable(draft);
  const saleConfirmationRequired = requiresSaleConfirmation(draft, product);
  const legacyAr = isLegacyPreviewDescription(draft.description);
  const legacyEn = isLegacyPreviewDescription(draft.descriptionEn);

  const close = () => {
    if (savingGuard.current) return;
    if (dirty && !window.confirm(isAr
      ? "عندك تعديلات لم تُحفظ. هل تريد إغلاق المحرر وفقد التعديلات؟"
      : "You have unsaved changes. Discard them and close?")) return;
    onClose();
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        if (savingGuard.current) return;
        if (JSON.stringify(draft) !== JSON.stringify(baseline) &&
            !window.confirm(isAr ? "التعديلات غير محفوظة. هل تريد الخروج؟" : "Discard unsaved changes?")) return;
        onClose();
      }
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [draft, isAr, onClose]);

  const update = <K extends keyof ProductEditorDraft>(key: K, value: ProductEditorDraft[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setIssue(null);
    setRemoteError("");
    if (key === "price" || key === "stock" || key === "status") setVerifiedSale(false);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingGuard.current) return;
    if (product && !dirty) { onClose(); return; }
    const validation = validateProductDraft(draft, product, new Set(categories.map((c) => c.id)));
    if (validation) { setIssue(validation); setTab(validation.tab); return; }
    if (saleConfirmationRequired && !verifiedSale) {
      setTab("publish");
      setIssue({ tab: "publish", ar: "أكد مراجعة السعر والمخزون وحقوق الصورة قبل تفعيل البيع.", en: "Confirm price, stock and image rights before enabling checkout." });
      return;
    }
    if (saleConfirmationRequired && !window.confirm(isAr
      ? "تأكيد نهائي: المنتج سيصبح متاحًا للشراء فور الحفظ، وسيعتمد على السعر والمخزون المُدخلين. متابعة؟"
      : "Final confirmation: saving will immediately enable checkout with the entered price and stock. Continue?")) return;
    savingGuard.current = true;
    setSaving(true);
    setRemoteError("");
    try {
      const result = await onSave(draft);
      if (!result.success) setRemoteError(result.error || (isAr ? "تعذر حفظ المنتج." : "Unable to save product."));
    } catch {
      setRemoteError(isAr ? "حدث خطأ أثناء الحفظ. لم يتم تأكيد العملية." : "Save failed; operation was not confirmed.");
    } finally {
      savingGuard.current = false;
      setSaving(false);
    }
  };

  const sections: { id: Tab; icon: typeof FileText; ar: string; en: string }[] = [
    { id: "basic", icon: FileText, ar: "البيانات الأساسية", en: "Details" },
    { id: "media", icon: Images, ar: "الصور والوسائط", en: "Images" },
    { id: "pricing", icon: Package, ar: "الأسعار والمخزون", en: "Pricing & stock" },
    { id: "publish", icon: Eye, ar: "النشر والبيع", en: "Publishing" },
  ];

  const inputClass = "w-full min-w-0 min-h-10 rounded-xl border border-line bg-surface-soft px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-gold";
  const labelClass = "block mb-1.5 text-xs font-bold text-foreground";

  return (
    <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
      className={styles.backdrop}>
      <section role="dialog" aria-modal="true" aria-labelledby="seller-product-editor-title"
        dir={isAr ? "rtl" : "ltr"}
        className={styles.dialog}>
        <header className={`${styles.header} flex items-center justify-between gap-3`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 id="seller-product-editor-title" className="text-base font-black tracking-tight md:text-lg">
                {product ? (isAr ? "تعديل المنتج" : "Edit product") : (isAr ? "منتج جديد" : "New product")}
              </h2>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${sellable ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                {sellable ? (isAr ? "جاهز للبيع" : "Sellable") : draft.status === "hidden"
                  ? (isAr ? "مخفي" : "Hidden")
                  : draft.status === "out_of_stock" ? (isAr ? "نفد المخزون" : "Out of stock")
                  : (isAr ? "كتالوج للعرض" : "Preview only")}
              </span>
            </div>
            <p className="max-w-[400px] truncate text-[11px] text-muted">{storeName}{product ? ` · ${product.id}` : ""}</p>
          </div>
          <button type="button" aria-label={isAr ? "إغلاق المحرر" : "Close editor"} onClick={close}
            disabled={saving} className="rounded-xl p-2 text-muted hover:bg-surface-soft hover:text-foreground disabled:opacity-50">
            <X size={22}/>
          </button>
        </header>

        <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <nav aria-label={isAr ? "أقسام تعديل المنتج" : "Product editor sections"}
            className={styles.tabBar}>
            {sections.map(({ id, icon: Icon, ar, en }) => (
              <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? "step" : undefined}
                className={`${styles.tabButton} ${tab === id
                  ? "bg-gold text-navy" : "text-muted hover:bg-surface-soft hover:text-foreground"}`}>
                <Icon size={15}/>{isAr ? ar : en}
                {issue?.tab === id && <CircleAlert size={14} className="text-rose-500"/>}
              </button>
            ))}
          </nav>

          <div className={styles.scrollArea}>
            <div className={styles.content}>
            {(issue?.tab === tab || remoteError) && (
              <div role="alert" className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
                {remoteError || (isAr ? issue?.ar : issue?.en)}
              </div>
            )}

            {tab === "basic" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black">{isAr ? "هوية المنتج" : "Product identity"}</h3>
                  <p className="text-xs text-muted">{isAr ? "اكتب أسماء وأوصاف المنتج كما ستظهر للعملاء، بدون ادعاءات تجريبية." : "Use accurate customer-facing names and descriptions."}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label><span className={labelClass}>{isAr ? "اسم المنتج بالعربية *" : "Arabic name *"}</span>
                    <input className={inputClass} value={draft.name} onChange={(e) => update("name", e.target.value)} maxLength={180} autoComplete="off" dir="rtl"/></label>
                  <label><span className={labelClass}>{isAr ? "الاسم بالإنجليزية" : "English name"}</span>
                    <input className={inputClass} value={draft.nameEn} onChange={(e) => update("nameEn", e.target.value)} maxLength={180} dir="ltr"/></label>
                </div>
                <label className="block"><span className={labelClass}>{isAr ? "التصنيف *" : "Category *"}</span>
                  <select value={draft.categoryId} onChange={(e) => update("categoryId", e.target.value)} className={inputClass}>
                    <option value="">{isAr ? "اختر التصنيف" : "Choose category"}</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{isAr ? c.name_ar : c.name_en}</option>)}
                  </select></label>
                <label className="block"><span className={labelClass}>{isAr ? "الوصف التفصيلي بالعربية" : "Arabic description"}</span>
                  <textarea rows={3} className={inputClass} value={draft.description} onChange={(e) => update("description", e.target.value)} dir="rtl" maxLength={10000}/>
                </label>
                {legacyAr && <p className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                  {isAr ? "هذا وصف الاستيراد التجريبي. يمكنك الاحتفاظ به أثناء العرض فقط، لكن يلزم استبداله بوصف حقيقي قبل البيع." :
                    "This is placeholder copy. Replace it with genuine product details before selling."}
                </p>}
                <label className="block"><span className={labelClass}>{isAr ? "الوصف الإنجليزي" : "English description"}</span>
                  <textarea rows={3} className={inputClass} value={draft.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} dir="ltr" maxLength={10000}/>
                </label>
                {legacyEn && <p className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                  {isAr ? "الوصف الإنجليزي أيضًا تجريبي؛ استبدله قبل تفعيل البيع." : "Replace this English placeholder before making the item sellable."}
                </p>}
              </div>
            )}

            {tab === "media" && (
              <div className="space-y-4">
                <div><h3 className="text-base font-black">{isAr ? "الصور والوسائط" : "Images and media"}</h3>
                  <p className="text-xs text-muted">{isAr ? "الصورة الحالية محفوظة كما هي حتى تختار صورة بديلة. راجع حقوق استخدام الصور قبل بيع المنتج." :
                    "Existing images remain unchanged until you replace them. Confirm usage rights before selling."}</p></div>
                <SmartImageUploadField label={isAr ? "الصورة الرئيسية" : "Primary image"} value={draft.imageUrl}
                  onChange={(url) => update("imageUrl", url)} aspectRatio="1:1" isAr={isAr} collapsibleUrl
                  helperText={isAr ? "يمكنك رفع صورة أو قصها أو تحرير رابطها عند الحاجة." : "Upload, crop or optionally edit the image URL."}/>
              </div>
            )}

            {tab === "pricing" && (
              <div className="space-y-4">
                <div><h3 className="text-base font-black">{isAr ? "السعر والمخزون" : "Price and stock"}</h3>
                  <p className="text-xs text-muted">{isAr ? "الأسعار تُحفظ بالجنيه المصري (EGP) وهو سعر قاعدة البيانات الأساسي. سعر 0 أو مخزون 0 يعني العرض فقط." :
                    "Prices are stored in the database's base currency EGP. Zero price or stock means preview only."}</p></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label><span className={labelClass}>{isAr ? "سعر البيع (ج.م) *" : "Price (EGP) *"}</span>
                    <input type="number" min="0" step="0.01" inputMode="decimal" className={inputClass} dir="ltr"
                      value={draft.price} onChange={(e) => update("price", e.target.value)}/></label>
                  <label><span className={labelClass}>{isAr ? "السعر قبل الخصم (اختياري)" : "Compare-at price"}</span>
                    <input type="number" min="0" step="0.01" inputMode="decimal" className={inputClass} dir="ltr"
                      value={draft.originalPrice} onChange={(e) => update("originalPrice", e.target.value)}/></label>
                  <label><span className={labelClass}>{isAr ? "الكمية المتاحة *" : "Stock quantity *"}</span>
                    <input type="number" min="0" step="1" inputMode="numeric" className={inputClass} dir="ltr"
                      value={draft.stock} onChange={(e) => update("stock", e.target.value)}/></label>
                </div>
                <div className="rounded-xl border border-line bg-surface-soft p-3 text-sm">
                  <div className="flex items-center gap-2 font-black">{sellable ? <BadgeCheck className="text-emerald-600" size={18}/> : <CircleAlert className="text-amber-600" size={18}/>}
                    {sellable ? (isAr ? "المنتج مؤهل للبيع إذا تم اعتماد النشر" : "Item can become sellable after approval") :
                      (isAr ? "كتالوج للعرض فقط حاليًا" : "Preview only")}
                  </div>
                  <p className="mt-1 text-xs text-muted">{isAr ? "ظهور المنتج للزوار منفصل عن إمكانية الشراء. يعتمد الشراء على حالة النشر والسعر والمخزون الحقيقيين." :
                    "Visibility and checkout are separate. Checkout requires active status, genuine price and stock."}</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" className="accent-[#d4af37]" checked={draft.freeShipping}
                    onChange={(e) => update("freeShipping", e.target.checked)}/>
                  {isAr ? "شحن مجاني لهذا المنتج (فقط إذا كان متاحًا فعلًا)" : "Free shipping (only when genuinely available)"}
                </label>
              </div>
            )}

            {tab === "publish" && (
              <div className="space-y-4">
                <div><h3 className="text-base font-black">{isAr ? "الظهور وتفعيل البيع" : "Visibility and activation"}</h3>
                  <p className="text-xs text-muted">{isAr ? "إخفاء المنتج يمنع ظهوره العام؛ إظهاره بسعر أو مخزون صفر يجعله للعرض فقط." :
                    "Hidden products are private; visible zero-price or zero-stock items are preview only."}</p></div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(["active", "hidden", "out_of_stock"] as const).map((status) => (
                    <button key={status} type="button" onClick={() => update("status", status)}
                      aria-pressed={draft.status === status}
                      className={`rounded-xl border p-3 text-start transition-colors ${draft.status === status
                        ? "border-gold bg-gold/10" : "border-line bg-surface-soft hover:border-gold/50"}`}>
                      <div className="flex items-center gap-2 text-sm font-black">{status === "active" ? <Eye size={18}/> : <Package size={18}/>}
                        {status === "active" ? (isAr ? "ظاهر في المتجر" : "Visible") : status === "hidden"
                          ? (isAr ? "مخفي عن الزوار" : "Hidden") : (isAr ? "نفد من المخزون" : "Out of stock")}
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted">{status === "active"
                        ? (isAr ? "للبيع فقط عند اعتماد السعر والمخزون والوصف." : "Checkout only after verified price, stock and copy.")
                        : status === "hidden" ? (isAr ? "محفوظ في لوحة الإدارة ولا يظهر للعامة." : "Visible to staff only.")
                        : (isAr ? "احتفظ بحالة نفاد المخزون حتى تقرر إتاحته مجددًا." : "Keep this sold-out status until you intentionally reactivate it.")}</p>
                    </button>
                  ))}
                </div>
                {saleConfirmationRequired && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                    <div className="flex gap-2 text-sm font-bold"><CircleAlert size={18} className="shrink-0 text-amber-600"/>
                      {isAr ? "تنبيه: الحفظ بعد التأكيد سيفعّل الشراء فورًا." : "Warning: confirming and saving will enable checkout immediately."}</div>
                    <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm">
                      <input type="checkbox" className="mt-1 accent-[#d4af37]" checked={verifiedSale}
                        onChange={(e) => { setVerifiedSale(e.target.checked); setIssue(null); }}/>
                      <span>{isAr ? "راجعت السعر الحقيقي والمخزون المتاح ومصدر الصورة ومواصفات المنتج، وأوافق على تفعيل البيع." :
                        "I verified the real price, available stock, image rights and product details, and approve selling."}</span>
                    </label>
                  </div>
                )}
                <div className="rounded-xl border border-line bg-surface-soft p-3 text-xs text-muted">
                  {isAr ? "لا يتم حذف النصوص التجريبية أو تغيير صور المنتجات تلقائيًا. ستُطلب منك أوصاف حقيقية قبل تمكين الشراء." :
                    "Existing text or images are never automatically deleted. Genuine descriptions are required before selling."}
                </div>
              </div>
            )}
            </div>
          </div>

          <footer className={styles.footer}>
            <div className="text-xs text-muted">
              {dirty ? (isAr ? "تغييرات غير محفوظة" : "Unsaved changes") : (isAr ? "لا توجد تغييرات جديدة" : "No new changes")}
            </div>
            <div className={`${styles.footerActions} flex items-center gap-2`}>
              <button type="button" onClick={close} disabled={saving}
                className="rounded-xl border border-line px-3.5 py-2.5 text-sm font-bold text-muted hover:text-foreground disabled:opacity-50">
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-black text-navy hover:bg-gold-strong disabled:opacity-60">
                {saving ? <Loader2 size={17} className="animate-spin"/> : <Save size={17}/>}
                {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : product ? (isAr ? "حفظ التعديلات" : "Save changes") : (isAr ? "إضافة المنتج" : "Create product")}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
