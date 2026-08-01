-- ============================================================
-- NOORMEXA — المرحلة 3 (تكملة): مستوى "المطوّر" فوق "المالك"
-- ============================================================
-- شغّل هذا الملف فى Supabase SQL Editor بعد باقي ملفات السكيما.
--
-- الفكرة: عندنا دلوقتي مستويين:
--  • is_super_admin = صلاحية "المطوّر" (إنت) — العليا، ومحدش يقدر
--    يسحبها أو يمنحها لحد غيرك إلا من خلال SQL مباشرة.
--  • is_admin = صلاحية "مالك المنصة" (العميل) — يدير العمليات
--    اليومية (المتاجر، العمولات، التصنيفات، الأرباح) لكن معندوش
--    صلاحية يعدّل صلاحيات الأدمن نفسها.
-- ============================================================

alter table public.profiles
  add column if not exists is_super_admin boolean not null default false;

-- دالة تتحقق من صلاحية "المطوّر" العليا
create or replace function public.is_super_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_super_admin from public.profiles where id = uid), false);
$$;

-- حماية: أي محاولة تغيير is_admin أو is_super_admin لازم تكون
-- من حساب عليه is_super_admin = true، وإلا العملية تترفض بالكامل.
create or replace function public.protect_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- لو auth.uid() فاضي، معناها التنفيذ جاي مباشرة من SQL Editor
  -- (إنت شخصيًا بتشتغل على قاعدة البيانات)، مش من خلال الموقع.
  -- في الحالة دي نسمح بالتعديل عادي، والحماية تتفعّل بس على
  -- الطلبات الجاية من الموقع نفسه (لما يكون فيه مستخدم مسجل دخول).
  if auth.uid() is null then
    return new;
  end if;

  if (new.is_admin is distinct from old.is_admin)
     or (new.is_super_admin is distinct from old.is_super_admin) then
    if not public.is_super_admin(auth.uid()) then
      raise exception 'فقط المطوّر (Super Admin) يقدر يغيّر صلاحيات الإدارة';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_admin_fields_trigger on public.profiles;
create trigger protect_admin_fields_trigger
  before update on public.profiles
  for each row execute function public.protect_admin_fields();

-- ============================================================
-- خطوة أخيرة إلزامية: اجعل حسابك انت (المطوّر) هو الـ Super Admin
-- الوحيد. غيّر الإيميل تحت لإيميلك انت بالظبط.
-- ============================================================
update public.profiles
set is_super_admin = true, is_admin = true
where email = 'ramyelhawary73@gmail.com';

-- ملحوظة: باقي الأدمنز (زي مالك المنصة) هيفضلوا is_admin = true
-- و is_super_admin = false تلقائيًا، يعني يديروا المنصة لكن
-- ميقدروش يلمسوا صلاحيات الأدمن نفسها.
