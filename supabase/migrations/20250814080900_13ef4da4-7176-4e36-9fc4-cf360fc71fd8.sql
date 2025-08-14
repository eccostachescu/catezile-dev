-- Fix events with missing starts_at dates
UPDATE public.event 
SET starts_at = start_at 
WHERE starts_at IS NULL AND start_at IS NOT NULL;

-- For events without any date, set them to future dates for testing
UPDATE public.event 
SET starts_at = CASE 
  WHEN title LIKE '%Revelion%' THEN '2025-01-01 00:00:00+02'::timestamptz
  WHEN title LIKE '%Națională%' THEN '2025-12-01 00:00:00+02'::timestamptz  
  WHEN title LIKE '%Moș Nicolae%' THEN '2025-12-06 00:00:00+02'::timestamptz
  WHEN title LIKE '%Dragobete%' THEN '2025-02-24 00:00:00+02'::timestamptz
  WHEN title LIKE '%Sfântul Andrei%' THEN '2025-11-30 00:00:00+02'::timestamptz
  ELSE now() + (random() * interval '365 days')
END
WHERE starts_at IS NULL;

-- Recreate some test clicks now that we have valid event dates
DELETE FROM public.click;

INSERT INTO public.click (entity_id, kind, created_at, ip, user_agent) 
SELECT 
  id as entity_id,
  (ARRAY['reminder_set', 'card_click', 'share_click', 'page_view'])[1 + floor(random() * 4)] as kind,
  now() - (random() * interval '7 days') as created_at,
  '127.0.0.1'::inet as ip,
  'Mozilla/5.0 Test' as user_agent
FROM public.event 
WHERE starts_at > now()
ORDER BY random()
LIMIT 20;

-- Refresh the materialized view
SELECT public.refresh_popular_countdowns();