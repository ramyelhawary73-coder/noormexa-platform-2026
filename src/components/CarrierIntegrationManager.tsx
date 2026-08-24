"use client";

import React, { useState } from "react";
import type { ShippingCarrier } from "@/types/marketplace";
import {
  testCarrierConnection,
  type CarrierTestResult,
} from "@/lib/carrierIntegration";
import {
  Key,
  ShieldCheck,
  Zap,
  Globe,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
  Check,
  Server,
  Radio,
  FileCode2,
  HelpCircle,
} from "lucide-react";

interface CarrierIntegrationManagerProps {
  carrier: ShippingCarrier;
  isAr: boolean;
  onUpdate: (updatedCarrier: Partial<ShippingCarrier>) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export function CarrierIntegrationManager({
  carrier,
  isAr,
  onUpdate,
  onClose,
  onToast,
}: CarrierIntegrationManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"credentials" | "endpoints" | "webhooks" | "guide">("credentials");
  
  // Local form state
  const [environment, setEnvironment] = useState<"sandbox" | "production">(
    carrier.apiEnvironment || "sandbox"
  );
  const [apiKey, setApiKey] = useState(carrier.apiKey || "");
  const [apiSecret, setApiSecret] = useState(carrier.apiSecret || "");
  const [accountNumber, setAccountNumber] = useState(carrier.accountNumber || "");
  const [accountEntity, setAccountEntity] = useState(carrier.accountEntity || "KSA");
  const [apiEndpoint, setApiEndpoint] = useState(carrier.apiEndpoint || "");
  const [webhookUrl] = useState(carrier.webhookUrl || `https://api.noormexa.com/v1/webhooks/carrier/${carrier.code.toLowerCase()}`);
  const [webhookSecret, setWebhookSecret] = useState(carrier.webhookSecret || `whsec_${carrier.code.toLowerCase()}_live_token`);
  
  // UI visibility
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<CarrierTestResult | null>(null);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
      onToast(isAr ? "تم النسخ إلى الحافظة" : "Copied to clipboard");
    }
  };

  const handleRunHandshakeTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testCarrierConnection({
        carrierCode: carrier.code,
        apiKey: apiKey,
        apiSecret: apiSecret,
        accountNumber: accountNumber,
        accountEntity: accountEntity,
        environment: environment,
      });

      setTestResult(res);

      if (res.success) {
        onToast(
          isAr
            ? `✓ تم التحقق بنجاح (${res.latencyMs}ms): ${res.messageAr}`
            : `✓ Connected (${res.latencyMs}ms): ${res.messageEn}`
        );
      } else {
        onToast(
          isAr ? `تنبيه: ${res.messageAr}` : `Warning: ${res.messageEn}`
        );
      }
    } catch {
      setTestResult({
        success: false,
        status: "error",
        latencyMs: 120,
        messageAr: "فشل الاتصال بالخادم. يرجى التحقق من صحة الرابط والبيانات.",
        messageEn: "Connection failed. Please check endpoints and network.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveIntegration = () => {
    const hasKeys = apiKey.trim().length > 0;
    const isSuccess = testResult?.success ?? hasKeys;
    const newStatus = !hasKeys
      ? "pending_keys"
      : environment === "production"
      ? isSuccess
        ? "connected"
        : "error"
      : "sandbox";

    onUpdate({
      apiEnvironment: environment,
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim(),
      accountNumber: accountNumber.trim(),
      accountEntity: accountEntity.trim(),
      apiEndpoint: apiEndpoint.trim(),
      webhookUrl: webhookUrl.trim(),
      webhookSecret: webhookSecret.trim(),
      integrationStatus: newStatus,
      lastSyncAt: new Date().toLocaleString(isAr ? "ar-EG" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      lastTestSuccess: isSuccess,
      lastTestMessage: testResult?.messageAr || (hasKeys ? "تم حفظ المفاتيح بنجاح" : "بانتظار إدخال المفاتيح"),
    });

    onToast(
      isAr
        ? `تم حفظ إعدادات ربط شركة (${carrier.nameAr}) بنجاح!`
        : `Carrier settings for (${carrier.nameEn}) saved successfully!`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-surface border border-line rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header: Carrier Info & Status */}
        <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-soft border border-line p-2 flex items-center justify-center overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={carrier.logoUrl}
                alt={carrier.nameAr}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-foreground">
                  {isAr ? `إدارة ربط: ${carrier.nameAr}` : `Carrier API: ${carrier.nameEn}`}
                </h3>
                <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {carrier.code}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {isAr
                  ? "تكوين مفاتيح الربط الحقيقي، استلام الـ Webhooks، واختبار الاتصال المباشر."
                  : "Configure production/sandbox API credentials, webhooks, and live diagnostics."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-surface-soft cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Status Banner */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            carrier.integrationStatus === "connected"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : carrier.integrationStatus === "sandbox"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
              : carrier.integrationStatus === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
              : "bg-surface-soft border-line text-muted"
          }`}
        >
          <div className="flex items-center gap-2">
            {carrier.integrationStatus === "connected" ? (
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : carrier.integrationStatus === "sandbox" ? (
              <Radio size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
            ) : carrier.integrationStatus === "error" ? (
              <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <Key size={16} className="text-muted shrink-0" />
            )}
            <div>
              <span className="font-bold block">
                {carrier.integrationStatus === "connected"
                  ? isAr ? "متصل بالإنتاج (Production Live)" : "Connected (Live Production)"
                  : carrier.integrationStatus === "sandbox"
                  ? isAr ? "وضع الاختبار التجريبي (Sandbox Test)" : "Sandbox / Test Mode"
                  : carrier.integrationStatus === "error"
                  ? isAr ? "خطأ في التوثيق أو الاتصال" : "Connection/Auth Error"
                  : isAr ? "بانتظار إدخال المفاتيح الحقيقية" : "Pending API Credentials"}
              </span>
              <span className="text-[11px] opacity-85">
                {carrier.lastTestMessage || (isAr ? "لم يتم إجراء اختبار للاتصال بعد" : "No recent diagnostic ping")}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] block opacity-75 font-mono">
              {carrier.lastSyncAt ? carrier.lastSyncAt : (isAr ? "غير متزامن" : "Unsynced")}
            </span>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-line pb-2 text-xs overflow-x-auto">
          {[
            { id: "credentials", labelAr: "مفاتيح الربط والتوثيق", labelEn: "API Credentials", icon: Key },
            { id: "endpoints", labelAr: "نقاط النهاية والبيئة", labelEn: "Endpoints & Env", icon: Server },
            { id: "webhooks", labelAr: "إشعارات الـ Webhooks", labelEn: "Webhooks", icon: Radio },
            { id: "guide", labelAr: "دليل الربط والتوثيق", labelEn: "Docs & Guides", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted hover:text-foreground hover:bg-surface-soft"
                }`}
              >
                <Icon size={13} />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: CREDENTIALS */}
        {activeSubTab === "credentials" && (
          <div className="space-y-4 text-xs">
            {/* Environment Toggle */}
            <div className="p-3.5 rounded-2xl bg-surface-soft border border-line flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-foreground block">
                  {isAr ? "بيئة العمل (Environment):" : "Environment:"}
                </span>
                <span className="text-muted text-[11px]">
                  {environment === "production"
                    ? isAr ? "البيئة الحية - ستصدر بوالص رسمية حقيقية وتكاليف فعلية" : "Live Production - Generates real waybills & billed"
                    : isAr ? "بيئة التجارب والاختبار (Sandbox) - آمن للتجربة بدون رسوم" : "Sandbox Mode - Test endpoints with zero charges"}
                </span>
              </div>

              <div className="flex rounded-xl p-1 bg-surface border border-line">
                <button
                  type="button"
                  onClick={() => setEnvironment("sandbox")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    environment === "sandbox"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => setEnvironment("production")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    environment === "production"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Production (حي)
                </button>
              </div>
            </div>

            {/* API Key / Token */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-foreground flex items-center gap-1.5">
                  <Key size={13} className="text-amber-500" />
                  <span>{isAr ? "مفتاح الربط الأساسي (API Key / Authorization Token):" : "Primary API Key / Access Token:"}</span>
                </label>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  {isAr ? "إلزامي للربط" : "Required"}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    carrier.code === "SMSA"
                      ? "SMSA PassKey (e.g. Testing0@ / PassKey_...)"
                      : carrier.code === "BOSTA"
                      ? "Bosta Bearer Token (e.g. eyJhbGciOi...)"
                      : "أدخل الـ API Key الخاص بحسابك لدى الشركة"
                  }
                  className="w-full pl-20 pr-10 py-2.5 rounded-xl bg-surface-soft border border-line text-foreground font-mono text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => handleCopy(apiKey, "apiKey")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground font-mono text-[10px] flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded border border-line"
                  >
                    {copiedKey === "apiKey" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    <span>{copiedKey === "apiKey" ? (isAr ? "تم" : "Copied") : (isAr ? "نسخ" : "Copy")}</span>
                  </button>
                )}
              </div>
            </div>

            {/* API Secret (for DHL, FedEx, etc.) */}
            {(carrier.code === "DHL" || carrier.code === "FEDEX" || carrier.code === "ARAMEX") && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-amber-500" />
                    <span>{isAr ? "المفتاح السري (API Secret / Password):" : "API Secret / OAuth Client Secret:"}</span>
                  </label>
                  <span className="text-[10px] text-muted">
                    {carrier.code === "DHL" ? "DHL Secret" : "Client Secret"}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="e.g. sec_live_99a8b7c6..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-soft border border-line text-foreground font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* Account Number & Entity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  {isAr ? "رقم الحساب التجاري (Account Number):" : "Account Number / PIN:"}
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={
                    carrier.code === "ARAMEX"
                      ? "e.g. ARX-GCC-12345"
                      : carrier.code === "DHL"
                      ? "e.g. 963852741"
                      : "Account No."
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-soft border border-line text-foreground font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  {isAr ? "رمز الكيان / الدولة (Account Entity / Country Code):" : "Account Entity / Pin Country:"}
                </label>
                <input
                  type="text"
                  value={accountEntity}
                  onChange={(e) => setAccountEntity(e.target.value.toUpperCase())}
                  placeholder="KSA / EGY / DXB / AMM"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-soft border border-line text-foreground font-mono text-xs uppercase focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ENDPOINTS */}
        {activeSubTab === "endpoints" && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Server size={13} className="text-amber-500" />
                <span>{isAr ? "رابط نقطة النهاية (API Endpoint URL):" : "Base API Endpoint:"}</span>
              </label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="https://api.carrier.com/v1"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-soft border border-line text-foreground font-mono text-xs focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-muted">
                {isAr
                  ? "يتم توجيه طلبات إصدار البوالص وحساب الأسعار التلقائي إلى هذا المسار."
                  : "All waybill creation and rate quotes queries are dispatched to this REST/SOAP URL."}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-soft border border-line space-y-2">
              <span className="font-bold text-foreground block">
                {isAr ? "الخدمات المدعومة للربط التلقائي:" : "Enabled Automated Workflows:"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>{isAr ? "توليد بوالص AWB بصيغة PDF و Thermal" : "AWB Generation (PDF & ZPL)"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>{isAr ? "حساب الأسعار اللحظية (Rate Matrix)" : "Instant Rate Quoting"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>{isAr ? "جدولة مندوب الاستلام (Pickup Request)" : "Automated Driver Pickup Dispatch"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>{isAr ? "تتبع الحالات عبر Push Webhook" : "Status Checkpoint Webhook Listeners"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WEBHOOKS */}
        {activeSubTab === "webhooks" && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Radio size={13} className="text-amber-500" />
                <span>{isAr ? "رابط الـ Webhook الخاص بنورميكسا (ضع هذا الرابط في لوحة تحكم شركة الشحن):" : "NOORMEXA Incoming Webhook URL (Copy to Carrier Portal):"}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full pl-20 pr-3 py-2.5 rounded-xl bg-surface-soft border border-line text-foreground font-mono text-xs select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(webhookUrl, "whUrl")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground font-mono text-[10px] flex items-center gap-1 bg-surface px-2 py-1 rounded border border-line"
                >
                  {copiedKey === "whUrl" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>{copiedKey === "whUrl" ? (isAr ? "تم" : "Copied") : (isAr ? "نسخ" : "Copy")}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                {isAr ? "المفتاح السري لتأمين الـ Webhook (Signature Secret):" : "Webhook Signature Secret:"}
              </label>
              <input
                type="text"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-soft border border-line text-foreground font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-1 text-[11px]">
              <span className="font-bold block">
                {isAr ? "💡 كيف تعمل الـ Webhooks؟" : "💡 How Webhooks Work:"}
              </span>
              <p>
                {isAr
                  ? "عندما يقوم مندوب التوصيل بتحديث حالة الشحنة (تم الاستلام، في الطريق، تم التسليم للمشتري)، تقوم شركة الشحن بإرسال إشعار فوري لمنصتك لتحديث خريطة التتبع وإرسال رسالة واتساب للعميل تلقائياً."
                  : "When a courier scans a package checkpoint, the carrier triggers an instant push to this webhook to update your tracking timeline and notify the customer in real-time."}
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: DOCS & GUIDES */}
        {activeSubTab === "guide" && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-surface-soft border border-line space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <FileCode2 size={15} className="text-amber-500" />
                  <span>{isAr ? `خطوات الحصول على مفتاح ${carrier.nameAr}:` : `How to get credentials for ${carrier.nameEn}:`}</span>
                </span>

                {carrier.developerDocsUrl && (
                  <a
                    href={carrier.developerDocsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>{isAr ? "بوابة المطورين الرسمية" : "Developer Portal"}</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <ol className="list-decimal list-inside space-y-2 text-muted leading-relaxed">
                <li>
                  {isAr
                    ? "سجل حساب أعمال أو شركات رسمي لدى موقع الشركة (Business Account)."
                    : "Create a verified Corporate / Business merchant account on the carrier portal."}
                </li>
                <li>
                  {isAr
                    ? "توجه إلى قسم (API & Integration) أو بوابة المطورين واضغط على (Generate API Key / Passkey)."
                    : "Navigate to Developers / Integration section and click Generate API Key."}
                </li>
                <li>
                  {isAr
                    ? "انسخ الـ API Key ورقم الحساب والصقهما في تبويب (مفاتيح الربط والتوثيق) أعلاه."
                    : "Copy your API Key and Account Number and paste them into the Credentials tab above."}
                </li>
                <li>
                  {isAr
                    ? "اضغط على زر (فحص واختبار الاتصال) بالأسفل للتحقق من الاتصال قبل الحفظ."
                    : "Click (Run Handshake Diagnostic) to test the live connection before saving."}
                </li>
              </ol>
            </div>

            {carrier.portalLoginUrl && (
              <div className="flex justify-end">
                <a
                  href={carrier.portalLoginUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-surface border border-line hover:border-foreground text-foreground font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Globe size={13} />
                  <span>{isAr ? "فتح موقع الشركة الرسمي" : "Open Carrier Portal"}</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Live Test Diagnostic Output */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-200 ${
              testResult.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
                : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                {testResult.success ? (
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span>
                  {testResult.success
                    ? isAr ? "نجح فحص الاتصال (Handshake Succeeded)" : "Connection Successful"
                    : isAr ? "فشل التحقق من الاتصال" : "Verification Failed"}
                </span>
              </div>
              <span className="font-mono text-[11px] opacity-80">
                {testResult.latencyMs} ms
              </span>
            </div>

            <p className="leading-relaxed">
              {isAr ? testResult.messageAr : testResult.messageEn}
            </p>

            {testResult.details?.notes && (
              <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90 pt-1 border-t border-current/10">
                {testResult.details.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Test Handshake Button */}
          <button
            type="button"
            onClick={handleRunHandshakeTest}
            disabled={isTesting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-soft hover:bg-surface-muted text-foreground border border-line font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isTesting ? (
              <RotateCcw size={13} className="animate-spin text-amber-500" />
            ) : (
              <Zap size={13} className="text-amber-500" />
            )}
            <span>
              {isTesting
                ? isAr ? "جاري الفحص المباشر..." : "Testing Handshake..."
                : isAr ? "فحص واختبار الاتصال (Test Ping)" : "Test Live Connection"}
            </span>
          </button>

          {/* Cancel & Save */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-surface-soft text-muted hover:text-foreground font-bold text-xs transition-colors cursor-pointer"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleSaveIntegration}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>{isAr ? "حفظ وتفعيل الربط" : "Save & Activate"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
