begin;

-- Reapply idempotent migration for sitemap/log infra
create table if not exists public.url_change_log (
  id bigserial primary key,
  kind text not null check (kind in ('event','match','movie','countdown','tag','team','tv','static')),
  entity_id uuid,
  url text not null,
  reason text not null,
  created_at timestamptz default now()
);
create index if not exists idx_url_change_created on public.url_change_log(created_at);

create table if not exists public.sitemap_chunk (
  id bigserial primary key,
  section text not null,
  chunk_no integer not null,
  url_count integer not null default 0,
  last_built_at timestamptz,
  unique (section, chunk_no)
);

create or replace view public.static_pages as
  select '/legal/terms' as url
  union all select '/legal/privacy'
  union all select '/legal/cookies'
  union all select '/contact' ;

alter table public.url_change_log enable row level security;
alter table public.sitemap_chunk enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'url_change_log' AND policyname = 'url_change_log_admin_read'
  ) THEN
    CREATE POLICY url_change_log_admin_read ON public.url_change_log FOR SELECT USING (is_admin());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'url_change_log' AND policyname = 'url_change_log_admin_write'
  ) THEN
    CREATE POLICY url_change_log_admin_write ON public.url_change_log FOR ALL USING (is_admin()) WITH CHECK (is_admin());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sitemap_chunk' AND policyname = 'sitemap_chunk_admin_all'
  ) THEN
    CREATE POLICY sitemap_chunk_admin_all ON public.sitemap_chunk FOR ALL USING (is_admin()) WITH CHECK (is_admin());
  END IF;
END$$;

create index if not exists idx_event_sitemap on public.event(status, start_at desc);
create index if not exists idx_match_sitemap on public.match(status, kickoff_at desc);
create index if not exists idx_movie_sitemap on public.movie(status, cinema_release_ro desc);
create index if not exists idx_countdown_sitemap on public.countdown(status, target_at desc);

commit;