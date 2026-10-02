"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useNoormexaLanguage } from "@/lib/useLanguage";

type TeamRole = "owner" | "manager" | "editor" | "support";
type ManageableRole = "manager" | "editor" | "support";

type StoreMembership = {
  store_id: string;
  store_name: string;
  store_slug: string;
  role: TeamRole;
  status: "pending" | "active" | "disabled";
  is_official: boolean;
  is_verified: boolean;
};

type TeamMember = {
  membership_id: string;
  email: string;
  full_name: string | null;
  role: TeamRole;
  status: "active";
  created_at: string;
};

const roleLabels = {
  ar: {
    owner: "مالك",
    manager: "مدير",
    editor: "محرر",
    support: "دعم",
  },
  en: {
    owner: "Owner",
    manager: "Manager",
    editor: "Editor",
    support: "Support",
  },
} as const;

export default function SellerTeamPage() {
  const language = useNoormexaLanguage();
  const isAr = language === "ar";
  const { user, loading: authLoading } = useAuth();

  const [memberships, setMemberships] = useState<StoreMembership[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ManageableRole>("editor");
  const [loading, setLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedMembership = useMemo(
    () => memberships.find((membership) => membership.store_id === selectedStoreId) ?? null,
    [memberships, selectedStoreId]
  );

  const allowedRoles = useMemo<ManageableRole[]>(() => {
    if (selectedMembership?.role === "owner") {
      return ["manager", "editor", "support"];
    }
    if (selectedMembership?.role === "manager") {
      return ["editor", "support"];
    }
    return [];
  }, [selectedMembership]);

  const loadMemberships = useCallback(async () => {
    if (!user) {
      setMemberships([]);
      setSelectedStoreId("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Best-effort self-claim. The RPC can only link invitations matching the
    // authenticated auth.users email and refuses Platform accounts.
    await supabase.rpc("claim_my_store_invitations");

    const { data, error: membershipsError } = await supabase.rpc("get_my_store_memberships");

    if (membershipsError) {
      setMemberships([]);
      setSelectedStoreId("");
      setError(membershipsError.message);
      setLoading(false);
      return;
    }

    const manageable = ((data ?? []) as StoreMembership[]).filter(
      (membership) =>
        membership.status === "active" &&
        !membership.is_official &&
        (membership.role === "owner" || membership.role === "manager")
    );

    setMemberships(manageable);
    setSelectedStoreId((current) => {
      if (current && manageable.some((membership) => membership.store_id === current)) {
        return current;
      }
      return manageable[0]?.store_id ?? "";
    });
    setLoading(false);
  }, [user]);

  const loadTeam = useCallback(async () => {
    if (!selectedStoreId) {
      setMembers([]);
      return;
    }

    setTeamLoading(true);
    setError(null);

    const { data, error: teamError } = await supabase.rpc("get_store_team", {
      p_store_id: selectedStoreId,
    });

    if (teamError) {
      setMembers([]);
      setError(teamError.message);
    } else {
      setMembers((data ?? []) as TeamMember[]);
    }

    setTeamLoading(false);
  }, [selectedStoreId]);

  useEffect(() => {
    if (!authLoading) {
      void loadMemberships();
    }
  }, [authLoading, loadMemberships]);

  useEffect(() => {
    if (selectedStoreId) {
      void loadTeam();
    } else {
      setMembers([]);
    }
  }, [selectedStoreId, loadTeam]);

  useEffect(() => {
    if (allowedRoles.length > 0 && !allowedRoles.includes(inviteRole)) {
      setInviteRole(allowedRoles[0]);
    }
  }, [allowedRoles, inviteRole]);

  const canManageMember = (member: TeamMember) => {
    if (!selectedMembership) return false;
    if (member.role === "owner") return false;

    if (selectedMembership.role === "owner") {
      return member.role === "manager" || member.role === "editor" || member.role === "support";
    }

    if (selectedMembership.role === "manager") {
      return member.role === "editor" || member.role === "support";
    }

    return false;
  };

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedStoreId || !email.trim() || allowedRoles.length === 0) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    const { error: inviteError } = await supabase.rpc("invite_store_member_by_email", {
      p_store_id: selectedStoreId,
      p_email: email.trim(),
      p_role: inviteRole,
    });

    if (inviteError) {
      setError(inviteError.message);
    } else {
      setEmail("");
      setNotice(
        isAr
          ? "تم حفظ الدعوة. ستظهر العضوية في الفريق بعد أن يسجل صاحب البريد ويدخل إلى حسابه."
          : "Invitation saved. The member will appear after the invited account signs in and claims it."
      );
      await loadTeam();
    }

    setSaving(false);
  };

  const handleRoleChange = async (member: TeamMember, nextRole: ManageableRole) => {
    if (!selectedStoreId || !canManageMember(member)) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    const { error: roleError } = await supabase.rpc("update_store_member_role", {
      p_store_id: selectedStoreId,
      p_membership_id: member.membership_id,
      p_role: nextRole,
    });

    if (roleError) {
      setError(roleError.message);
    } else {
      setNotice(isAr ? "تم تحديث صلاحية العضو." : "Member role updated.");
      await loadTeam();
    }

    setSaving(false);
  };

  const handleRemove = async (member: TeamMember) => {
    if (!selectedStoreId || !canManageMember(member)) return;

    const confirmed = window.confirm(
      isAr
        ? `إزالة ${member.email} من فريق المتجر؟`
        : `Remove ${member.email} from this store team?`
    );
    if (!confirmed) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    const { error: removeError } = await supabase.rpc("remove_store_member", {
      p_store_id: selectedStoreId,
      p_membership_id: member.membership_id,
    });

    if (removeError) {
      setError(removeError.message);
    } else {
      setNotice(isAr ? "تمت إزالة العضو من فريق المتجر." : "Member removed from the store team.");
      await loadTeam();
    }

    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <main className="noormexa-main py-10 pb-28">
        <div className="noormexa-container max-w-5xl text-center text-sm text-muted">
          {isAr ? "جاري تحميل صلاحيات الفريق..." : "Loading team permissions..."}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="noormexa-main py-10 pb-28">
        <div className="noormexa-container max-w-3xl rounded-3xl border border-line bg-surface p-6 text-center">
          <ShieldCheck className="mx-auto mb-3 text-amber-500" size={28} />
          <h1 className="text-xl font-black text-foreground">
            {isAr ? "تسجيل الدخول مطلوب" : "Sign in required"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isAr ? "سجل الدخول لإدارة فريق متجرك." : "Sign in to manage your store team."}
          </p>
          <Link
            href="/auth?next=/seller/team"
            className="mt-5 inline-flex rounded-2xl bg-gold px-5 py-2.5 text-sm font-black text-navy"
          >
            {isAr ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="noormexa-main py-6 sm:py-10 pb-28">
      <div className="noormexa-container max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-700 dark:text-gold">
              <Users size={14} />
              {isAr ? "صلاحيات فريق المتجر" : "Store Team Permissions"}
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black text-foreground">
              {isAr ? "إدارة فريق المتجر" : "Manage Store Team"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {isAr
                ? "الصلاحيات هنا مرتبطة بالمتجر المحدد وتُفرض من قاعدة البيانات، وليست مجرد إخفاء أزرار."
                : "Permissions are scoped to the selected store and enforced by the database, not only by the UI."}
            </p>
          </div>

          <Link
            href="/seller/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-foreground hover:border-gold/50"
          >
            <ArrowRight size={16} />
            {isAr ? "العودة للوحة المتجر" : "Back to seller dashboard"}
          </Link>
        </div>

        {memberships.length === 0 ? (
          <section className="rounded-3xl border border-line bg-surface p-6 text-center shadow-sm">
            <UserCog className="mx-auto mb-3 text-muted" size={30} />
            <h2 className="font-black text-foreground">
              {isAr ? "لا توجد عضوية قابلة لإدارة الفريق" : "No manageable team membership"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {isAr
                ? "إدارة الفريق متاحة لمالك المتجر أو المدير في متجر عميل عادي فقط. المتجر الرسمي يُدار من مركز إدارة المنصة."
                : "Team management is available only to an owner or manager of a customer store. The official store is managed from the platform admin center."}
            </p>
          </section>
        ) : (
          <>
            <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
              <label className="block text-sm font-black text-foreground">
                {isAr ? "المتجر الحالي" : "Current store"}
              </label>
              <select
                value={selectedStoreId}
                onChange={(event) => setSelectedStoreId(event.target.value)}
                className="mt-2 h-11 w-full rounded-2xl border border-line bg-surface-soft px-4 text-sm font-bold text-foreground outline-none focus:border-gold"
              >
                {memberships.map((membership) => (
                  <option key={membership.store_id} value={membership.store_id}>
                    {membership.store_name} — {roleLabels[language][membership.role]}
                  </option>
                ))}
              </select>
            </section>

            <form onSubmit={handleInvite} className="rounded-3xl border border-line bg-surface p-5 sm:p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <UserPlus size={18} className="text-amber-500" />
                <div>
                  <h2 className="font-black text-foreground">
                    {isAr ? "دعوة عضو جديد" : "Invite a team member"}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {selectedMembership?.role === "owner"
                      ? isAr
                        ? "المالك يستطيع إضافة Manager أو Editor أو Support."
                        : "Owners can add Manager, Editor, or Support."
                      : isAr
                        ? "المدير يستطيع إضافة Editor أو Support فقط."
                        : "Managers can add Editor or Support only."}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="team@example.com"
                  className="h-11 rounded-2xl border border-line bg-surface-soft px-4 text-sm text-foreground outline-none focus:border-gold"
                />

                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as ManageableRole)}
                  className="h-11 rounded-2xl border border-line bg-surface-soft px-4 text-sm font-bold text-foreground outline-none focus:border-gold"
                >
                  {allowedRoles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[language][role]}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={saving || allowedRoles.length === 0}
                  className="h-11 rounded-2xl bg-gold px-5 text-sm font-black text-navy disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? isAr
                      ? "جاري الحفظ..."
                      : "Saving..."
                    : isAr
                      ? "إرسال الدعوة"
                      : "Send invite"}
                </button>
              </div>

              <p className="mt-3 text-xs text-muted">
                {isAr
                  ? "لن يُمنح Owner أو أي صلاحية Platform من هذه الشاشة. الدعوة لا تكشف إذا كان البريد مسجلًا أو تابعًا لحساب داخلي."
                  : "This flow cannot grant Owner or any Platform role. Invitations do not reveal whether an email is registered or belongs to an internal account."}
              </p>
            </form>

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
                  <Users size={18} className="text-amber-500" />
                  <h2 className="font-black text-foreground">
                    {isAr ? "الأعضاء النشطون" : "Active members"}
                  </h2>
                  <span className="rounded-full bg-surface-soft px-2 py-0.5 text-xs font-black text-muted">
                    {members.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void loadTeam()}
                  disabled={teamLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-bold text-foreground hover:border-gold/50 disabled:opacity-60"
                >
                  <RefreshCw size={14} className={teamLoading ? "animate-spin" : ""} />
                  {isAr ? "تحديث" : "Refresh"}
                </button>
              </div>

              {teamLoading ? (
                <div className="py-10 text-center text-sm text-muted">
                  {isAr ? "جاري تحميل الفريق..." : "Loading team..."}
                </div>
              ) : members.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted">
                  {isAr ? "لا يوجد أعضاء نشطون حاليًا." : "No active team members yet."}
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => {
                    const editable = canManageMember(member);
                    const memberOptions =
                      selectedMembership?.role === "owner"
                        ? (["manager", "editor", "support"] as ManageableRole[])
                        : (["editor", "support"] as ManageableRole[]);

                    return (
                      <div
                        key={member.membership_id}
                        className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-soft p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-black text-foreground">
                            {member.full_name || member.email}
                          </div>
                          <div className="mt-1 truncate text-xs text-muted">{member.email}</div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {editable ? (
                            <select
                              value={member.role}
                              disabled={saving}
                              onChange={(event) =>
                                void handleRoleChange(member, event.target.value as ManageableRole)
                              }
                              className="h-9 rounded-xl border border-line bg-surface px-3 text-xs font-bold text-foreground outline-none focus:border-gold disabled:opacity-60"
                            >
                              {memberOptions.map((role) => (
                                <option key={role} value={role}>
                                  {roleLabels[language][role]}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-bold text-foreground">
                              {roleLabels[language][member.role]}
                            </span>
                          )}

                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
                            Active
                          </span>

                          {editable && (
                            <button
                              type="button"
                              onClick={() => void handleRemove(member)}
                              disabled={saving}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-3 py-1.5 text-xs font-black text-red-600 hover:bg-red-500/10 disabled:opacity-60"
                            >
                              <Trash2 size={13} />
                              {isAr ? "إزالة" : "Remove"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
