-- Popular Countdowns System
-- Creates materialized view for popular events with scoring and decay

-- View sursă (agregă evenimente ultimele 7 zile cu scoring și decay)
CREATE OR REPLACE VIEW public.popular_signals AS
SELECT 
  e.id as event_id,
  COALESCE(
    SUM(
      CASE 
        WHEN c.kind = 'reminder_set' THEN 4
        WHEN c.kind IN ('card_click', 'hero_click') THEN 2
        WHEN c.kind = 'share_click' THEN 3
        WHEN c.kind = 'affiliate_click' THEN 2
        ELSE 1 
      END * 
      EXP(-(EXTRACT(EPOCH FROM NOW() - c.created_at) / 3600.0) / 72.0)
    ), 0
  ) as score
FROM public.event e
LEFT JOIN public.click c ON c.entity_id = e.id
WHERE c.created_at > NOW() - INTERVAL '7 days'
  AND e.starts_at > NOW() - INTERVAL '1 year'
GROUP BY e.id;

-- Materialized view pentru popular countdowns (cache optimizat)
DROP MATERIALIZED VIEW IF EXISTS public.popular_countdowns_mv;
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
  cat.name as category_name,
  cat.slug as category_slug,
  COALESCE(ps.score, 0) as score,
  CASE 
    WHEN e.starts_at <= NOW() THEN 'PAST'
    WHEN e.starts_at <= NOW() + INTERVAL '7 days' THEN 'UPCOMING'
    ELSE 'FUTURE'
  END as time_status
FROM public.event e
LEFT JOIN public.popular_signals ps ON ps.event_id = e.id
LEFT JOIN public.category cat ON cat.id = e.category_id
WHERE e.status = 'PUBLISHED'
  AND e.starts_at > NOW() - INTERVAL '30 days'
ORDER BY 
  COALESCE(ps.score, 0) DESC,
  e.starts_at ASC;

-- Indexes pentru performanță
CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_mv_id ON public.popular_countdowns_mv(id);
CREATE INDEX IF NOT EXISTS idx_popular_mv_score ON public.popular_countdowns_mv(score DESC);
CREATE INDEX IF NOT EXISTS idx_popular_mv_time_status ON public.popular_countdowns_mv(time_status);
CREATE INDEX IF NOT EXISTS idx_popular_mv_category ON public.popular_countdowns_mv(category_id);

-- Funcție refresh pentru materialized view
CREATE OR REPLACE FUNCTION public.refresh_popular_countdowns()
RETURNS void 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.popular_countdowns_mv;
$$;

-- Adaugă featured flag pentru fallback editorial
ALTER TABLE public.event 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Index pentru featured events
CREATE INDEX IF NOT EXISTS idx_event_featured ON public.event(featured) WHERE featured = true;