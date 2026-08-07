import { createClient } from "@supabase/supabase-js";

// ============================================================
// تحذير: هذا الملف للاستخدام على السيرفر فقط (API Routes)،
// ولا يجب استيراده أبدًا فى أي مكوّن "use client".
// المفتاح ده بيتخطى كل قواعد الحماية (RLS) بالكامل.
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseAdminConfigured = Boolean(supabaseUrl && serviceRoleKey);

export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder-service-role-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
