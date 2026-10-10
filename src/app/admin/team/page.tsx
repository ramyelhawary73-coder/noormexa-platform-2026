"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
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

type PlatformAdmin = {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  is_super_admin: boolean;
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

  const [platformAdmins, setPlatformAdmins] = useState<PlatformAdmin[]>([]);
  const [platformEmail, setPlatformEmail] = useState("");
  const [platformLoading, setPlatformLoading] = useState(true);
  const [platformSaving, setPlatformSaving] = useState(false);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teamEmail, setTeamEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("manager");
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamSaving, setTeamSaving] = useState(false);

  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPlatformAdmins = useCallback(async () => {
    if (!isSuperAdmin) {
      setPlatformAdmins([]);
      setPlatformLoading(false);
      return;
    }

    setPlatformLoading(true);

    const { data, error: rpcError } = await supabase.rpc(
      "get_manageable_platform_admins"
    );

    if (rpcError) {
      setError(rpcError.message);
      setPlatformAdmins([]);
    } else {
      setPlatformAdmins((data ?? []) as PlatformAdmin[]);
    }

    setPlatformLoading(false);
  }, [isSuperAdmin]);

  const loadTeam = useCallback(async () => {
    setTeamLoading(true);

    const { data, error: rpcError } = await supabase.rpc(
      "get_official_store_team"
    );

    if (rpcError) {
      setError(rpcError.message);
      setMembers([]);
    } else {
      setMembers((data ?? []) as TeamMember[]);
    }

    setTeamLoading(false);
  }, []);

  useEffect(() => {
    // Do not synchronously cascade admin/team loading state from setup.
    // The existing RPCs remain the server-side permission boundary.
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setError(null);
      void loadPlatformAdmins();
      void loadTeam();
    });
    return () => { cancelled = true; };
  }, [loadPlatformAdmins, loadTeam]);

  const handleGrantPlatformAdmin = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSuperAdmin || !platformEmail.trim()) return;

    setPlatformSaving(true);
    setError(null);
    setNotice(null);

    const { data, error: rpcError } = await supabase.rpc(
      "grant_platform_admin_by_email",
      { p_email: platformEmail.trim() }
    );

    if (rpcError) {
      setError(rpcError.message);
    } else if (data !== true) {
      setError(
        "الحساب غير موجود في Profiles بعد. لازم صاحب البريد يسجل دخول إلى NOORMEXA مرة واحدة أولاً، وبعدها أعد منحه Platform Admin من هنا."
      );
    } else {
      setNotice(
        "تم منح صلاحية Platform Admin. الحساب أصبح مؤهلاً للدخول إلى /admin بعد تحديث الصفحة أو تسجيل الدخول من جديد."
      );
      setPlatformEmail("");
      await loadPlatformAdmins();
    }

    setPlatformSaving(false);
  };

  const handleRevokePlatformAdmin = async (admin: PlatformAdmin) => {
    if (!isSuperAdmin) return;
    if (
      !window.confirm(
        `إلغاء صلاحية Platform Admin عن ${admin.email}؟ لن يتم حذف الحساب نفسه.`
      )
    ) {
      return;
    }

    setPlatformSaving(true);
    setError(null);
    setNotice(null);

    const { data, error: rpcError } = await supabase.rpc(
      "revoke_platform_admin",
      { p_user_id: admin.id }
    );

    if (rpcError) {
      setError(rpcError.message);
    } else if (data !== true) {
      setError("لم يتم العثور على صلاحية Platform Admin قابلة للإلغاء.");
    } else {
      setNotice(
        "تم إلغاء صلاحية Platform Admin. عضوية المتجر الرسمية — إن وجدت — لم تتغير."
      );
      await loadPlatformAdmins();
    }

    setPlatformSaving(false);
  };

  const sendOfficialTeamInvite = async (
    email: string,
    memberRole: TeamRole
  ) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("انتهت جلسة الدخول. سجل دخولك مرة أخرى.");
    }

    const response = await fetch("/api/admin/team/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        email: email.trim(),
        role: memberRole,
      }),
    });

    const result = (await response.json()) as {
      ok?: boolean;
      membershipStatus?: "pending" | "active";
      emailSent?: boolean;
      emailType?: "invite" | "recovery";
      existingAccount?: boolean;
      membershipSaved?: boolean;
      error?: string;
    };

    if (!response.ok || !result.ok) {
      if (result.membershipSaved) {
        throw new Error(
          "تم حفظ العضوية Pending، لكن تعذر إرسال البريد الآن. استخدم زر إعادة إرسال الدعوة."
        );
      }
      throw new Error(
        result.error === "protected_super_admin"
          ? "لا يمكن تغيير عضوية حساب Platform Super Admin من هذا المسار."
          : "تعذر إنشاء دعوة الفريق. حاول مرة أخرى."
      );
    }

    return result;
  };

  const handleAddTeamMember = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSuperAdmin || !teamEmail.trim()) return;

    setTeamSaving(true);
    setError(null);
    setNotice(null);

    try {
      const result = await sendOfficialTeamInvite(teamEmail, role);

      if (result.membershipStatus === "active") {
        setNotice(
          "الحساب موجود بالفعل وتم تفعيل عضويته في المتجر الرسمي. يمكنه تسجيل الدخول فورًا."
        );
      } else if (result.emailSent) {
        setNotice(
          "تم حفظ العضوية وإرسال رسالة دعوة إلى البريد. يفتح المستخدم الرابط، ينشئ كلمة مرور، ثم يدخل مساحة العمل حسب دوره."
        );
      } else {
        setNotice("تم حفظ عضوية المتجر الرسمي.");
      }

      setTeamEmail("");
      await loadTeam();
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "تعذر إنشاء الدعوة."
      );
      await loadTeam();
    }

    setTeamSaving(false);
  };

  const handleResendTeamInvite = async (member: TeamMember) => {
    if (!isSuperAdmin || member.status !== "pending") return;

    setTeamSaving(true);
    setError(null);
    setNotice(null);

    try {
      const result = await sendOfficialTeamInvite(member.email, member.role);
      setNotice(
        result.emailSent
          ? "تمت إعادة إرسال رسالة الدعوة إلى البريد."
          : "الحساب أصبح موجودًا وتم تفعيل العضوية."
      );
      await loadTeam();
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "تعذر إعادة إرسال الدعوة."
      );
    }

    setTeamSaving(false);
  };

  const handleRemoveTeamMember = async (memberEmail: string) => {
    if (!isSuperAdmin) return;
    if (
      !window.confirm(
        `إزالة ${memberEmail} من فريق المتجر الرسمي؟ صلاحية Platform Admin — إن وجدت — لن تتغير.`
      )
    ) {
      return;
    }

    setTeamSaving(true);
    setError(null);
    setNotice(null);

    const { error: rpcError } = await supabase.rpc(
      "remove_official_store_member_by_email",
      { p_email: memberEmail }
    );

    if (rpcError) {
      setError(rpcError.message);
    } else {
      setNotice(
        "تمت إزالة العضو من فريق المتجر الرسمي. صلاحية Platform Admin لم تتغير."
      );
      await loadTeam();
    }

    setTeamSaving(false);
  };

  return (
    <main className="noormexa-main py-6 sm:py-10 pb-28">
      <div className="noormexa-container max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-black text-orange-700 dark:text-orange-300">
              <ShieldCheck size={14} />
              NOORMEXA Access Control
            </div>
            <h1 className="mt-3 text-2xl font-black text-foreground sm:text-3xl">
              إدارة صلاحيات المنصة والمتجر الرسمي
            </h1>
            <p className="mt-2 text-sm text-muted">
              صلاحية Platform Admin منفصلة عن عضوية فريق المتجر الرسمي. الدخول
              إلى مركز الإدارة يعتمد على Platform Admin، وليس على دور Manager
              داخل المتجر.
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

        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-foreground">
          <div className="flex gap-3">
            <KeyRound className="mt-0.5 shrink-0 text-sky-600" size={18} />
            <div>
              <div className="font-black">لو عايز الشخص يدخل لوحة /admin</div>
              <div className="mt-1 text-xs leading-6 text-muted">
                استخدم قسم <strong>Platform Admins</strong>. الحساب يجب أن يكون
                قد سجل دخول إلى NOORMEXA مرة واحدة على الأقل حتى يكون له Profile.
                إضافة الشخص كـManager في المتجر الرسمي وحدها لا تمنحه صلاحية
                إدارة المنصة.
              </div>
            </div>
          </div>
        </div>

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

        <section className="rounded-3xl border border-orange-500/30 bg-surface p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <UserCog className="mt-0.5 text-orange-500" size={20} />
              <div>
                <h2 className="font-black text-foreground">
                  Platform Admins — مديري المنصة
                </h2>
                <p className="mt-1 text-xs text-muted">
                  هذه هي الصلاحية التي تسمح بالدخول إلى /admin. الـPlatform
                  Super Admin محمي وغير ظاهر في قائمة الإزالة.
                </p>
              </div>
            </div>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => void loadPlatformAdmins()}
                disabled={platformLoading}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-line px-3 py-2 text-xs font-bold text-foreground hover:border-orange-500/50 disabled:opacity-60"
              >
                <RefreshCw
                  size={14}
                  className={platformLoading ? "animate-spin" : ""}
                />
                تحديث
              </button>
            )}
          </div>

          {isSuperAdmin ? (
            <>
              <form
                onSubmit={handleGrantPlatformAdmin}
                className="grid gap-3 border-b border-line pb-5 md:grid-cols-[1fr_auto]"
              >
                <input
                  type="email"
                  required
                  value={platformEmail}
                  onChange={(event) => setPlatformEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="h-11 rounded-2xl border border-line bg-surface-soft px-4 text-sm text-foreground outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  disabled={platformSaving}
                  className="h-11 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {platformSaving
                    ? "جاري المنح..."
                    : "منح صلاحية Platform Admin"}
                </button>
              </form>

              <div className="mt-5">
                {platformLoading ? (
                  <div className="py-8 text-center text-sm text-muted">
                    جاري تحميل مديري المنصة...
                  </div>
                ) : platformAdmins.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted">
                    لا يوجد Platform Admin قابل للإدارة حاليًا.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {platformAdmins.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-soft p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-black text-foreground">
                            {admin.full_name || admin.email}
                          </div>
                          <div className="mt-1 truncate text-xs text-muted">
                            {admin.email}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-black text-orange-700 dark:text-orange-300">
                            Platform Admin
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              void handleRevokePlatformAdmin(admin)
                            }
                            disabled={platformSaving}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-3 py-1.5 text-xs font-black text-red-600 hover:bg-red-500/10 disabled:opacity-60"
                          >
                            <Trash2 size={13} />
                            إلغاء صلاحية المنصة
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
              أنت Platform Admin ويمكنك دخول مركز الإدارة، لكن منح أو إلغاء
              Platform Admin آخر محجوز للـPlatform Super Admin.
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <Users className="mt-0.5 text-amber-500" size={20} />
            <div>
              <h2 className="font-black text-foreground">
                Official Store Team — فريق المتجر الرسمي
              </h2>
              <p className="mt-1 text-xs text-muted">
                Manager / Editor / Support هنا أدوار تشغيل المتجر فقط. الدعوة
                ترسل Email حقيقي لإنشاء الحساب وكلمة المرور، ولا تمنح الدخول
                إلى /admin.
              </p>
            </div>
          </div>

          {isSuperAdmin && (
            <form
              onSubmit={handleAddTeamMember}
              className="grid gap-3 border-b border-line pb-5 md:grid-cols-[1fr_220px_auto]"
            >
              <input
                type="email"
                required
                value={teamEmail}
                onChange={(event) => setTeamEmail(event.target.value)}
                placeholder="team@example.com"
                className="h-11 rounded-2xl border border-line bg-surface-soft px-4 text-sm text-foreground outline-none focus:border-amber-500"
              />

              <select
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as TeamRole)
                }
                className="h-11 rounded-2xl border border-line bg-surface-soft px-4 text-sm font-bold text-foreground outline-none focus:border-amber-500"
              >
                <option value="manager">مدير متجر</option>
                <option value="editor">محرر منتجات ومحتوى</option>
                <option value="support">دعم وخدمة عملاء</option>
              </select>

              <button
                type="submit"
                disabled={teamSaving}
                className="h-11 rounded-2xl bg-amber-500 px-5 text-sm font-black text-navy transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {teamSaving ? "جاري الحفظ..." : "حفظ عضوية المتجر"}
              </button>
            </form>
          )}

          <div className="mt-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-foreground">الفريق الحالي</h3>
                <span className="rounded-full bg-surface-soft px-2 py-0.5 text-xs font-black text-muted">
                  {members.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => void loadTeam()}
                disabled={teamLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-bold text-foreground hover:border-amber-500/50 disabled:opacity-60"
              >
                <RefreshCw
                  size={14}
                  className={teamLoading ? "animate-spin" : ""}
                />
                تحديث
              </button>
            </div>

            {teamLoading ? (
              <div className="py-10 text-center text-sm text-muted">
                جاري تحميل فريق المتجر...
              </div>
            ) : members.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted">
                لا يوجد أعضاء مسجلون للمتجر الرسمي.
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => {
                  const protectedMember =
                    member.role === "owner" && Boolean(member.user_id);

                  return (
                    <div
                      key={`${member.store_id}-${member.email}`}
                      className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-soft p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-black text-foreground">
                          {member.full_name || member.email}
                        </div>
                        <div className="mt-1 truncate text-xs text-muted">
                          {member.email}
                        </div>
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

                        {isSuperAdmin &&
                          member.status === "pending" &&
                          !protectedMember && (
                            <button
                              type="button"
                              onClick={() => void handleResendTeamInvite(member)}
                              disabled={teamSaving}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 px-3 py-1.5 text-xs font-black text-amber-700 hover:bg-amber-500/10 disabled:opacity-60 dark:text-amber-300"
                            >
                              <Mail size={13} />
                              إعادة إرسال الدعوة
                            </button>
                          )}

                        {isSuperAdmin && !protectedMember && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleRemoveTeamMember(member.email)
                            }
                            disabled={teamSaving}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-3 py-1.5 text-xs font-black text-red-600 hover:bg-red-500/10 disabled:opacity-60"
                          >
                            <Trash2 size={13} />
                            إزالة من المتجر
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div className="rounded-2xl border border-line bg-surface-soft p-4 text-xs leading-6 text-muted">
          <UserPlus className="mb-2 text-muted" size={17} />
          لو الشخص مطلوب كمدير كامل للمنصة والمتجر معًا: امنحه Platform Admin
          من القسم الأول، ثم أضفه كـManager للمتجر الرسمي من القسم الثاني. فصل
          الصلاحيتين مقصود حتى لا تتحول عضوية متجر عادية إلى صلاحية إدارة منصة.
        </div>
      </div>
    </main>
  );
}
