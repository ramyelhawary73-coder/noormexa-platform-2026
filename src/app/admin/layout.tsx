"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isPlatformAdminProfile } from "@/lib/authHelpers";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const isAdmin = isPlatformAdminProfile(profile);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth?next=/admin");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, loading, router, user]);

  if (loading || !user || !isAdmin) {
    return (
      <main className="noormexa-main min-h-[65vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl border border-line bg-surface p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 text-orange-500" size={34} />
          <h1 className="text-lg font-black text-foreground">جاري التحقق من صلاحيات الإدارة</h1>
          <p className="mt-2 text-sm text-muted">
            يتم التحقق من صلاحيات الحساب الموثوقة من Supabase قبل فتح مركز الإدارة.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
