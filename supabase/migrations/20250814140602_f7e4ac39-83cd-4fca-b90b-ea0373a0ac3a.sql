-- Create materialized view for popular countdowns
CREATE MATERIALIZED VIEW public.popular_countdowns_mv AS
SELECT 
  e.id,
  e.slug,
  e.title,
  e.start_at as starts_at,
  e.image_url,
  e.city,
  e.country,
  e.category_id,
  c.name as category_name,
  c.slug as category_slug,
  COALESCE(ps.score, 0) as score,
  CASE 
    WHEN e.start_at <= now() THEN 'PAST'
    WHEN e.start_at <= now() + interval '7 days' THEN 'UPCOMING'
    ELSE 'FUTURE'
  END as time_status
FROM public.event e
LEFT JOIN public.category c ON e.category_id = c.id
LEFT JOIN public.popular_signals ps ON ps.entity_id = e.id AND ps.entity_type = 'event'
WHERE e.status = 'PUBLISHED'

UNION ALL

SELECT 
  cd.id,
  cd.slug,
  cd.title,
  cd.target_at as starts_at,
  cd.image_url,
  null as city,
  null as country,
  null as category_id,
  'Countdown' as category_name,
  'countdown' as category_slug,
  COALESCE(ps.score, 0) as score,
  CASE 
    WHEN cd.target_at <= now() THEN 'PAST'
    WHEN cd.target_at <= now() + interval '7 days' THEN 'UPCOMING'
    ELSE 'FUTURE'
  END as time_status
FROM public.countdown cd
LEFT JOIN public.popular_signals ps ON ps.entity_id = cd.id AND ps.entity_type = 'countdown'
WHERE cd.status = 'PUBLISHED';

-- Create index for better performance
CREATE UNIQUE INDEX ON public.popular_countdowns_mv (id);
CREATE INDEX ON public.popular_countdowns_mv (score DESC, starts_at ASC);
CREATE INDEX ON public.popular_countdowns_mv (category_slug);
CREATE INDEX ON public.popular_countdowns_mv (time_status);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_popular_countdowns()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.popular_countdowns_mv;
$$;