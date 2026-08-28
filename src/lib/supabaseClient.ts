import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qiqvmsjjgwdsievkrhly.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_lmZdv208iUvYZmi_P-A07Q_ss1Bvn2g';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'placeholder-anon-key'
);

// خط الاتصال السحابي الموحد لقاعدة بيانات منصة NOORMEXA.
// لا نوقف Build على Vercel إذا لم تتم إضافة مفاتيح Supabase بعد.
// عند إضافة المتغيرات الحقيقية في Vercel سيتم استخدامها تلقائياً.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
