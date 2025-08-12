-- 0023_tv_guide.sql
-- 1) Extend tv_channel
ALTER TABLE public.tv_channel 
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS owner text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS priority int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- 2) Program TV table
CREATE TABLE IF NOT EXISTS public.tv_program (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.tv_channel(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'sport' CHECK (kind IN ('sport','other')),
  source text NOT NULL DEFAULT 'derived' CHECK (source IN ('derived','xmltv','manual')),
  title text NOT NULL,
  subtitle text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  match_id uuid REFERENCES public.match(id) ON DELETE SET NULL,
  competition text,
  city text,
  status text DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED','LIVE','FINISHED','CANCELLED')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Unique key for idempotent syncs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uq_tv_program_channel_starts_title'
  ) THEN
    CREATE UNIQUE INDEX uq_tv_program_channel_starts_title ON public.tv_program(channel_id, starts_at, title);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tv_program_channel_time ON public.tv_program(channel_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_tv_program_kind_status ON public.tv_program(kind, status);

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.set_updated_at_tv_program()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tv_program_updated_at ON public.tv_program;
CREATE TRIGGER trg_tv_program_updated_at
BEFORE UPDATE ON public.tv_program
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_tv_program();

-- 3) Follow channel (do NOT FK to auth.users per project guidelines)
CREATE TABLE IF NOT EXISTS public.follow_channel (
  user_id uuid NOT NULL,
  channel_id uuid NOT NULL REFERENCES public.tv_channel(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, channel_id)
);

-- 4) RLS
ALTER TABLE public.tv_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_channel ENABLE ROW LEVEL SECURITY;

-- Public read-only tv_program
DROP POLICY IF EXISTS "tv_program_read" ON public.tv_program;
CREATE POLICY "tv_program_read" ON public.tv_program FOR SELECT USING (true);

-- No direct writes via anon/user (edge functions use service role)
DROP POLICY IF EXISTS "tv_program_no_write" ON public.tv_program;
CREATE POLICY "tv_program_no_write" ON public.tv_program FOR ALL USING (false) WITH CHECK (false);

-- Follow channel policies
DROP POLICY IF EXISTS "own follow channel" ON public.follow_channel;
CREATE POLICY "own follow channel" ON public.follow_channel FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own follow channel insert" ON public.follow_channel;
CREATE POLICY "own follow channel insert" ON public.follow_channel FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own follow channel delete" ON public.follow_channel;
CREATE POLICY "own follow channel delete" ON public.follow_channel FOR DELETE USING (auth.uid() = user_id);
