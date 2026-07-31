import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

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
