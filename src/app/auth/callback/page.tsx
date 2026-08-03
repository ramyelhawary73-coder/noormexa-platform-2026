"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useNoormexaLanguage } from "@/lib/useLanguage";

const copy = {
  ar: {
    title: "بنجهزلك حسابك...",
    text: "استنى ثانية وهنوجهك للمكان الصح.",
    error: "حصلت مشكلة فى تأكيد الحساب. جرب تسجل دخول يدويًا.",
    goToAuth: "روح لصفحة الدخول",
  },
  en: {
    title: "Setting up your account...",
    text: "One moment, we're taking you to the right place.",
    error: "There was a problem confirming your account. Try signing in manually.",
    goToAuth: "Go to sign in",
  },
} as const;

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = useNoormexaLanguage();
  const text = copy[language];
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    const finishSignIn = async () => {
      const code = searchParams.get("code");

      // بعض روابط التأكيد بتيجي بصيغة PKCE (فيها ?code=...) وبعضها implicit
      // (الجلسة بتتحدد لوحدها من الرابط). نتعامل مع الاتنين.
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (active) setFailed(true);
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (active) setFailed(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!active) return;

      const accountType = (profile?.account_type as string | undefined) ?? "customer";
      const destination = ["seller", "store", "advertiser"].includes(accountType) ? "/dashboard" : "/";
      router.replace(destination);
    };

    finishSignIn();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="noormexa-main">
      <section className="noormexa-section">
        <div className="noormexa-container noormexa-callback-state">
          {!failed ? (
            <>
              <Loader2 size={30} className="noormexa-spin" />
              <h1>{text.title}</h1>
              <p>{text.text}</p>
            </>
          ) : (
            <>
              <p>{text.error}</p>
              <a href="/auth" className="noormexa-primary-button">
                {text.goToAuth}
              </a>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackInner />
    </Suspense>
  );
}
