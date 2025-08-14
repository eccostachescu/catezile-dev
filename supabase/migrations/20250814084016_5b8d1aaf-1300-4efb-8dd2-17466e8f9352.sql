-- Fix the popular_signals view to use the click table instead of metrics
DROP VIEW IF EXISTS public.popular_signals;

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

-- Refresh the materialized view
SELECT public.refresh_popular_countdowns();