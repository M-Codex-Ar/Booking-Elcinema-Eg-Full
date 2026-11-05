-- Harden profile and managed-content authorization without rewriting applied migrations.
-- Roles are assigned only through Supabase Auth app_metadata by a trusted operator.

drop policy if exists "Public profiles read" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'editor', 'viewer', 'user'));

create or replace function public.current_staff_role()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'editor', 'viewer')
      then (select auth.jwt() -> 'app_metadata' ->> 'role')
    else 'user'
  end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
$$;

create or replace function public.can_edit_managed_content()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'editor');
$$;

revoke all on function public.current_staff_role() from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.can_edit_managed_content() from public, anon;
grant execute on function public.current_staff_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_edit_managed_content() to authenticated;

-- Profiles mirror trusted app_metadata for display/operations only. They are
-- never an authorization source and cannot be changed by the profile owner.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  trusted_role text;
begin
  trusted_role := case
    when new.raw_app_meta_data ->> 'role' in ('admin', 'editor', 'viewer')
      then new.raw_app_meta_data ->> 'role'
    else 'user'
  end;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    trusted_role
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    role = excluded.role,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

update public.profiles as profile
set role = case
  when account.raw_app_meta_data ->> 'role' in ('admin', 'editor', 'viewer')
    then account.raw_app_meta_data ->> 'role'
  else 'user'
end,
email = account.email,
updated_at = now()
from auth.users as account
where account.id = profile.id;

-- Editors can create and update; only admins can delete. Viewers and ordinary
-- authenticated users remain read-only. Public SELECT policies are unchanged.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'managed_movies', 'managed_people', 'managed_boxoffice', 'managed_channels',
    'managed_programs', 'managed_videos', 'managed_lists'
  ] loop
    execute format('drop policy if exists %I on public.%I', 'Admin add ' || replace(table_name, 'managed_', ''), table_name);
    execute format('drop policy if exists %I on public.%I', 'Admin edit ' || replace(table_name, 'managed_', ''), table_name);
    execute format('drop policy if exists %I on public.%I', 'Admin remove ' || replace(table_name, 'managed_', ''), table_name);
    execute format('drop policy if exists %I on public.%I', 'Editor add ' || replace(table_name, 'managed_', ''), table_name);
    execute format('drop policy if exists %I on public.%I', 'Editor edit ' || replace(table_name, 'managed_', ''), table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.can_edit_managed_content())', 'Editor add ' || replace(table_name, 'managed_', ''), table_name);
    execute format('create policy %I on public.%I for update to authenticated using (public.can_edit_managed_content()) with check (public.can_edit_managed_content())', 'Editor edit ' || replace(table_name, 'managed_', ''), table_name);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_admin())', 'Admin remove ' || replace(table_name, 'managed_', ''), table_name);
  end loop;
end;
$$;
