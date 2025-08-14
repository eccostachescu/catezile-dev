-- Create edge function for live events
CREATE OR REPLACE FUNCTION public.get_live_events()
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  starts_at timestamp with time zone,
  status text,
  home text,
  away text,
  score jsonb,
  tv_channels text[],
  competition_name text,
  is_live boolean
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    m.id,
    COALESCE(m.home || ' - ' || m.away, 'Meci Live') as title,
    m.slug,
    m.kickoff_at as starts_at,
    m.status,
    m.home,
    m.away,
    m.score,
    m.tv_channels,
    c.name as competition_name,
    (m.status IN ('1H', '2H', 'HT', 'ET', 'LIVE')) as is_live
  FROM match m
  LEFT JOIN competition c ON c.id = m.competition_id
  WHERE m.status IN ('1H', '2H', 'HT', 'ET', 'LIVE', 'SCHEDULED')
    AND m.kickoff_at >= NOW() - INTERVAL '3 hours'
    AND m.kickoff_at <= NOW() + INTERVAL '3 hours'
  ORDER BY 
    CASE WHEN m.status IN ('1H', '2H', 'HT', 'ET', 'LIVE') THEN 1 ELSE 2 END,
    m.kickoff_at ASC
  LIMIT 12;
$$;