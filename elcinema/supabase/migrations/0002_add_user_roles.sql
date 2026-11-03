-- Migration: Add user roles, profiles table, and enforce admin-only modifications on managed content

-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Public profiles read" on public.profiles
  for select to anon, authenticated using (true);

create policy "Users can update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- 3. Helper function to check if current user is admin
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    ),
    false
  );
$$;

-- 4. Trigger to create or update profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    role = coalesce(excluded.role, profiles.role),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sync existing users if any
insert into public.profiles (id, email, full_name, role)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
  coalesce(raw_app_meta_data->>'role', raw_user_meta_data->>'role', 'user')
from auth.users
on conflict (id) do update set
  role = coalesce(excluded.role, profiles.role);

-- 5. Tighten RLS policies on managed tables so only admins can insert, update, delete
-- Movies
drop policy if exists "Staff add movies" on public.managed_movies;
drop policy if exists "Staff edit movies" on public.managed_movies;
drop policy if exists "Staff remove movies" on public.managed_movies;
create policy "Admin add movies" on public.managed_movies for insert to authenticated with check (public.is_admin());
create policy "Admin edit movies" on public.managed_movies for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin remove movies" on public.managed_movies for delete to authenticated using (public.is_admin());

-- People
drop policy if exists "Staff add people" on public.managed_people;
drop policy if exists "Staff edit people" on public.managed_people;
drop policy if exists "Staff remove people" on public.managed_people;
create policy "Admin add people" on public.managed_people for insert to authenticated with check (public.is_admin());
create policy "Admin edit people" on public.managed_people for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin remove people" on public.managed_people for delete to authenticated using (public.is_admin());

-- Boxoffice
drop policy if exists "Staff add boxoffice" on public.managed_boxoffice;
drop policy if exists "Staff edit boxoffice" on public.managed_boxoffice;
drop policy if exists "Staff remove boxoffice" on public.managed_boxoffice;
create policy "Admin add boxoffice" on public.managed_boxoffice for insert to authenticated with check (public.is_admin());
create policy "Admin edit boxoffice" on public.managed_boxoffice for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin remove boxoffice" on public.managed_boxoffice for delete to authenticated using (public.is_admin());

-- Channels
drop policy if exists "Staff add channels" on public.managed_channels;
drop policy if exists "Staff edit channels" on public.managed_channels;
drop policy if exists "Staff remove channels" on public.managed_channels;
create policy "Admin add channels" on public.managed_channels for insert to authenticated with check (public.is_admin());
create policy "Admin edit channels" on public.managed_channels for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin remove channels" on public.managed_channels for delete to authenticated using (public.is_admin());

-- Programs
drop policy if exists "Staff add programs" on public.managed_programs;
drop policy if exists "Staff edit programs" on public.managed_programs;
drop policy if exists "Staff remove programs" on public.managed_programs;
create policy "Admin add programs" on public.managed_programs for insert to authenticated with check (public.is_admin());
create policy "Admin edit programs" on public.managed_programs for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin remove programs" on public.managed_programs for delete to authenticated using (public.is_admin());

-- Videos
drop policy if exists "Staff add videos" on public.managed_videos;
drop policy if exists "Staff edit videos" on public.managed_videos;
drop policy if exists "Staff remove videos" on public.managed_videos;
create policy "Admin add videos" on public.managed_videos for insert to authenticated with check (public.is_admin());
create policy "Admin edit videos" on public.managed_videos for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin remove videos" on public.managed_videos for delete to authenticated using (public.is_admin());

-- Lists
drop policy if exists "Staff add lists" on public.managed_lists;
drop policy if exists "Staff edit lists" on public.managed_lists;
drop policy if exists "Staff remove lists" on public.managed_lists;
create policy "Admin add lists" on public.managed_lists for insert to authenticated with check (public.is_admin());
create policy "Admin edit lists" on public.managed_lists for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin remove lists" on public.managed_lists for delete to authenticated using (public.is_admin());

