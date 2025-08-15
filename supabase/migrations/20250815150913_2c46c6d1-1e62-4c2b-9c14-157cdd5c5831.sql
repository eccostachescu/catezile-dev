-- Recreate the popular_countdowns_mv to include image_credit column for better filtering
DROP MATERIALIZED VIEW IF EXISTS popular_countdowns_mv;

CREATE MATERIALIZED VIEW popular_countdowns_mv AS
SELECT 
  e.id,
  e.slug, 
  e.title,
  e.start_at as starts_at,
  e.image_url,
  e.image_credit,
  e.city,
  e.country,
  e.category_id,
  c.name as category_name,
  c.slug as category_slug,
  COALESCE(ps.score, 0) as score,
  CASE 
    WHEN e.start_at <= NOW() + INTERVAL '7 days' THEN 'UPCOMING'
    ELSE 'FUTURE'
  END as time_status
FROM event e
LEFT JOIN category c ON e.category_id = c.id  
LEFT JOIN popular_signals ps ON e.id = ps.event_id
WHERE e.status = 'PUBLISHED'
  AND e.start_at > NOW() - INTERVAL '30 days';

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX popular_countdowns_mv_id_idx ON popular_countdowns_mv (id);

-- Refresh the materialized view with data
REFRESH MATERIALIZED VIEW popular_countdowns_mv;