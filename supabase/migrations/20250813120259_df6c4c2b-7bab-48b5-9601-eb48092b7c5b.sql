-- 0031_security.sql - Comprehensive security infrastructure for CateZile.ro (Fixed)

-- IP Blocklist table
CREATE TABLE public.ip_blocklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip inet NOT NULL,
  reason text NOT NULL,
  until timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profile(id)
);

-- IP Allowlist table  
CREATE TABLE public.ip_allowlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip inet NOT NULL,
  note text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profile(id)
);

-- Rate limiting table
CREATE TABLE public.rate_limit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text NOT NULL,
  ip_hash text NOT NULL,
  window_start timestamp with time zone NOT NULL,
  request_count integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Security events audit log
CREATE TABLE public.security_event (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  occurred_at timestamp with time zone DEFAULT now(),
  ip_hash text NOT NULL,
  route text NOT NULL,
  user_agent text,
  kind text NOT NULL,
  meta jsonb DEFAULT '{}',
  user_id uuid REFERENCES public.profile(id)
);

-- Create performance indexes (fixed - removed function predicates)
CREATE INDEX idx_rate_limit_route_window ON public.rate_limit(route, window_start DESC);
CREATE INDEX idx_rate_limit_window ON public.rate_limit(window_start);
CREATE INDEX idx_security_event_kind ON public.security_event(kind);
CREATE INDEX idx_security_event_time ON public.security_event(occurred_at DESC);
CREATE INDEX idx_ip_blocklist_until ON public.ip_blocklist(until);

-- Enable RLS on all security tables
ALTER TABLE public.ip_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_event ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only access
CREATE POLICY "admin_only_ip_blocklist" ON public.ip_blocklist FOR ALL USING (is_admin());
CREATE POLICY "admin_only_ip_allowlist" ON public.ip_allowlist FOR ALL USING (is_admin());
CREATE POLICY "admin_only_rate_limit" ON public.rate_limit FOR ALL USING (is_admin());
CREATE POLICY "admin_only_security_event" ON public.security_event FOR ALL USING (is_admin());

-- RPC function for rate limit counting
CREATE OR REPLACE FUNCTION public.count_rate_limit(
  route_in text,
  ip_hash_in text,
  since_in timestamp with time zone
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(SUM(request_count), 0)::integer
  FROM public.rate_limit
  WHERE route = route_in 
    AND ip_hash = ip_hash_in 
    AND window_start >= since_in;
$$;

-- Function to clean up old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  DELETE FROM public.rate_limit 
  WHERE window_start < now() - interval '1 hour';
$$;

-- Function to check if IP is blocked
CREATE OR REPLACE FUNCTION public.is_ip_blocked(ip_address inet)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ip_blocklist 
    WHERE ip = ip_address AND until > now()
  );
$$;

-- Function to check if IP is allowlisted
CREATE OR REPLACE FUNCTION public.is_ip_allowlisted(ip_address inet)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ip_allowlist 
    WHERE ip = ip_address
  );
$$;