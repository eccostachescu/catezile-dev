-- 0024_liga1.sql (retry) — Liga 1 (SuperLiga) foundation with safe policy creation

-- 1) League
create table if not exists public.league (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  country text default 'RO'
);

insert into public.league(slug, name) values ('liga-1','SuperLiga (Liga 1)')
on conflict (slug) do nothing;

-- 2) Season
create table if not exists public.season (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.league(id) on delete cascade,
  year_start smallint not null,
  year_end smallint not null,
  phase text not null default 'regular' check (phase in ('regular','playoff','playout')),
  start_date date,
  end_date date,
  is_current boolean default false,
  unique (league_id, year_start, year_end)
);

create index if not exists idx_season_current on public.season(is_current);
create index if not exists idx_season_league on public.season(league_id);

-- 3) Round (Etape)
create table if not exists public.round (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.season(id) on delete cascade,
  number smallint not null,
  name text,
  start_date date,
  end_date date,
  unique (season_id, number)
);

create index if not exists idx_round_season on public.round(season_id);

-- 4) Extend match with league/season/round linkage
alter table public.match 
  add column if not exists league_id uuid references public.league(id),
  add column if not exists season_id uuid references public.season(id),
  add column if not exists round_id uuid references public.round(id),
  add column if not exists round_number smallint;

create index if not exists idx_match_league on public.match(league_id, season_id, round_number, kickoff_at);

-- 5) Tiebreak rule (admin configurable, read public)
create table if not exists public.tiebreak_rule (
  league_id uuid primary key references public.league(id) on delete cascade,
  rules jsonb not null default '["points","h2h_points","h2h_gd","gd","gf"]'
);

insert into public.tiebreak_rule(league_id)
  select id from public.league l where l.slug='liga-1'
  on conflict do nothing;

-- 6) Derby (canonical team names)
create table if not exists public.derby (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.league(id) on delete cascade,
  team_a text not null,
  team_b text not null,
  name text not null,
  importance smallint default 5,
  check (team_a <> team_b),
  unique (league_id, team_a, team_b)
);

create index if not exists idx_derby_league on public.derby(league_id);

-- 7) Standings (Regular) view
create or replace view public.standings_regular
with (security_invoker = true) as
with canon_match as (
  select 
    m.season_id,
    m.league_id,
    m.home as home_name,
    m.away as away_name,
    coalesce((m.score->>'home')::int, null) as home_goals,
    coalesce((m.score->>'away')::int, null) as away_goals,
    m.status
  from public.match m
  where m.season_id is not null
    and m.league_id = (select id from public.league where slug='liga-1')
)
, teams as (
  select season_id, league_id, home_name as team_name from canon_match
  union
  select season_id, league_id, away_name as team_name from canon_match
)
select 
  t.season_id,
  t.team_name,
  coalesce(sum(case when c.status = 'FINISHED' and (c.home_name = t.team_name or c.away_name = t.team_name) then 1 else 0 end),0) as played,
  coalesce(sum(case when c.status='FINISHED' and ((c.home_name=t.team_name and c.home_goals>c.away_goals) or (c.away_name=t.team_name and c.away_goals>c.home_goals)) then 1 else 0 end),0) as wins,
  coalesce(sum(case when c.status='FINISHED' and c.home_goals=c.away_goals and (c.home_name=t.team_name or c.away_name=t.team_name) then 1 else 0 end),0) as draws,
  coalesce(sum(case when c.status='FINISHED' and ((c.home_name=t.team_name and c.home_goals<c.away_goals) or (c.away_name=t.team_name and c.away_goals<c.home_goals)) then 1 else 0 end),0) as losses,
  coalesce(sum(case when c.status='FINISHED' and c.home_name=t.team_name then c.home_goals when c.status='FINISHED' and c.away_name=t.team_name then c.away_goals else 0 end),0) as gf,
  coalesce(sum(case when c.status='FINISHED' and c.home_name=t.team_name then c.away_goals when c.status='FINISHED' and c.away_name=t.team_name then c.home_goals else 0 end),0) as ga,
  coalesce(sum(case when c.status='FINISHED' and ((c.home_name=t.team_name and c.home_goals>c.away_goals) or (c.away_name=t.team_name and c.away_goals>c.home_goals)) then 3 when c.status='FINISHED' and c.home_goals=c.away_goals and (c.home_name=t.team_name or c.away_name=t.team_name) then 1 else 0 end),0) as points
from teams t
left join canon_match c on c.season_id=t.season_id and (c.home_name=t.team_name or c.away_name=t.team_name)
where t.league_id = (select id from public.league where slug='liga-1')
group by t.season_id, t.team_name;

-- 8) standings_live table
create table if not exists public.standings_live (
  season_id uuid not null,
  team_name text not null,
  points int not null,
  played int not null,
  wins int not null,
  draws int not null,
  losses int not null,
  gf int not null,
  ga int not null,
  updated_at timestamptz default now(),
  primary key (season_id, team_name)
);

-- Enable RLS
alter table public.league enable row level security;
alter table public.season enable row level security;
alter table public.round enable row level security;
alter table public.tiebreak_rule enable row level security;
alter table public.derby enable row level security;
alter table public.standings_live enable row level security;

-- Create policies only if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='league' AND policyname='league_public_read'
  ) THEN
    CREATE POLICY league_public_read ON public.league FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='league' AND policyname='league_admin_write'
  ) THEN
    CREATE POLICY league_admin_write ON public.league FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='season' AND policyname='season_public_read'
  ) THEN
    CREATE POLICY season_public_read ON public.season FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='season' AND policyname='season_admin_write'
  ) THEN
    CREATE POLICY season_admin_write ON public.season FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='round' AND policyname='round_public_read'
  ) THEN
    CREATE POLICY round_public_read ON public.round FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='round' AND policyname='round_admin_write'
  ) THEN
    CREATE POLICY round_admin_write ON public.round FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tiebreak_rule' AND policyname='tiebreak_public_read'
  ) THEN
    CREATE POLICY tiebreak_public_read ON public.tiebreak_rule FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tiebreak_rule' AND policyname='tiebreak_admin_write'
  ) THEN
    CREATE POLICY tiebreak_admin_write ON public.tiebreak_rule FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='derby' AND policyname='derby_public_read'
  ) THEN
    CREATE POLICY derby_public_read ON public.derby FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='derby' AND policyname='derby_admin_write'
  ) THEN
    CREATE POLICY derby_admin_write ON public.derby FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='standings_live' AND policyname='standings_live_public_read'
  ) THEN
    CREATE POLICY standings_live_public_read ON public.standings_live FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='standings_live' AND policyname='standings_live_admin_write'
  ) THEN
    CREATE POLICY standings_live_admin_write ON public.standings_live FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END$$;