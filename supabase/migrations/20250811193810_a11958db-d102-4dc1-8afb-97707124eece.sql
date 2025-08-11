-- 0002_full_schema.sql
begin;

-- Extensions
create extension if not exists pg_trgm;
create extension if not exists citext;

-- Helper: auto updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helper: current user email from JWT
create or replace function public.current_user_email()
returns text
language sql stable
as $$
  select coalesce(nullif((current_setting('request.jwt.claims', true)::json->>'email'), ''), null);
$$;

-- Admin allowlist
create table if not exists public.admin_emails (
  email citext primary key
);
insert into public.admin_emails(email) values ('eccostachescu@gmail.com')
  on conflict do nothing;

-- Profiles linked to auth.users
create table if not exists public.profile (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique,
  role text not null default 'USER', -- USER | ADMIN
  theme_pref text check (theme_pref in ('T1','T2','T3')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger _profile_updated_at before update on public.profile
  for each row execute function public.set_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profile (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- is_admin(): profile.role=ADMIN OR email in admin_emails
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profile p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
  or exists (
    select 1 from public.admin_emails a
    where a.email = public.current_user_email()
  );
$$;

-- Site‑wide settings
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
create or replace trigger _settings_updated_at before update on public.settings
  for each row execute procedure public.set_updated_at();
insert into public.settings(key, value) values ('season_mode', '{"value":"DEFAULT"}')
  on conflict (key) do nothing;

-- Categories
create table if not exists public.category (
  id uuid primary key default gen_random_uuid(),
  slug citext unique not null,
  name text not null,
  sort int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger _category_updated_at before update on public.category
  for each row execute function public.set_updated_at();
create index if not exists idx_category_sort on public.category(sort);

-- SEO templates per entity
create table if not exists public.seo_template (
  entity_type text not null, -- 'event' | 'match' | 'movie' | 'category' | 'countdown'
  code text not null,        -- e.g. 'default', 'black-friday', 'liga1', 'exam'
  title_tmpl text not null,
  meta_desc_tmpl text not null,
  h1_tmpl text not null,
  faq jsonb default '[]',
  og_theme text default 'T2',
  is_default boolean default false,
  primary key(entity_type, code)
);

-- Slugify helper (simple RO diacritics fold)
create or replace function public.slugify(txt text)
returns text language plpgsql as $$
declare s text;
begin
  s := lower(txt);
  s := translate(s, 'ăâîșşțţÁÂÎȘŞȚŢĂ', 'aaissttAAISSTTA');
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := regexp_replace(s, '(^-|-$)', '', 'g');
  return s;
end$$;

-- EVENTS
create table if not exists public.event (
  id uuid primary key default gen_random_uuid(),
  slug citext unique not null,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  timezone text not null default 'Europe/Bucharest',
  category_id uuid references public.category(id) on delete set null,
  city text,
  country text default 'RO',
  official_site text,
  image_url text,
  status text not null check (status in ('DRAFT','PUBLISHED')) default 'PUBLISHED',
  -- SEO auto fields
  seo_title text,
  seo_description text,
  seo_h1 text,
  seo_faq jsonb default '[]',
  og_theme text default 'T2',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger _event_updated_at before update on public.event
  for each row execute function public.set_updated_at();
create index if not exists idx_event_start on public.event(start_at);
create index if not exists idx_event_cat on public.event(category_id);
create index if not exists idx_event_gin_slug on public.event using gin (slug gin_trgm_ops);

-- Countdown (UGC) with moderation
create table if not exists public.countdown (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  slug citext unique,
  title text not null,
  target_at timestamptz not null,
  privacy text not null check (privacy in ('PUBLIC','UNLISTED')) default 'PUBLIC',
  status text not null check (status in ('PENDING','APPROVED','REJECTED')) default 'PENDING',
  theme jsonb,
  image_url text,
  city text,
  -- SEO
  seo_title text,
  seo_description text,
  seo_h1 text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger _countdown_updated_at before update on public.countdown
  for each row execute function public.set_updated_at();
create index if not exists idx_countdown_owner on public.countdown(owner_id);
create index if not exists idx_countdown_target on public.countdown(target_at);

-- Affiliates & mapping
create table if not exists public.affiliate_link (
  id uuid primary key default gen_random_uuid(),
  partner text not null,
  url text not null,
  tracking_key text,
  active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger _affiliate_updated_at before update on public.affiliate_link
  for each row execute function public.set_updated_at();

create table if not exists public.event_offer (
  event_id uuid references public.event(id) on delete cascade,
  affiliate_link_id uuid references public.affiliate_link(id) on delete cascade,
  primary key(event_id, affiliate_link_id)
);

create table if not exists public.ad_slot (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  description text
);

create table if not exists public.click (
  id bigserial primary key,
  kind text not null check (kind in ('affiliate','sponsor')),
  entity_id uuid not null,
  ip_hash text,
  user_agent text,
  referrer text,
  utm jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_click_entity on public.click(entity_id);

-- Sports
create table if not exists public.competition (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  area text,
  season int,
  external jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger _competition_updated_at before update on public.competition
  for each row execute function public.set_updated_at();

create table if not exists public.match (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references public.competition(id) on delete cascade,
  round text,
  home text not null,
  away text not null,
  kickoff_at timestamptz not null,
  stadium text,
  city text,
  status text not null check (status in ('SCHEDULED','LIVE','FINISHED')) default 'SCHEDULED',
  score jsonb default '{}',
  tv_channels text[] default '{}',
  is_derby boolean default false,
  -- SEO
  slug citext unique,
  seo_title text,
  seo_description text,
  seo_h1 text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger _match_updated_at before update on public.match
  for each row execute function public.set_updated_at();
create index if not exists idx_match_competition on public.match(competition_id);
create index if not exists idx_match_kickoff on public.match(kickoff_at);
create index if not exists idx_match_gin_slug on public.match using gin (slug gin_trgm_ops);

create table if not exists public.match_offer (
  match_id uuid references public.match(id) on delete cascade,
  affiliate_link_id uuid references public.affiliate_link(id) on delete cascade,
  primary key(match_id, affiliate_link_id)
);

-- Movies
create table if not exists public.movie (
  id uuid primary key default gen_random_uuid(),
  tmdb_id int unique not null,
  title text not null,
  poster_url text,
  cinema_release_ro date,
  netflix_date date,
  prime_date date,
  status text not null check (status in ('SCHEDULED','RELEASED','DELAYED')) default 'SCHEDULED',
  slug citext unique,
  -- SEO
  seo_title text,
  seo_description text,
  seo_h1 text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger _movie_updated_at before update on public.movie
  for each row execute function public.set_updated_at();
create index if not exists idx_movie_release on public.movie(cinema_release_ro);
create index if not exists idx_movie_gin_slug on public.movie using gin (slug gin_trgm_ops);

-- Engagement
create table if not exists public.follow (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('event','match','movie','category','countdown')),
  entity_id uuid not null,
  created_at timestamptz default now()
);

create table if not exists public.reminder (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('event','match','movie','category')),
  entity_id uuid not null,
  offset_days int not null check (offset_days > 0 and offset_days <= 365),
  created_at timestamptz default now()
);

-- System logs
create table if not exists public.ingestion_log (
  id bigserial primary key,
  source text,
  status text,
  rows int,
  message text,
  ran_at timestamptz default now()
);

-- === SEO AUTO‑GEN FUNCTIONS & TRIGGERS ===
-- Render templates with simple {{placeholders}}
create or replace function public.render_template(tmpl text, vars jsonb)
returns text language plpgsql as $$
declare out text := tmpl;
declare k text; v text;
begin
  for k, v in select key, value::text from jsonb_each(vars) loop
    out := replace(out, '{{' || k || '}}', coalesce(v,''));
  end loop;
  return trim(out);
end$$;

-- Event SEO compute
create or replace function public.compute_event_seo(e public.event)
returns public.event
language plpgsql as $$
declare tmpl record; vars jsonb; y text;
begin
  y := to_char(e.start_at at time zone e.timezone, 'YYYY');
  select * into tmpl from public.seo_template where entity_type='event'
    and (code = coalesce((select slug from public.category where id = e.category_id), 'default') or is_default)
    order by is_default desc limit 1;
  vars := jsonb_build_object(
    'title', e.title,
    'date_ro', to_char(e.start_at at time zone e.timezone, 'DD MON YYYY'),
    'year', y,
    'city', coalesce(e.city,''),
    'category', coalesce((select name from public.category c where c.id=e.category_id),'')
  );
  e.seo_title := coalesce(e.seo_title, public.render_template(coalesce(tmpl.title_tmpl,'{{title}} ({{year}})'), vars));
  e.seo_description := coalesce(e.seo_description, public.render_template(coalesce(tmpl.meta_desc_tmpl,'Află în câte zile până la {{title}} ({{date_ro}}).'), vars));
  e.seo_h1 := coalesce(e.seo_h1, public.render_template(coalesce(tmpl.h1_tmpl,'Câte zile până la {{title}}?'), vars));
  e.og_theme := coalesce(e.og_theme, coalesce(tmpl.og_theme,'T2'));
  if e.slug is null or e.slug = '' then
    e.slug := public.slugify(e.title || '-' || y);
  end if;
  return e;
end$$;

create or replace function public.event_before_insert()
returns trigger language plpgsql as $$
begin
  new := public.compute_event_seo(new);
  return new;
end$$;
create trigger _event_bi before insert on public.event for each row execute function public.event_before_insert();

create or replace function public.event_before_update()
returns trigger language plpgsql as $$
begin
  if (new.title is distinct from old.title) or (new.start_at is distinct from old.start_at) or (new.category_id is distinct from old.category_id) then
    new := public.compute_event_seo(new);
  end if;
  return new;
end$$;
create trigger _event_bu before update on public.event for each row execute function public.event_before_update();

-- Match SEO compute
create or replace function public.compute_match_seo(m public.match)
returns public.match
language plpgsql as $$
declare tmpl record; vars jsonb; d text; t text;
begin
  select * into tmpl from public.seo_template where entity_type='match'
    and (code = coalesce((select code from public.competition where id = m.competition_id),'default') or is_default)
    order by is_default desc limit 1;
  d := to_char(m.kickoff_at at time zone 'Europe/Bucharest', 'DD MON YYYY');
  t := to_char(m.kickoff_at at time zone 'Europe/Bucharest', 'HH24:MI');
  vars := jsonb_build_object(
    'home', m.home,
    'away', m.away,
    'date_ro', d,
    'time_ro', t,
    'tv', array_to_string(coalesce(m.tv_channels,'{}'), ', ')
  );
  m.seo_title := coalesce(m.seo_title, public.render_template(coalesce(tmpl.title_tmpl,'{{home}} vs {{away}} — {{date_ro}} {{time_ro}}'), vars));
  m.seo_description := coalesce(m.seo_description, public.render_template(coalesce(tmpl.meta_desc_tmpl,'Pe ce canal e {{home}} – {{away}}? Ora {{time_ro}}, {{date_ro}}. Canale: {{tv}}.'), vars));
  m.seo_h1 := coalesce(m.seo_h1, public.render_template(coalesce(tmpl.h1_tmpl,'{{home}} – {{away}}: ora și canal TV'), vars));
  if m.slug is null or m.slug = '' then
    m.slug := public.slugify(m.home || '-' || m.away || '-' || d);
  end if;
  return m;
end$$;

create or replace function public.match_bi() returns trigger language plpgsql as $$
begin new := public.compute_match_seo(new); return new; end$$;
create or replace function public.match_bu() returns trigger language plpgsql as $$
begin if (new.home, new.away, new.kickoff_at) is distinct from (old.home, old.away, old.kickoff_at) then new := public.compute_match_seo(new); end if; return new; end$$;
create trigger _match_bi before insert on public.match for each row execute function public.match_bi();
create trigger _match_bu before update on public.match for each row execute function public.match_bu();

-- Movie SEO compute
create or replace function public.compute_movie_seo(x public.movie)
returns public.movie
language plpgsql as $$
begin
  if x.slug is null or x.slug = '' then
    x.slug := public.slugify(x.title);
  end if;
  x.seo_title := coalesce(x.seo_title, x.title || ' — Data lansării în România');
  x.seo_description := coalesce(x.seo_description, 'Când apare ' || x.title || ' la cinema în România și pe Netflix/Prime.');
  x.seo_h1 := coalesce(x.seo_h1, 'Când apare ' || x.title || '?');
  return x;
end$$;
create or replace function public.movie_bi() returns trigger language plpgsql as $$
begin new := public.compute_movie_seo(new); return new; end$$;
create or replace function public.movie_bu() returns trigger language plpgsql as $$
begin if (new.title is distinct from old.title) then new := public.compute_movie_seo(new); end if; return new; end$$;
create trigger _movie_bi before insert on public.movie for each row execute function public.movie_bi();
create trigger _movie_bu before update on public.movie for each row execute function public.movie_bu();

-- Countdown defaults (owner, slug, seo)
create or replace function public.countdown_bi() returns trigger language plpgsql as $$
begin
  if new.owner_id is null then new.owner_id := auth.uid(); end if;
  if new.slug is null or new.slug='' then new.slug := public.slugify(new.title || '-' || to_char(new.target_at, 'YYYYMMDD')); end if;
  if new.seo_title is null then new.seo_title := new.title || ' — Câte zile au rămas'; end if;
  if new.seo_description is null then new.seo_description := 'Vezi câte zile au rămas până la ' || new.title || '.'; end if;
  if new.seo_h1 is null then new.seo_h1 := 'Câte zile până la ' || new.title || '?'; end if;
  return new;
end$$;
create trigger _countdown_bi before insert on public.countdown for each row execute function public.countdown_bi();

-- ===== RLS Policies =====
-- Enable RLS on relevant tables
alter table public.profile enable row level security;
alter table public.category enable row level security;
alter table public.event enable row level security;
alter table public.countdown enable row level security;
alter table public.affiliate_link enable row level security;
alter table public.event_offer enable row level security;
alter table public.match enable row level security;
alter table public.match_offer enable row level security;
alter table public.movie enable row level security;
alter table public.follow enable row level security;
alter table public.reminder enable row level security;
alter table public.click enable row level security;

-- Profiles: owner can read/update self; admins can read all
create policy if not exists "select own profile" on public.profile for select using (auth.uid() = id or public.is_admin());
create policy if not exists "update own profile" on public.profile for update using (auth.uid() = id) with check (auth.uid() = id);

-- Category: public read; admin write
create policy if not exists "public read category" on public.category for select using (true);
create policy if not exists "admin write category" on public.category for all using (public.is_admin()) with check (public.is_admin());

-- Event: public reads only PUBLISHED; admins full
create policy if not exists "public read events" on public.event for select using (status = 'PUBLISHED' or public.is_admin());
create policy if not exists "admin write events" on public.event for all using (public.is_admin()) with check (public.is_admin());

-- Countdown: public reads only APPROVED+PUBLIC; owners see theirs; admins full
create policy if not exists "public read approved countdowns" on public.countdown for select using (
  (status='APPROVED' and privacy='PUBLIC')
  or owner_id = auth.uid()
  or public.is_admin()
);
create policy if not exists "owner write countdown" on public.countdown for insert with check (owner_id = auth.uid());
create policy if not exists "owner update/delete countdown" on public.countdown for update using (owner_id = auth.uid());
create policy if not exists "admin write countdown" on public.countdown for all using (public.is_admin()) with check (public.is_admin());

-- Affiliate links + offers: admins only
create policy if not exists "admin affiliate" on public.affiliate_link for all using (public.is_admin()) with check (public.is_admin());
create policy if not exists "admin event_offer" on public.event_offer for all using (public.is_admin()) with check (public.is_admin());

-- Match/Movie: public read; admin write
create policy if not exists "public read matches" on public.match for select using (true);
create policy if not exists "admin write matches" on public.match for all using (public.is_admin()) with check (public.is_admin());
create policy if not exists "public read movies" on public.movie for select using (true);
create policy if not exists "admin write movies" on public.movie for all using (public.is_admin()) with check (public.is_admin());

-- Follow/Reminder: owner only
create policy if not exists "owner follow" on public.follow for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists "owner reminder" on public.reminder for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Clicks: anyone can insert (server/outlinks), admins read
create policy if not exists "insert clicks" on public.click for insert with check (true);
create policy if not exists "admin read clicks" on public.click for select using (public.is_admin());

-- ===== Seeds =====
insert into public.category (slug, name, sort) values
  ('sarbatori', 'Sărbători', 1),
  ('examene', 'Examene', 2),
  ('festivaluri', 'Festivaluri', 3),
  ('sport', 'Sport', 4),
  ('shopping', 'Shopping', 5),
  ('filme', 'Filme', 6),
  ('guvern', 'Guvern', 7),
  ('black-friday', 'Black Friday', 8)
  on conflict do nothing;

-- SEO template seeds
insert into public.seo_template(entity_type, code, title_tmpl, meta_desc_tmpl, h1_tmpl, faq, og_theme, is_default) values
  ('event','default','{{title}} ({{year}}) — România','Află în câte zile până la {{title}} ({{date_ro}}). Program, informații și linkuri utile.','Câte zile până la {{title}}?','[]','T2', true),
  ('event','black-friday','Black Friday {{year}} — {{title}}','Black Friday {{year}} la {{title}}: când începe, ce oferte apar și cum te pregătești.','Când începe Black Friday {{year}} la {{title}}?','[]','T3', false),
  ('match','liga1','{{home}} vs {{away}} — {{date_ro}} {{time_ro}}','Pe ce canal e {{home}} – {{away}}? Ora {{time_ro}}, {{date_ro}}. Canale: {{tv}}.','{{home}} – {{away}}: ora și canal TV','[]','T3', true),
  ('movie','default','{{title}} — Data lansării în România','Când apare {{title}} la cinema în România și pe Netflix/Prime.','Când apare {{title}}?','[]','T2', true)
  on conflict do nothing;

-- Example canonical events (expanded fixed-date set)
-- Crăciun
insert into public.event (slug, title, start_at, timezone, category_id, status)
select public.slugify('Crăciun ' || extract(year from now())::text), 'Crăciun', date_trunc('year', now()) + interval '11 months 25 days', 'Europe/Bucharest', (select id from public.category where slug='sarbatori'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'craciun%');

-- Black Friday (3rd Friday of November approximation: Nov 15 + days to next Friday)
insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'black-friday-' || extract(year from now())::text, 'Black Friday ' || extract(year from now())::text,
       date_trunc('year', now()) + interval '10 months 15 days',
       'Europe/Bucharest', (select id from public.category where slug='black-friday'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'black-friday-%');

-- Additional fixed-date Romanian events
insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'anul-nou-' || extract(year from now())::text, 'Anul Nou', date_trunc('year', now()), 'Europe/Bucharest', (select id from public.category where slug='sarbatori'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'anul-nou-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'unirea-principatelor-' || extract(year from now())::text, 'Ziua Unirii Principatelor Române', date_trunc('year', now()) + interval '0 months 24 days', 'Europe/Bucharest', (select id from public.category where slug='guvern'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'unirea-principatelor-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'valentines-day-' || extract(year from now())::text, 'Valentine\'s Day', date_trunc('year', now()) + interval '1 months 13 days', 'Europe/Bucharest', (select id from public.category where slug='sarbatori'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'valentines-day-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'dragobete-' || extract(year from now())::text, 'Dragobete', date_trunc('year', now()) + interval '1 months 23 days', 'Europe/Bucharest', (select id from public.category where slug='sarbatori'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'dragobete-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'martisor-' || extract(year from now())::text, 'Mărțișor', date_trunc('year', now()) + interval '2 months 0 days', 'Europe/Bucharest', (select id from public.category where slug='sarbatori'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'martisor-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'ziua-femeii-' || extract(year from now())::text, 'Ziua Femeii', date_trunc('year', now()) + interval '2 months 7 days', 'Europe/Bucharest', (select id from public.category where slug='sarbatori'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'ziua-femeii-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'ziua-muncii-' || extract(year from now())::text, 'Ziua Muncii', date_trunc('year', now()) + interval '4 months 0 days', 'Europe/Bucharest', (select id from public.category where slug='guvern'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'ziua-muncii-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'ziua-europei-' || extract(year from now())::text, 'Ziua Europei', date_trunc('year', now()) + interval '4 months 8 days', 'Europe/Bucharest', (select id from public.category where slug='guvern'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'ziua-europei-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'ziua-copilului-' || extract(year from now())::text, 'Ziua Copilului', date_trunc('year', now()) + interval '5 months 0 days', 'Europe/Bucharest', (select id from public.category where slug='sarbatori'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'ziua-copilului-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'ziua-educatiei-' || extract(year from now())::text, 'Ziua Educației', date_trunc('year', now()) + interval '9 months 4 days', 'Europe/Bucharest', (select id from public.category where slug='guvern'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'ziua-educatiei-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'halloween-' || extract(year from now())::text, 'Halloween', date_trunc('year', now()) + interval '9 months 30 days', 'Europe/Bucharest', (select id from public.category where slug='festivaluri'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'halloween-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'sf-andrei-' || extract(year from now())::text, 'Sfântul Andrei', date_trunc('year', now()) + interval '10 months 29 days', 'Europe/Bucharest', (select id from public.category where slug='sarbatori'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'sf-andrei-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'mos-nicolae-' || extract(year from now())::text, 'Moș Nicolae', date_trunc('year', now()) + interval '11 months 5 days', 'Europe/Bucharest', (select id from public.category where slug='sarbatori'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'mos-nicolae-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'ziua-nationala-' || extract(year from now())::text, 'Ziua Națională a României', date_trunc('year', now()) + interval '11 months 0 days', 'Europe/Bucharest', (select id from public.category where slug='guvern'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'ziua-nationala-%');

insert into public.event (slug, title, start_at, timezone, category_id, status)
select 'revelion-' || extract(year from now())::text, 'Revelion', date_trunc('year', now()) + interval '11 months 30 days', 'Europe/Bucharest', (select id from public.category where slug='sarbatori'), 'PUBLISHED'
where not exists (select 1 from public.event where slug like 'revelion-%');

-- Helpful view: Pending UGC moderation queue
create or replace view public.ugc_queue as
select id, 'countdown' as kind, title, target_at as date_at, owner_id, status, created_at
from public.countdown where status='PENDING';

commit;