-- Fix security definer views by removing SECURITY DEFINER property
-- This prevents privilege escalation issues

-- Drop existing materialized view if it exists
DROP MATERIALIZED VIEW IF EXISTS public.popular_countdowns_mv CASCADE;

-- Recreate materialized view without SECURITY DEFINER
CREATE MATERIALIZED VIEW public.popular_countdowns_mv AS
SELECT 
  e.id,
  e.slug,
  e.title,
  e.start_at as starts_at,
  e.image_url,
  e.city,
  e.country,
  c.id as category_id,
  c.name as category_name,
  c.slug as category_slug,
  COALESCE(ps.score, 0) as score,
  CASE 
    WHEN e.start_at > now() THEN 'FUTURE'
    WHEN e.start_at <= now() AND e.end_at > now() THEN 'LIVE'
    ELSE 'PAST'
  END as time_status
FROM public.event e
LEFT JOIN public.category c ON e.category_id = c.id
LEFT JOIN public.popular_signals ps ON e.id = ps.event_id
WHERE e.status = 'PUBLISHED'
ORDER BY COALESCE(ps.score, 0) DESC, e.start_at ASC;

-- Create unique index for CONCURRENTLY refresh
CREATE UNIQUE INDEX popular_countdowns_mv_id_idx ON public.popular_countdowns_mv (id);

-- Fix function search paths for security
-- Update functions to have explicit search_path settings

-- Fix function with mutable search path
CREATE OR REPLACE FUNCTION public.refresh_popular_countdowns()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.popular_countdowns_mv;
$function$;

-- Revoke public access to materialized view to prevent API exposure
REVOKE ALL ON public.popular_countdowns_mv FROM public;
REVOKE ALL ON public.popular_countdowns_mv FROM anon;
REVOKE ALL ON public.popular_countdowns_mv FROM authenticated;

-- Grant only necessary permissions to specific roles
GRANT SELECT ON public.popular_countdowns_mv TO authenticated;

-- Ensure RLS is enabled on all critical tables
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriber ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow ENABLE ROW LEVEL SECURITY;

-- Add security headers policy if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'popular_countdowns_mv'
  ) THEN
    -- Create RLS policy for materialized view access
    ALTER TABLE public.popular_countdowns_mv ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "public_read_popular_countdowns" ON public.popular_countdowns_mv
    FOR SELECT USING (true);
  END IF;
END $$;