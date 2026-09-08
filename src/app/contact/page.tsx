"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
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
    badge: "قنوات التواصل الرسمية",
    title: "تواصل مع فريق NOORMEXA",
    subtitle:
      "يسعدنا مساعدتك في الاستفسارات العامة، الدعم الفني، الحسابات، الطلبات، والتعاون التجاري عبر قنواتنا الرسمية.",
    supportTitle: "الدعم الفني وخدمة العملاء",
    supportText: "للمساعدة في الحساب، الطلبات، أو أي مشكلة داخل المنصة.",
    infoTitle: "الاستفسارات العامة والتجارية",
    infoText: "للشراكات، التعاون، والاستفسارات العامة عن NOORMEXA.",
    official: "عناوين رسمية على نطاق noormexa.com",
    formTitle: "أرسل رسالة لفريق الدعم",
    formHint:
      "بعد الضغط على إرسال، سيفتح تطبيق البريد على جهازك برسالة مجهزة إلى فريق الدعم. لن يتم حفظ بيانات الرسالة داخل NOORMEXA.",
    name: "الاسم",
    email: "بريدك الإلكتروني",
    type: "نوع الاستفسار",
    message: "الرسالة",
    namePlaceholder: "اكتب اسمك",
    emailPlaceholder: "name@example.com",
    messagePlaceholder: "اكتب تفاصيل استفسارك بوضوح...",
    types: ["دعم فني", "حساب وتسجيل دخول", "طلب أو شحنة", "تاجر أو متجر", "شراكة تجارية", "استفسار عام"],
    submit: "فتح رسالة الدعم",
    back: "العودة للرئيسية",
    privacy: "لن نطلب منك كلمة مرور أو API Key أو بيانات بطاقة بنكية عبر البريد.",
    required: "من فضلك أكمل كل البيانات المطلوبة.",
    subjectPrefix: "طلب تواصل NOORMEXA",
  },
  en: {
    badge: "Official contact channels",
    title: "Contact the NOORMEXA team",
    subtitle:
      "We can help with general inquiries, technical support, accounts, orders, and business partnerships through our official channels.",
    supportTitle: "Customer & technical support",
    supportText: "For account, order, or platform assistance.",
    infoTitle: "General & business inquiries",
    infoText: "For partnerships, collaborations, and general NOORMEXA inquiries.",
    official: "Official addresses on the noormexa.com domain",
    formTitle: "Message the support team",
    formHint:
      "Submitting opens your email app with a prepared message to our support team. The message is not stored inside NOORMEXA.",
    name: "Name",
    email: "Your email",
    type: "Inquiry type",
    message: "Message",
    namePlaceholder: "Your name",
    emailPlaceholder: "name@example.com",
    messagePlaceholder: "Describe your request clearly...",
    types: ["Technical support", "Account & sign-in", "Order or shipment", "Seller or store", "Business partnership", "General inquiry"],
    submit: "Open support email",
    back: "Back to home",
    privacy: "We will never ask for passwords, API keys, or card details by email.",
    required: "Please complete all required fields.",
    subjectPrefix: "NOORMEXA contact request",
  },
} as const;

export default function ContactPage() {
  const { language, isAr } = useLanguage();
  const text = copy[language];
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const inquiryType = String(data.get("inquiryType") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !email || !inquiryType || !message) {
      setError(text.required);
      return;
    }

    const subject = `${text.subjectPrefix} — ${inquiryType}`;
    const body = isAr
      ? `الاسم: ${name}\nالبريد الإلكتروني: ${email}\nنوع الاستفسار: ${inquiryType}\n\nالرسالة:\n${message}\n\n---\nتم إنشاء هذه الرسالة من صفحة التواصل الرسمية في NOORMEXA.`
      : `Name: ${name}\nEmail: ${email}\nInquiry type: ${inquiryType}\n\nMessage:\n${message}\n\n---\nCreated from the official NOORMEXA contact page.`;

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10 text-white md:px-10 md:py-14">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-300">
              <BadgeCheck size={17} />
              {text.badge}
            </div>
            <h1 className="max-w-3xl text-3xl font-black leading-tight md:text-5xl">{text.title}</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">{text.subtitle}</p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="group rounded-2xl border border-slate-200 p-6 transition hover:border-orange-300 hover:shadow-md dark:border-slate-700 dark:hover:border-orange-500"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                <Headphones size={24} />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{text.supportTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text.supportText}</p>
              <div className="mt-4 flex items-center gap-2 font-bold text-orange-600 dark:text-orange-400">
                <Mail size={17} />
                <span dir="ltr">{SUPPORT_EMAIL}</span>
              </div>
            </a>

            <a
              href={`mailto:${INFO_EMAIL}`}
              className="group rounded-2xl border border-slate-200 p-6 transition hover:border-orange-300 hover:shadow-md dark:border-slate-700 dark:hover:border-orange-500"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400">
                <MessageSquareText size={24} />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{text.infoTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text.infoText}</p>
              <div className="mt-4 flex items-center gap-2 font-bold text-sky-700 dark:text-sky-400">
                <Mail size={17} />
                <span dir="ltr">{INFO_EMAIL}</span>
              </div>
            </a>
          </div>

          <div className="mx-6 mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 md:mx-10 md:mb-10 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            <ShieldCheck size={19} className="shrink-0" />
            {text.official}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{text.formTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{text.formHint}</p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              {text.name}
              <input
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder={text.namePlaceholder}
                className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              {text.email}
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={text.emailPlaceholder}
                dir="ltr"
                className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-left text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-800 md:col-span-2 dark:text-slate-200">
              {text.type}
              <select
                name="inquiryType"
                required
                defaultValue=""
                className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="" disabled>
                  {text.type}
                </option>
                {text.types.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-800 md:col-span-2 dark:text-slate-200">
              {text.message}
              <textarea
                name="message"
                required
                rows={7}
                placeholder={text.messagePlaceholder}
                className="resize-y rounded-xl border border-slate-300 bg-white p-4 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>

            {error ? (
              <p className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </p>
            ) : null}

            <div className="md:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 font-black text-white shadow-md transition hover:from-orange-600 hover:to-amber-600"
              >
                <Send size={18} />
                {text.submit}
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-600 transition hover:text-orange-600 dark:text-slate-300"
              >
                {text.back}
                <ArrowRight size={17} className={isAr ? "" : "rotate-180"} />
              </Link>
            </div>
          </form>

          <div className="mt-7 flex items-start gap-3 rounded-2xl bg-slate-100 px-4 py-4 text-xs font-semibold leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            {text.privacy}
          </div>
        </section>
      </div>
    </main>
  );
}
