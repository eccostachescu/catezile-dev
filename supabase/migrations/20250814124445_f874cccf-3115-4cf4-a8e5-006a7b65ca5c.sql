-- Fix materialized view security issues
-- Drop existing materialized view to recreate without SECURITY DEFINER
DROP MATERIALIZED VIEW IF EXISTS public.popular_countdowns_mv CASCADE;

-- Recreate materialized view without SECURITY DEFINER property
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

-- Fix function with explicit search_path
CREATE OR REPLACE FUNCTION public.refresh_popular_countdowns()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.popular_countdowns_mv;
$function$;

-- Revoke unnecessary permissions from materialized view
REVOKE ALL ON public.popular_countdowns_mv FROM public;
REVOKE ALL ON public.popular_countdowns_mv FROM anon;

-- Grant only necessary SELECT permissions
GRANT SELECT ON public.popular_countdowns_mv TO authenticated;
GRANT SELECT ON public.popular_countdowns_mv TO anon;