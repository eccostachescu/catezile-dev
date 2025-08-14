-- Add the missing valid click kinds to the constraint
ALTER TABLE public.click 
DROP CONSTRAINT click_kind_check;

ALTER TABLE public.click 
ADD CONSTRAINT click_kind_check 
CHECK (kind IN (
  'popular_view', 
  'popular_card_click', 
  'hero_click', 
  'affiliate_click', 
  'widget_embed_view',
  'reminder_set',
  'card_click', 
  'share_click',
  'page_view'
));

-- Now insert the test data with valid kinds
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