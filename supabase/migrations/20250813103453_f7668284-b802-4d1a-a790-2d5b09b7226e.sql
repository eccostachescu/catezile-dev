-- Deploy & Cache Orchestration System

-- 1) Extend settings table with deployment fields
ALTER TABLE public.settings 
  ADD COLUMN IF NOT EXISTS cache_version integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_build_at timestamptz,
  ADD COLUMN IF NOT EXISTS build_status text,
  ADD COLUMN IF NOT EXISTS build_reason text,
  ADD COLUMN IF NOT EXISTS build_locked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS build_min_interval_min integer DEFAULT 10;

-- 2) Deployment log table
CREATE TABLE IF NOT EXISTS public.deployment_log (
  id bigserial PRIMARY KEY,
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'STARTED' 
    CHECK (status IN ('STARTED','SUCCESS','FAILED','SKIPPED')),
  reason text,
  actor text, -- 'auto' | 'admin:<email>' | function name
  build_id text, -- vercel/github run id
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 3) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deploy_started ON public.deployment_log(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_deploy_status ON public.deployment_log(status, started_at DESC);

-- 4) Health check log table
CREATE TABLE IF NOT EXISTS public.health_check_log (
  id bigserial PRIMARY KEY,
  checked_at timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('green','yellow','red')),
  checks jsonb DEFAULT '[]'::jsonb,
  response_time_ms integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_checked ON public.health_check_log(checked_at DESC);

-- 5) RLS policies for deployment tables
ALTER TABLE public.deployment_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_check_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_deployment_log" ON public.deployment_log
  FOR SELECT USING (is_admin());

CREATE POLICY "admin_write_deployment_log" ON public.deployment_log  
  FOR ALL USING (is_admin());

CREATE POLICY "admin_read_health_log" ON public.health_check_log
  FOR SELECT USING (is_admin());

CREATE POLICY "admin_write_health_log" ON public.health_check_log
  FOR ALL USING (is_admin());

-- 6) Initialize default settings if not exists
INSERT INTO public.settings (key, value) 
VALUES ('deployment', jsonb_build_object(
  'cache_version', 1,
  'build_min_interval_min', 10,
  'build_locked', false
))
ON CONFLICT (key) DO NOTHING;