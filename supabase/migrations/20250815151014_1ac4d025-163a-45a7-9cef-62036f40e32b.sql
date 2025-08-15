-- Drop the materialized view since we can't apply RLS to it
DROP MATERIALIZED VIEW IF EXISTS popular_countdowns_mv;

-- Create a function that returns the same data but can be secured properly
CREATE OR REPLACE FUNCTION get_popular_countdowns(
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  image_credit TEXT,
  city TEXT,
  country TEXT,
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  score NUMERIC,
  time_status TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
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
    AND e.start_at > NOW() - INTERVAL '30 days'
  ORDER BY COALESCE(ps.score, 0) DESC, e.start_at ASC
  LIMIT limit_count
  OFFSET offset_count;
$$;