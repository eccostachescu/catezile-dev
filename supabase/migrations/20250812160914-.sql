-- 0016_reminders.sql
-- Adapt existing reminder table and add queue/log + ical token

-- 1) Extend reminder table
ALTER TABLE public.reminder
  ADD COLUMN IF NOT EXISTS offset_hours SMALLINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','PAUSED','CANCELLED')),
  ADD COLUMN IF NOT EXISTS next_fire_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Ensure updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = '_reminder_updated_at'
  ) THEN
    CREATE TRIGGER _reminder_updated_at BEFORE UPDATE ON public.reminder
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- Idempotency unique index (expression index for coalesce)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_reminder_user_entity_offset
  ON public.reminder (user_id, entity_type, entity_id, offset_days, COALESCE(offset_hours,0));

-- 2) Queue table
CREATE TABLE IF NOT EXISTS public.reminder_queue (
  id BIGSERIAL PRIMARY KEY,
  reminder_id UUID NOT NULL REFERENCES public.reminder(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  fire_at TIMESTAMPTZ NOT NULL,
  kind TEXT NOT NULL,
  entity_id UUID NOT NULL,
  tries SMALLINT NOT NULL DEFAULT 0,
  last_error TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','SENT','FAILED','CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_queue_fire_at ON public.reminder_queue(fire_at, status);

-- 3) Log table
CREATE TABLE IF NOT EXISTS public.reminder_log (
  id BIGSERIAL PRIMARY KEY,
  reminder_id UUID,
  user_id UUID,
  sent_at TIMESTAMPTZ DEFAULT now(),
  provider_id TEXT,
  subject TEXT,
  outcome TEXT,
  meta JSONB DEFAULT '{}'::jsonb
);

-- 4) iCal token on profile
ALTER TABLE public.profile ADD COLUMN IF NOT EXISTS ical_token UUID;
UPDATE public.profile SET ical_token = gen_random_uuid() WHERE ical_token IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_profile_ical_token ON public.profile(ical_token);

-- 5) RLS
ALTER TABLE public.reminder_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_log ENABLE ROW LEVEL SECURITY;

-- Deny all direct access to queue and log
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reminder_queue'
  ) THEN
    CREATE POLICY "no direct access queue" ON public.reminder_queue FOR ALL USING (false) WITH CHECK (false);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reminder_log'
  ) THEN
    CREATE POLICY "no direct access log" ON public.reminder_log FOR ALL USING (false) WITH CHECK (false);
  END IF;
END $$;

-- Optional: tighten reminder policies if needed (skip if existing 'owner reminder' already present)
