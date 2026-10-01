-- NOORMEXA Permissions Foundation follow-up
-- Fix DELETE trigger return semantics for non-protected store members.

create or replace function public.protect_super_admin_store_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $store_member_guard$
begin
  if auth.uid() is null then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if old.user_id is not null and public.is_super_admin(old.user_id) then
    if tg_op = 'DELETE' then
      raise exception 'Super Admin store membership is protected';
    end if;

    if new.user_id is distinct from old.user_id
       or new.status is distinct from old.status
       or new.role is distinct from old.role then
      raise exception 'Super Admin store membership is protected';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$store_member_guard$;
