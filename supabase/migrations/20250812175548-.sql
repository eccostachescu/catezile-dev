-- Metrics & Trending schema (Prompt 18)
-- 1) Generic daily aggregations
create table if not exists public.metric_daily (
  id bigserial primary key,
  day date not null,
  source text not null check (source in ('plausible','internal','ads','affiliate')),
  metric text not null,      -- ex: pageviews, visitors, ad_views, affiliate_clicks, revenue_est
  value numeric not null,
  labels jsonb default '{}'::jsonb, -- ex: {"page":"/evenimente/1-decembrie"}
  created_at timestamptz default now()
);
create index if not exists idx_metric_daily_day on public.metric_daily(day);
-- Uniqueness by (day, source, metric, labels) using expression unique index
create unique index if not exists uidx_metric_daily_unique
  on public.metric_daily (day, source, metric, (coalesce(labels::text,'{}')));

-- 2) Affiliate KPI by day
create table if not exists public.affiliate_kpi_daily (
  day date not null,
  affiliate_link_id uuid not null default '00000000-0000-0000-0000-000000000000',
  merchant text,
  clicks integer not null default 0,
  est_revenue numeric(12,2) not null default 0,
  primary key (day, affiliate_link_id)
);

-- 3) Trending scores (rolling)
create table if not exists public.trending (
  kind text not null check (kind in ('event','match','movie')),
  entity_id uuid not null,
  score numeric not null,
  reasons jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  primary key (kind, entity_id)
);

-- 4) Cache top pages daily
create table if not exists public.top_pages_daily (
  day date not null,
  path text not null,
  pageviews integer not null,
  visitors integer not null,
  primary key (day, path)
);

-- 5) RLS: admin only access
alter table public.metric_daily enable row level security;
alter table public.affiliate_kpi_daily enable row level security;
alter table public.trending enable row level security;
alter table public.top_pages_daily enable row level security;

-- Drop existing policies with same names if they exist to avoid conflicts
do $$ begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='metric_daily' and policyname='admin only') then
    execute 'drop policy "admin only" on public.metric_daily';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='affiliate_kpi_daily' and policyname='admin only') then
    execute 'drop policy "admin only" on public.affiliate_kpi_daily';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='trending' and policyname='admin only') then
    execute 'drop policy "admin only" on public.trending';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='top_pages_daily' and policyname='admin only') then
    execute 'drop policy "admin only" on public.top_pages_daily';
  end if;
end $$;

create policy "admin only" on public.metric_daily for all using (public.is_admin());
create policy "admin only" on public.affiliate_kpi_daily for all using (public.is_admin());
create policy "admin only" on public.trending for all using (public.is_admin());
create policy "admin only" on public.top_pages_daily for all using (public.is_admin());