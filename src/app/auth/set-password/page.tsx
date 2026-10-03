"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/seller/dashboard";
  }
  return value;
}

function SetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refreshProfile } = useAuth();
  const nextPath = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams]
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, router, user]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (password.length < 8) {
      setMessage("كلمة المرور لازم تكون 8 أحرف على الأقل.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("كلمتا المرور غير متطابقتين.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message || "تعذر حفظ كلمة المرور.");
      setSaving(false);
      return;
    }

    // Ensure the public profile exists. Creating the profile fires the
    // official-store pending-membership linker for the invited canonical email.
    await refreshProfile();

    setMessage("تم إنشاء كلمة المرور وتفعيل الحساب.");
    router.replace(nextPath);
  };

  if (loading || !user) {
    return (
      <main className="noormexa-main min-h-[65vh] flex items-center justify-center px-4">
        <Loader2 className="animate-spin text-orange-500" size={30} />
      </main>
    );
  }

  return (
    <main className="noormexa-main min-h-[70vh] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-500">
            <KeyRound size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-emerald-600">
              <ShieldCheck size={15} />
              دعوة فريق NOORMEXA
            </div>
            <h1 className="mt-2 text-2xl font-black text-foreground">
              أنشئ كلمة مرور لحسابك
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              بعد حفظ كلمة المرور سيتم تفعيل عضويتك المدعوة وتوجيهك إلى مساحة
              العمل المسموح بها حسب دورك.
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-line bg-surface-soft p-4 text-sm text-muted">
          الحساب: <strong className="text-foreground">{user.email}</strong>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-bold text-foreground">
              كلمة المرور الجديدة
            </span>
            <span className="relative block">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
                className="h-12 w-full rounded-2xl border border-line bg-surface-soft px-4 pe-12 text-foreground outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                aria-label="إظهار أو إخفاء كلمة المرور"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </span>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-bold text-foreground">
              تأكيد كلمة المرور
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
              className="h-12 w-full rounded-2xl border border-line bg-surface-soft px-4 text-foreground outline-none focus:border-orange-500"
            />
          </label>

          {message && (
            <div className="rounded-2xl border border-orange-500/25 bg-orange-500/10 p-3 text-sm font-bold text-foreground">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="h-12 w-full rounded-2xl bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "جاري تفعيل الحساب..." : "حفظ كلمة المرور وفتح مساحة العمل"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <SetPasswordInner />
    </Suspense>
  );
}
