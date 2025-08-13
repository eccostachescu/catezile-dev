-- Ensure required extensions
create extension if not exists citext;
create extension if not exists pg_trgm;

-- TEAM table
create table if not exists public.team (
  id uuid primary key default gen_random_uuid(),
  slug citext unique not null,
  name text not null,
  short_name text,
  city text,
  country text default 'RO',
  founded_year smallint,
  colors jsonb default '{}'::jsonb,
  stadium text,
  website text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trgm index on team.name
create index if not exists idx_team_name_trgm on public.team using gin (name gin_trgm_ops);

-- Enable RLS and public read on team
alter table public.team enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team' AND policyname = 'team_read'
  ) THEN
    CREATE POLICY "team_read" ON public.team FOR SELECT USING (true);
  END IF;
END$$;

-- team_alias: add team_id for mapping alias -> team_id, keep existing cols if any
ALTER TABLE public.team_alias
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.team(id) ON DELETE CASCADE;

-- Ensure alias is unique (citext)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'team_alias' AND indexname = 'team_alias_alias_key'
  ) THEN
    BEGIN
      ALTER TABLE public.team_alias ADD CONSTRAINT team_alias_alias_key UNIQUE (alias);
    EXCEPTION WHEN duplicate_table THEN
      -- ignore if already exists in another form
      NULL;
    END;
  END IF;
END$$;

-- Enable RLS and public read on team_alias (if not already)
alter table public.team_alias enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_alias' AND policyname = 'team_alias_read'
  ) THEN
    CREATE POLICY "team_alias_read" ON public.team_alias FOR SELECT USING (true);
  END IF;
END$$;

-- MATCH: add home_id and away_id FKs
ALTER TABLE public.match
  ADD COLUMN IF NOT EXISTS home_id uuid REFERENCES public.team(id),
  ADD COLUMN IF NOT EXISTS away_id uuid REFERENCES public.team(id);

-- Optional helpful indexes
CREATE INDEX IF NOT EXISTS idx_match_home_id ON public.match (home_id);
CREATE INDEX IF NOT EXISTS idx_match_away_id ON public.match (away_id);

-- DERBY: prepare for team_id linking without breaking existing data
ALTER TABLE public.derby
  ADD COLUMN IF NOT EXISTS team_a_id uuid REFERENCES public.team(id),
  ADD COLUMN IF NOT EXISTS team_b_id uuid REFERENCES public.team(id);

-- Updated_at trigger for team
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_team_updated_at'
  ) THEN
    CREATE TRIGGER trg_team_updated_at
    BEFORE UPDATE ON public.team
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;