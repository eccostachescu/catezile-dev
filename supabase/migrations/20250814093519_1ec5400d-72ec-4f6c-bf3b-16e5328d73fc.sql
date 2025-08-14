-- Insert sample events for popular section seeding
-- First, ensure we have some categories
INSERT INTO public.category (name, slug) VALUES 
('Concerte', 'concerte'),
('Teatru', 'teatru'),
('Sport', 'sport'),
('Festival', 'festival'),
('Conferințe', 'conferinte')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample events for each category (future dates)
WITH categories AS (
  SELECT id, slug FROM public.category WHERE slug IN ('concerte', 'teatru', 'sport', 'festival', 'conferinte')
)
INSERT INTO public.event (
  title, 
  slug, 
  start_at, 
  category_id, 
  status, 
  description,
  city,
  country,
  timezone,
  featured
) 
SELECT 
  CASE c.slug
    WHEN 'concerte' THEN 'Concert extraordinar Inna'
    WHEN 'teatru' THEN 'Spectacol Ion Creangă'
    WHEN 'sport' THEN 'Meciul anului: România - Italia'
    WHEN 'festival' THEN 'Festival de vară București'
    WHEN 'conferinte' THEN 'Conferința Tech Romania'
  END as title,
  CASE c.slug
    WHEN 'concerte' THEN 'concert-inna-2025'
    WHEN 'teatru' THEN 'spectacol-ion-creanga-2025'
    WHEN 'sport' THEN 'romania-italia-2025'
    WHEN 'festival' THEN 'festival-vara-bucuresti-2025'
    WHEN 'conferinte' THEN 'tech-romania-2025'
  END as slug,
  now() + INTERVAL '30 days' + (random()::float * 60)::int * INTERVAL '1 day' as start_at,
  c.id as category_id,
  'PUBLISHED' as status,
  CASE c.slug
    WHEN 'concerte' THEN 'Un concert spectaculos cu Inna în București'
    WHEN 'teatru' THEN 'Spectacol de teatru clasic românesc'
    WHEN 'sport' THEN 'Meciul decisiv din preliminariile Campionatului Mondial'
    WHEN 'festival' THEN 'Cel mai mare festival de vară din România'
    WHEN 'conferinte' THEN 'Conferința anuală a industriei tech din România'
  END as description,
  'București' as city,
  'RO' as country,
  'Europe/Bucharest' as timezone,
  true as featured
FROM categories c
ON CONFLICT (slug) DO NOTHING;

-- Insert sample clicks to generate initial popularity scores
WITH sample_events AS (
  SELECT e.id, e.category_id, ROW_NUMBER() OVER (PARTITION BY e.category_id ORDER BY e.start_at) as rn
  FROM public.event e 
  JOIN public.category c ON e.category_id = c.id 
  WHERE c.slug IN ('concerte', 'teatru', 'sport', 'festival', 'conferinte')
  AND e.status = 'PUBLISHED'
  AND e.start_at > now()
)
INSERT INTO public.click (kind, entity_id, created_at, campaign, path)
SELECT 
  CASE (random() * 4)::int
    WHEN 0 THEN 'reminder_set'
    WHEN 1 THEN 'share_click' 
    WHEN 2 THEN 'page_view'
    ELSE 'card_click'
  END as kind,
  se.id as entity_id,
  now() - (random()::float * 7)::int * INTERVAL '1 day' as created_at,
  'popular_seed' as campaign,
  '/event/' || (SELECT slug FROM public.event WHERE id = se.id) as path
FROM sample_events se,
     generate_series(1, 5 + (random() * 10)::int) as clicks
WHERE se.rn = 1;

-- Refresh the materialized view to include the new data
REFRESH MATERIALIZED VIEW public.popular_countdowns_mv;