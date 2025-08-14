-- Drop and recreate the entire structure
DROP MATERIALIZED VIEW IF EXISTS public.popular_countdowns_mv CASCADE;
DROP VIEW IF EXISTS public.popular_signals CASCADE;

-- Recreate the corrected popular_signals view
CREATE OR REPLACE VIEW public.popular_signals AS
SELECT 
  e.id as event_id,
  SUM(
    CASE 
      WHEN c.kind='reminder_set' THEN 4
      WHEN c.kind IN ('card_click','hero_click') THEN 2
      WHEN c.kind='share_click' THEN 3
      WHEN c.kind='affiliate_click' THEN 2
      ELSE 1 
    END * exp(-(extract(epoch from now()-c.created_at)/3600.0)/72.0)
  ) as score
FROM public.event e
JOIN public.click c ON c.entity_id = e.id
WHERE c.created_at > now() - interval '7 days'
GROUP BY e.id;

-- Recreate the materialized view
CREATE MATERIALIZED VIEW public.popular_countdowns_mv AS
SELECT 
  e.id, 
  e.slug, 
  e.title, 
  e.starts_at, 
  e.image_url, 
  e.city,
  e.country,
  e.category_id,
  c.name as category_name,
  c.slug as category_slug,
  CASE 
    WHEN e.starts_at > now() + interval '1 day' THEN 'UPCOMING'
    WHEN e.starts_at > now() - interval '1 day' THEN 'TODAY'
    ELSE 'PAST'
  END as time_status,
  COALESCE(ps.score, 0) as score
FROM public.event e 
LEFT JOIN public.popular_signals ps ON ps.event_id = e.id
LEFT JOIN public.category c ON c.id = e.category_id
WHERE e.starts_at > now() - interval '1 year'
ORDER BY COALESCE(ps.score, 0) DESC;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_popular_mv_id ON public.popular_countdowns_mv(id);
CREATE INDEX IF NOT EXISTS idx_popular_mv_score ON public.popular_countdowns_mv(score DESC);
CREATE INDEX IF NOT EXISTS idx_popular_mv_time_status ON public.popular_countdowns_mv(time_status);
CREATE INDEX IF NOT EXISTS idx_popular_mv_category_id ON public.popular_countdowns_mv(category_id);