create table public.managed_movies (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ar text not null default '',
  genre text not null default '',
  year integer,
  release_date date,
  status text not null default 'now' check (status in ('now','soon')),
  rating numeric(3,1),
  runtime integer not null default 0,
  cert text not null default '',
  director_en text not null default '',
  director_ar text not null default '',
  synopsis_en text not null default '',
  synopsis_ar text not null default '',
  poster_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.managed_people (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text not null default '',
  role_en text not null default '',
  role_ar text not null default '',
  bio text not null default '',
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.managed_boxoffice (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ar text not null default '',
  weekly_egp numeric(12,2) not null default 0,
  total_egp numeric(12,2) not null default 0,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.managed_channels (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text not null default '',
  category text not null default 'general',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.managed_programs (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.managed_channels(id) on delete cascade,
  title_en text not null,
  title_ar text not null default '',
  start_min integer not null check (start_min between 0 and 1439),
  end_min integer not null check (end_min between 1 and 1440 and end_min > start_min),
  meta text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index managed_programs_channel_idx on public.managed_programs (channel_id, start_min);

create table public.managed_videos (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ar text not null default '',
  url text not null,
  thumb_url text,
  duration text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.managed_lists (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ar text not null default '',
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.managed_movies to anon, authenticated;
grant insert, update, delete on public.managed_movies to authenticated;
grant all on public.managed_movies to service_role;
grant select on public.managed_people to anon, authenticated;
grant insert, update, delete on public.managed_people to authenticated;
grant all on public.managed_people to service_role;
grant select on public.managed_boxoffice to anon, authenticated;
grant insert, update, delete on public.managed_boxoffice to authenticated;
grant all on public.managed_boxoffice to service_role;
grant select on public.managed_channels to anon, authenticated;
grant insert, update, delete on public.managed_channels to authenticated;
grant all on public.managed_channels to service_role;
grant select on public.managed_programs to anon, authenticated;
grant insert, update, delete on public.managed_programs to authenticated;
grant all on public.managed_programs to service_role;
grant select on public.managed_videos to anon, authenticated;
grant insert, update, delete on public.managed_videos to authenticated;
grant all on public.managed_videos to service_role;
grant select on public.managed_lists to anon, authenticated;
grant insert, update, delete on public.managed_lists to authenticated;
grant all on public.managed_lists to service_role;

alter table public.managed_movies enable row level security;
alter table public.managed_people enable row level security;
alter table public.managed_boxoffice enable row level security;
alter table public.managed_channels enable row level security;
alter table public.managed_programs enable row level security;
alter table public.managed_videos enable row level security;
alter table public.managed_lists enable row level security;

create policy "Public read movies" on public.managed_movies for select to anon, authenticated using (true);
create policy "Staff add movies" on public.managed_movies for insert to authenticated with check (true);
create policy "Staff edit movies" on public.managed_movies for update to authenticated using (true) with check (true);
create policy "Staff remove movies" on public.managed_movies for delete to authenticated using (true);

create policy "Public read people" on public.managed_people for select to anon, authenticated using (true);
create policy "Staff add people" on public.managed_people for insert to authenticated with check (true);
create policy "Staff edit people" on public.managed_people for update to authenticated using (true) with check (true);
create policy "Staff remove people" on public.managed_people for delete to authenticated using (true);

create policy "Public read boxoffice" on public.managed_boxoffice for select to anon, authenticated using (true);
create policy "Staff add boxoffice" on public.managed_boxoffice for insert to authenticated with check (true);
create policy "Staff edit boxoffice" on public.managed_boxoffice for update to authenticated using (true) with check (true);
create policy "Staff remove boxoffice" on public.managed_boxoffice for delete to authenticated using (true);

create policy "Public read channels" on public.managed_channels for select to anon, authenticated using (true);
create policy "Staff add channels" on public.managed_channels for insert to authenticated with check (true);
create policy "Staff edit channels" on public.managed_channels for update to authenticated using (true) with check (true);
create policy "Staff remove channels" on public.managed_channels for delete to authenticated using (true);

create policy "Public read programs" on public.managed_programs for select to anon, authenticated using (true);
create policy "Staff add programs" on public.managed_programs for insert to authenticated with check (true);
create policy "Staff edit programs" on public.managed_programs for update to authenticated using (true) with check (true);
create policy "Staff remove programs" on public.managed_programs for delete to authenticated using (true);

create policy "Public read videos" on public.managed_videos for select to anon, authenticated using (true);
create policy "Staff add videos" on public.managed_videos for insert to authenticated with check (true);
create policy "Staff edit videos" on public.managed_videos for update to authenticated using (true) with check (true);
create policy "Staff remove videos" on public.managed_videos for delete to authenticated using (true);

create policy "Public read lists" on public.managed_lists for select to anon, authenticated using (true);
create policy "Staff add lists" on public.managed_lists for insert to authenticated with check (true);
create policy "Staff edit lists" on public.managed_lists for update to authenticated using (true) with check (true);
create policy "Staff remove lists" on public.managed_lists for delete to authenticated using (true);