"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Headphones,
  Loader2,
  Mail,
  MessageSquareText,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SUPPORT_EMAIL = "support@noormexa.com";
const INFO_EMAIL = "info@noormexa.com";

const copy = {
  ar: {
    eyebrow: "مركز التواصل الرسمي",
    title: "تواصل مع فريق NOORMEXA",
    subtitle: "قنوات رسمية واضحة للدعم الفني، خدمة العملاء، الاستفسارات التجارية والشراكات.",
    supportTitle: "الدعم الفني وخدمة العملاء",
    supportText: "للحسابات، تسجيل الدخول، الطلبات، الشحن، أو أي مشكلة داخل المنصة.",
    infoTitle: "الاستفسارات العامة والتجارية",
    infoText: "للشراكات، التعاون، الموردين، العلامات التجارية والاستفسارات العامة.",
    secure: "جميع المراسلات الرسمية تتم عبر نطاق noormexa.com",
    formTitle: "أرسل رسالتك مباشرة",
    formHint: "أرسل من داخل الموقع مباشرة. لا تحتاج إلى Gmail أو Outlook مفتوح على جهازك.",
    cardHint: "للإرسال استخدم النموذج المباشر بالأسفل",
    name: "الاسم",
    email: "بريدك الإلكتروني",
    type: "نوع الاستفسار",
    message: "الرسالة",
    namePlaceholder: "اكتب اسمك الكامل",
    emailPlaceholder: "name@example.com",
    messagePlaceholder: "اكتب تفاصيل استفسارك بوضوح...",
    types: ["دعم فني", "حساب وتسجيل دخول", "طلب أو شحنة", "تاجر أو متجر", "شراكة تجارية", "استفسار عام"],
    submit: "إرسال الرسالة",
    sending: "جارٍ الإرسال...",
    success: "تم إرسال رسالتك بنجاح إلى فريق NOORMEXA.",
    error: "تعذر إرسال الرسالة الآن. حاول مرة أخرى بعد قليل.",
    validation: "من فضلك أكمل كل البيانات المطلوبة بشكل صحيح.",
    back: "العودة للرئيسية",
    privacy: "لن نطلب منك كلمة مرور أو API Key أو بيانات بطاقة بنكية عبر البريد.",
  },
  en: {
    eyebrow: "Official contact center",
    title: "Contact the NOORMEXA team",
    subtitle: "Official channels for technical support, customer service, business inquiries and partnerships.",
    supportTitle: "Customer & technical support",
    supportText: "For accounts, sign-in, orders, shipping, or any platform issue.",
    infoTitle: "General & business inquiries",
    infoText: "For partnerships, suppliers, brands, collaboration and general inquiries.",
    secure: "Official communication is handled through the noormexa.com domain",
    formTitle: "Send your message directly",
    formHint: "Send from the website directly. No Gmail or Outlook app is required on your device.",
    cardHint: "Use the direct form below to send your message",
    name: "Name",
    email: "Your email",
    type: "Inquiry type",
    message: "Message",
    namePlaceholder: "Your full name",
    emailPlaceholder: "name@example.com",
    messagePlaceholder: "Describe your request clearly...",
    types: ["Technical support", "Account & sign-in", "Order or shipment", "Seller or store", "Business partnership", "General inquiry"],
    submit: "Send message",
    sending: "Sending...",
    success: "Your message was sent successfully to the NOORMEXA team.",
    error: "We could not send your message right now. Please try again shortly.",
    validation: "Please complete all required fields correctly.",
    back: "Back to home",
    privacy: "We will never ask for passwords, API keys, or card details by email.",
  },
} as const;

type SubmitState = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const { language, isAr } = useLanguage();
  const text = copy[language];
  const [status, setStatus] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState("");

  const directionClass = useMemo(() => (isAr ? "text-right" : "text-left"), [isAr]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      inquiryType: String(data.get("inquiryType") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      website: String(data.get("website") ?? "").trim(),
      language,
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payload.name || !emailPattern.test(payload.email) || !payload.inquiryType || !payload.message) {
      setStatus("error");
      setFeedback(text.validation);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("contact_send_failed");

      setStatus("success");
      setFeedback(text.success);
      form.reset();
    } catch {
      setStatus("error");
      setFeedback(text.error);
    }
  };

  return (
    <main className="min-h-screen bg-background py-8 md:py-12">
      <div className="noormexa-container max-w-6xl">
        <section className="relative overflow-hidden rounded-[28px] border border-line bg-surface shadow-[var(--safe-shadow)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold via-orange-500 to-amber-400" />

          <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-10">
            <div className={directionClass}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface-soft px-3.5 py-2 text-xs font-black text-gold-strong">
                <BadgeCheck size={16} />
                {text.eyebrow}
              </div>
              <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground md:text-5xl">{text.title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">{text.subtitle}</p>

              <div className="mt-7 flex flex-wrap gap-3 text-xs font-bold text-muted">
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-soft px-3 py-2">
                  <ShieldCheck size={15} className="text-emerald-500" />
                  {text.secure}
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-line bg-surface-soft p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-gold-strong">
                    <Headphones size={21} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black text-foreground">{text.supportTitle}</h2>
                    <p className="mt-1 text-xs leading-6 text-muted">{text.supportText}</p>
                    <div className="mt-3 flex items-center gap-2 text-sm font-black text-gold-strong" dir="ltr">
                      <Mail size={15} /> {SUPPORT_EMAIL}
                    </div>
                    <p className="mt-2 text-[11px] font-bold text-muted">{text.cardHint}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-surface-soft p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-foreground">
                    <MessageSquareText size={21} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black text-foreground">{text.infoTitle}</h2>
                    <p className="mt-1 text-xs leading-6 text-muted">{text.infoText}</p>
                    <div className="mt-3 flex items-center gap-2 text-sm font-black text-foreground" dir="ltr">
                      <Mail size={15} /> {INFO_EMAIL}
                    </div>
                    <p className="mt-2 text-[11px] font-bold text-muted">{text.cardHint}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-line bg-surface p-6 shadow-[var(--soft-shadow)] md:p-10">
          <div className={directionClass}>
            <h2 className="text-2xl font-black text-foreground md:text-3xl">{text.formTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{text.formHint}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 grid gap-5 md:grid-cols-2">
            <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

            <label className="grid gap-2 text-sm font-black text-foreground">
              {text.name}
              <input name="name" type="text" autoComplete="name" required maxLength={100} placeholder={text.namePlaceholder} className="h-12 rounded-xl border border-line bg-surface-soft px-4 text-foreground outline-none transition placeholder:text-muted/60 focus:border-gold focus:ring-2 focus:ring-gold/15" />
            </label>

            <label className="grid gap-2 text-sm font-black text-foreground">
              {text.email}
              <input name="email" type="email" autoComplete="email" required maxLength={160} placeholder={text.emailPlaceholder} dir="ltr" className="h-12 rounded-xl border border-line bg-surface-soft px-4 text-left text-foreground outline-none transition placeholder:text-muted/60 focus:border-gold focus:ring-2 focus:ring-gold/15" />
            </label>

            <label className="grid gap-2 text-sm font-black text-foreground md:col-span-2">
              {text.type}
              <select name="inquiryType" required defaultValue="" className="h-12 rounded-xl border border-line bg-surface-soft px-4 text-foreground outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15">
                <option value="" disabled>{text.type}</option>
                {text.types.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-black text-foreground md:col-span-2">
              {text.message}
              <textarea name="message" required rows={7} maxLength={4000} placeholder={text.messagePlaceholder} className="resize-y rounded-xl border border-line bg-surface-soft p-4 text-foreground outline-none transition placeholder:text-muted/60 focus:border-gold focus:ring-2 focus:ring-gold/15" />
            </label>

            {feedback ? (
              <div className={`md:col-span-2 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold ${status === "success" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                {status === "success" ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
                {feedback}
              </div>
            ) : null}

            <div className="md:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button type="submit" disabled={status === "sending"} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-strong px-7 font-black text-white shadow-[var(--soft-shadow)] transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70">
                {status === "sending" ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {status === "sending" ? text.sending : text.submit}
              </button>

              <Link href="/" className="inline-flex items-center justify-center gap-2 text-sm font-black text-muted transition hover:text-gold-strong">
                {text.back}
                <ArrowRight size={17} className={isAr ? "" : "rotate-180"} />
              </Link>
            </div>
          </form>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-surface-soft px-4 py-4 text-xs font-semibold leading-6 text-muted">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-500" />
            {text.privacy}
          </div>
        </section>
      </div>
    </main>
  );
}
