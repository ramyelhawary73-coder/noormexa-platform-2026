"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Megaphone, Search, ShoppingBag, Sparkles, Store } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

type Language = "ar" | "en";
type Mode = "register" | "login";
type Role = "customer" | "seller" | "store" | "advertiser";
type Status = "idle" | "loading" | "success" | "error";

const LANGUAGE_KEY = "noormexa-language";

const roles = [
  { id: "customer", icon: Search },
  { id: "seller", icon: ShoppingBag },
  { id: "store", icon: Store },
  { id: "advertiser", icon: Megaphone },
] as const;

const copy = {
  ar: {
    badge: "حساب NOORMEXA",
    title: "اختر حسابك وابدأ بسهولة",
    text: "أنشئ حسابك كمتسوق أو بائع أو متجر أو معلن داخل السوق.",
    back: "العودة للرئيسية",
    register: "إنشاء حساب",
    login: "تسجيل الدخول",
    roleTitle: "نوع الحساب",
    role: {
      customer: "متسوق",
      seller: "بائع",
      store: "متجر / علامة",
      advertiser: "معلن",
    },
    fullName: "الاسم الكامل",
    businessName: "اسم المتجر أو العلامة",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    password: "كلمة المرور",
    submitRegister: "إنشاء الحساب",
    submitLogin: "دخول الحساب",
    switchLogin: "لديك حساب؟ سجل الدخول",
    switchRegister: "ليس لديك حساب؟ أنشئ حسابًا",
    successRegister: "تم إرسال طلب إنشاء الحساب بنجاح.",
    successLogin: "تم تسجيل الدخول بنجاح.",
    unavailable: "التسجيل غير متاح الآن. يمكنك تجربة الواجهة وسيتم تفعيل الحسابات عند جاهزية الربط.",
  },
  en: {
    badge: "NOORMEXA Account",
    title: "Choose your account and start easily",
    text: "Create an account as a shopper, seller, store, or advertiser.",
    back: "Back home",
    register: "Create account",
    login: "Sign in",
    roleTitle: "Account type",
    role: {
      customer: "Shopper",
      seller: "Seller",
      store: "Store / Brand",
      advertiser: "Advertiser",
    },
    fullName: "Full name",
    businessName: "Store or brand name",
    email: "Email address",
    phone: "Phone number",
    password: "Password",
    submitRegister: "Create account",
    submitLogin: "Sign in",
    switchLogin: "Already have an account? Sign in",
    switchRegister: "No account? Create one",
    successRegister: "Account request submitted successfully.",
    successLogin: "Signed in successfully.",
    unavailable: "Registration is not available right now. You can preview the interface; accounts will work when connection is ready.",
  },
} as const;

function getLanguageSnapshot(): Language {
  if (typeof window === "undefined") return "ar";
  return window.localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "ar";
}

function subscribeToLanguage(callback: () => void) {
  window.addEventListener("noormexa-language-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("noormexa-language-change", callback);
    window.removeEventListener("storage", callback);
  };
}

function useNoormexaLanguage() {
  return useSyncExternalStore<Language>(subscribeToLanguage, getLanguageSnapshot, () => "ar");
}

export default function AuthPage() {
  const router = useRouter();
  const language = useNoormexaLanguage();
  const [mode, setMode] = useState<Mode>("register");
  const [role, setRole] = useState<Role>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const text = copy[language];
  const needsBusinessName = mode === "register" && role !== "customer";
  const isArabic = language === "ar";
  const DirectionIcon = isArabic ? ArrowLeft : ArrowRight;

  const resetFeedback = () => {
    setStatus("idle");
    setMessage("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!isSupabaseConfigured) {
      setStatus("error");
      setMessage(text.unavailable);
      return;
    }

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setStatus("success");
        setMessage(text.successLogin);
        router.push("/");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            account_type: role,
            business_name: businessName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          email,
          phone: phone || null,
          account_type: role,
          business_name: businessName || null,
          updated_at: new Date().toISOString(),
        });
      }

      setStatus("success");
      setMessage(text.successRegister);

      // لو تأكيد الإيميل متوقف، المستخدم بيبقى مسجل دخول فورًا
      // فنوجهه على طول بدل ما نسيبه واقف في نفس الصفحة.
      if (data.session) {
        router.push("/");
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Error");
    }
  };

  return (
    <main className="noormexa-auth-page">
      <div className="noormexa-container noormexa-auth-grid">
        <section className="noormexa-auth-intro">
          <span className="noormexa-eyebrow">
            <Sparkles size={17} />
            {text.badge}
          </span>
          <h1>{text.title}</h1>
          <p>{text.text}</p>
          <Link href="/" className="noormexa-secondary-button">
            <DirectionIcon size={17} />
            {text.back}
          </Link>
        </section>

        <section className="noormexa-auth-card">
          <div className="noormexa-tabs" role="tablist" aria-label={text.badge}>
            <button
              type="button"
              className={mode === "register" ? "noormexa-tab active" : "noormexa-tab"}
              onClick={() => {
                setMode("register");
                resetFeedback();
              }}
            >
              {text.register}
            </button>
            <button
              type="button"
              className={mode === "login" ? "noormexa-tab active" : "noormexa-tab"}
              onClick={() => {
                setMode("login");
                resetFeedback();
              }}
            >
              {text.login}
            </button>
          </div>

          {mode === "register" && (
            <div className="noormexa-role-picker">
              <h2>{text.roleTitle}</h2>
              <div className="noormexa-role-choice-grid">
                {roles.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={role === item.id ? "noormexa-role-choice active" : "noormexa-role-choice"}
                      onClick={() => setRole(item.id)}
                    >
                      <Icon size={19} />
                      <span>{text.role[item.id]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <form className="noormexa-form" onSubmit={submit}>
            {mode === "register" && (
              <label className="noormexa-field" htmlFor="fullName">
                <span>{text.fullName}</span>
                <input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
              </label>
            )}

            {needsBusinessName && (
              <label className="noormexa-field" htmlFor="businessName">
                <span>{text.businessName}</span>
                <input id="businessName" value={businessName} onChange={(event) => setBusinessName(event.target.value)} required />
              </label>
            )}

            <label className="noormexa-field" htmlFor="email">
              <span>{text.email}</span>
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>

            {mode === "register" && (
              <label className="noormexa-field" htmlFor="phone">
                <span>{text.phone}</span>
                <input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>
            )}

            <label className="noormexa-field" htmlFor="password">
              <span>{text.password}</span>
              <span className="noormexa-password-shell">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password">
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </span>
            </label>

            {message && <div className={`noormexa-form-message ${status}`}>{message}</div>}

            <button type="submit" className="noormexa-primary-button noormexa-submit-button" disabled={status === "loading"}>
              {mode === "register" ? text.submitRegister : text.submitLogin}
            </button>

            <button
              type="button"
              className="noormexa-switch-auth"
              onClick={() => {
                setMode(mode === "register" ? "login" : "register");
                resetFeedback();
              }}
            >
              {mode === "register" ? text.switchLogin : text.switchRegister}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
