-- Insert test clicks manually to test the logic
INSERT INTO public.click (entity_id, kind, created_at, ip, user_agent) VALUES
  ((SELECT id FROM public.event WHERE title LIKE '%Dragobete%' LIMIT 1), 'reminder_set', now() - interval '1 day', '127.0.0.1', 'Test'),
  ((SELECT id FROM public.event WHERE title LIKE '%Dragobete%' LIMIT 1), 'card_click', now() - interval '2 days', '127.0.0.1', 'Test'),
  ((SELECT id FROM public.event WHERE title LIKE '%Moș Nicolae%' LIMIT 1), 'share_click', now() - interval '1 day', '127.0.0.1', 'Test'),
  ((SELECT id FROM public.event WHERE title LIKE '%Revelion%' LIMIT 1), 'page_view', now() - interval '3 days', '127.0.0.1', 'Test'),
  ((SELECT id FROM public.event WHERE title LIKE '%Națională%' LIMIT 1), 'reminder_set', now() - interval '2 days', '127.0.0.1', 'Test');

-- Refresh the materialized view  
SELECT public.refresh_popular_countdowns();