"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isPlatformSuperAdminProfile } from "@/lib/authHelpers";
import { supabase } from "@/lib/supabaseClient";

type TeamRole = "owner" | "manager" | "editor" | "support";

type TeamMember = {
  store_id: string;
  email: string;
  full_name: string | null;
  role: TeamRole;
  status: "pending" | "active" | "disabled";
  user_id: string | null;
  created_at: string;
};

const roleLabels: Record<TeamRole, string> = {
  owner: "مالك المتجر",
  manager: "مدير",
  editor: "محرر المنتجات والمحتوى",
  support: "دعم وخدمة عملاء",
};

export default function OfficialStoreTeamPage() {
  const { profile } = useAuth();
  const isSuperAdmin = isPlatformSuperAdminProfile(profile);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("manager");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc("get_official_store_team");

    if (rpcError) {
      setError(rpcError.message);
      setMembers([]);
    } else {
      setMembers((data ?? []) as TeamMember[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSuperAdmin || !email.trim()) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    const { error: rpcError } = await supabase.rpc("add_official_store_member_by_email", {
      p_email: email.trim(),
      p_role: role,
    });

    if (rpcError) {
      setError(rpcError.message);
    } else {
      setNotice(
        "تم حفظ العضو. إذا كان البريد مسجلاً في NOORMEXA ستصبح الصلاحية Active فوراً، وإلا ستظل Pending حتى يسجل الحساب."
      );
      setEmail("");
      await loadTeam();
    }

    setSaving(false);
  };

  const handleRemove = async (memberEmail: string) => {
    if (!isSuperAdmin) return;
    if (!window.confirm(`إزالة صلاحية إدارة المتجر عن ${memberEmail}؟`)) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    const { error: rpcError } = await supabase.rpc("remove_official_store_member_by_email", {
      p_email: memberEmail,
    });

    if (rpcError) {
      setError(rpcError.message);
    } else {
      setNotice("تمت إزالة العضو من فريق المتجر الرسمي.");
      await loadTeam();
    }

    setSaving(false);
  };

  return (
    <main className="noormexa-main py-6 sm:py-10 pb-28">
      <div className="noormexa-container max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-black text-orange-700 dark:text-orange-300">
              <ShieldCheck size={14} />
              Official Store Permissions
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black text-foreground">
              إدارة فريق متجر NOORMEXA الرسمي
            </h1>
            <p className="mt-2 text-sm text-muted">
              أعضاء المتجر هنا منفصلون عن صلاحية مالك المنصة. الـPlatform Super Admin فقط يقدر يضيف أو يزيل أعضاء الفريق.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-foreground hover:border-orange-500/50"
          >
            <ArrowRight size={16} />
            العودة لمركز الإدارة
          </Link>
        </div>

        {isSuperAdmin && (
          <form onSubmit={handleAdd} className="rounded-3xl border border-line bg-surface p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={18} className="text-orange-500" />
              <h2 className="font-black text-foreground">إضافة أو تحديث عضو بالإيميل</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="manager@example.com"
                className="h-11 rounded-2xl border border-line bg-surface-soft px-4 text-sm text-foreground outline-none focus:border-orange-500"
              />

              <select
                value={role}
                onChange={(event) => setRole(event.target.value as TeamRole)}
                className="h-11 rounded-2xl border border-line bg-surface-soft px-4 text-sm font-bold text-foreground outline-none focus:border-orange-500"
              >
                <option value="manager">مدير</option>
                <option value="editor">محرر</option>
                <option value="support">دعم</option>
              </select>

              <button
                type="submit"
                disabled={saving}
                className="h-11 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "جاري الحفظ..." : "حفظ الصلاحية"}
              </button>
            </div>
          </form>
        )}

        {!isSuperAdmin && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
            أنت Platform Admin ويمكنك مشاهدة فريق المتجر، لكن إضافة أو إزالة المديرين محجوزة للـPlatform Super Admin.
          </div>
        )}

        {notice && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {notice}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-orange-500" />
              <h2 className="font-black text-foreground">الفريق الحالي</h2>
              <span className="rounded-full bg-surface-soft px-2 py-0.5 text-xs font-black text-muted">
                {members.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => void loadTeam()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-bold text-foreground hover:border-orange-500/50 disabled:opacity-60"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              تحديث
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-muted">جاري تحميل الفريق...</div>
          ) : members.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted">لا يوجد أعضاء مسجلون للمتجر الرسمي.</div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const protectedMember = member.role === "owner" && Boolean(member.user_id);
                return (
                  <div
                    key={`${member.store_id}-${member.email}`}
                    className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-soft p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-black text-foreground truncate">
                        {member.full_name || member.email}
                      </div>
                      <div className="mt-1 text-xs text-muted truncate">{member.email}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-bold text-foreground">
                        {roleLabels[member.role]}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-black ${
                          member.status === "active"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {member.status === "active" ? "Active" : "Pending"}
                      </span>

                      {isSuperAdmin && !protectedMember && (
                        <button
                          type="button"
                          onClick={() => void handleRemove(member.email)}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-3 py-1.5 text-xs font-black text-red-600 hover:bg-red-500/10 disabled:opacity-60"
                        >
                          <Trash2 size={13} />
                          إزالة
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
