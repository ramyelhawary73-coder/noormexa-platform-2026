"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type Profile = Record<string, unknown>;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser: User) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as Profile);
      return;
    }

    // الملف الشخصي مش موجود (ممكن يحصل لو التسجيل استكمل بعد فترة انتظار
    // تأكيد الإيميل) - نصلحه تلقائيًا بإنشاء ملف افتراضي بدل ما نسيبه فاضي.
    // بنقرأ بيانات النوع (بائع/متجر/معلن) اللي المستخدم اختارها بالفعل
    // وقت التسجيل بالإيميل (متخزنة فى user_metadata حتى قبل التأكيد)،
    // عشان لو كان اختار نوعه، مايتسألش عنه تاني بعد التفعيل.
    const meta = authUser.user_metadata ?? {};
    const chosenType = typeof meta.account_type === "string" ? meta.account_type : null;

    // upsert بدل insert عشان لو حصل تعارض سباق (تبويب تاني عمل الملف
    // في نفس اللحظة)، العملية تنجح من غير ما ترمي خطأ 409.
    const { data: created } = await supabase
      .from("profiles")
      .upsert(
        {
          id: authUser.id,
          email: authUser.email ?? null,
          full_name: typeof meta.full_name === "string" ? meta.full_name : null,
          phone: typeof meta.phone === "string" ? meta.phone : null,
          account_type: chosenType ?? "customer",
          business_name: typeof meta.business_name === "string" ? meta.business_name : null,
          account_type_chosen: Boolean(chosenType),
        },
        { onConflict: "id", ignoreDuplicates: true }
      )
      .select()
      .maybeSingle();

    if (created) {
      setProfile(created as Profile);
    } else {
      // لو upsert ماردّش صف (لأن الصف كان موجود بالفعل)، نجيبه تاني.
      const { data: existing } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
      if (existing) setProfile(existing as Profile);
    }
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        await fetchProfile(session.user);
      }

      setLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const refreshProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      await fetchProfile(session.user);
    }
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
