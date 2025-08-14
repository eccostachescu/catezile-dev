-- Add some sample clicks for testing popular logic
INSERT INTO public.click (entity_id, kind, created_at, ip, user_agent) 
SELECT 
  id as entity_id,
  'reminder_set' as kind,
  now() - (random() * interval '3 days') as created_at,
  '127.0.0.1'::inet as ip,
  'Mozilla/5.0 Test' as user_agent
FROM public.event 
WHERE starts_at > now() - interval '1 year'
LIMIT 5;

-- Add some card clicks
INSERT INTO public.click (entity_id, kind, created_at, ip, user_agent)
SELECT 
  id as entity_id,
  'card_click' as kind,
  now() - (random() * interval '2 days') as created_at,
  '127.0.0.1'::inet as ip,
  'Mozilla/5.0 Test' as user_agent
FROM public.event 
WHERE starts_at > now() - interval '1 year'
LIMIT 8;

-- Add some share clicks  
INSERT INTO public.click (entity_id, kind, created_at, ip, user_agent)
SELECT 
  id as entity_id,
  'share_click' as kind,
  now() - (random() * interval '1 day') as created_at,
  '127.0.0.1'::inet as ip,
  'Mozilla/5.0 Test' as user_agent
FROM public.event 
WHERE starts_at > now() - interval '1 year'
LIMIT 3;

-- Mark some events as featured for editorial fallback
UPDATE public.event 
SET featured = true 
WHERE id IN (
  SELECT id FROM public.event 
  ORDER BY starts_at DESC 
  LIMIT 6
);

-- Refresh the materialized view to update popular rankings
SELECT public.refresh_popular_countdowns();