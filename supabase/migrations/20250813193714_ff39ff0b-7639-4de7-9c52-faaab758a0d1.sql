-- Check for any existing views with security definer and drop them
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Find and drop any views that might have security definer set
    FOR r IN SELECT schemaname, viewname FROM pg_views WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.schemaname) || '.' || quote_ident(r.viewname) || ' CASCADE';
    END LOOP;
END $$;

-- Recreate necessary views without security definer
CREATE VIEW public.profile_public AS
  SELECT id, display_name, handle, avatar_url, created_at
  FROM public.profile;

CREATE VIEW public.ugc_queue AS
  SELECT id, 'countdown'::text AS kind, title, target_at AS date_at, owner_id, status, created_at
  FROM countdown
  WHERE status = 'PENDING';

CREATE VIEW public.static_pages AS
  SELECT '/legal/terms'::text AS url
  UNION ALL
  SELECT '/legal/privacy'::text AS url
  UNION ALL
  SELECT '/legal/cookies'::text AS url
  UNION ALL
  SELECT '/contact'::text AS url;

CREATE VIEW public.standings_regular AS
  WITH canon_match AS (
    SELECT m.season_id,
           m.league_id,
           m.home AS home_name,
           m.away AS away_name,
           COALESCE(((m.score ->> 'home'::text))::integer, NULL::integer) AS home_goals,
           COALESCE(((m.score ->> 'away'::text))::integer, NULL::integer) AS away_goals,
           m.status
    FROM match m
    WHERE ((m.season_id IS NOT NULL) AND (m.league_id = ( SELECT league.id
             FROM league
            WHERE (league.slug = 'liga-1'::text))))
  ), teams AS (
    SELECT canon_match.season_id,
           canon_match.league_id,
           canon_match.home_name AS team_name
    FROM canon_match
    UNION
    SELECT canon_match.season_id,
           canon_match.league_id,
           canon_match.away_name AS team_name
    FROM canon_match
  )
  SELECT t.season_id,
         t.team_name,
         COALESCE(sum(
             CASE
                 WHEN ((c.status = 'FINISHED'::text) AND ((c.home_name = t.team_name) OR (c.away_name = t.team_name))) THEN 1
                 ELSE 0
             END), (0)::bigint) AS played,
         COALESCE(sum(
             CASE
                 WHEN ((c.status = 'FINISHED'::text) AND (((c.home_name = t.team_name) AND (c.home_goals > c.away_goals)) OR ((c.away_name = t.team_name) AND (c.away_goals > c.home_goals)))) THEN 1
                 ELSE 0
             END), (0)::bigint) AS wins,
         COALESCE(sum(
             CASE
                 WHEN ((c.status = 'FINISHED'::text) AND (c.home_goals = c.away_goals) AND ((c.home_name = t.team_name) OR (c.away_name = t.team_name))) THEN 1
                 ELSE 0
             END), (0)::bigint) AS draws,
         COALESCE(sum(
             CASE
                 WHEN ((c.status = 'FINISHED'::text) AND (((c.home_name = t.team_name) AND (c.home_goals < c.away_goals)) OR ((c.away_name = t.team_name) AND (c.away_goals < c.home_goals)))) THEN 1
                 ELSE 0
             END), (0)::bigint) AS losses,
         COALESCE(sum(
             CASE
                 WHEN ((c.status = 'FINISHED'::text) AND (c.home_name = t.team_name)) THEN c.home_goals
                 WHEN ((c.status = 'FINISHED'::text) AND (c.away_name = t.team_name)) THEN c.away_goals
                 ELSE 0
             END), (0)::bigint) AS gf,
         COALESCE(sum(
             CASE
                 WHEN ((c.status = 'FINISHED'::text) AND (c.home_name = t.team_name)) THEN c.away_goals
                 WHEN ((c.status = 'FINISHED'::text) AND (c.away_name = t.team_name)) THEN c.home_goals
                 ELSE 0
             END), (0)::bigint) AS ga,
         COALESCE(sum(
             CASE
                 WHEN ((c.status = 'FINISHED'::text) AND (((c.home_name = t.team_name) AND (c.home_goals > c.away_goals)) OR ((c.away_name = t.team_name) AND (c.away_goals > c.home_goals)))) THEN 3
                 WHEN ((c.status = 'FINISHED'::text) AND (c.home_goals = c.away_goals) AND ((c.home_name = t.team_name) OR (c.away_name = t.team_name))) THEN 1
                 ELSE 0
             END), (0)::bigint) AS points
  FROM (teams t
        LEFT JOIN canon_match c ON (((c.season_id = t.season_id) AND ((c.home_name = t.team_name) OR (c.away_name = t.team_name)))))
  WHERE (t.league_id = ( SELECT league.id
                        FROM league
                       WHERE (league.slug = 'liga-1'::text)))
  GROUP BY t.season_id, t.team_name;

-- Grant appropriate permissions
GRANT SELECT ON public.profile_public TO anon, authenticated;
GRANT SELECT ON public.ugc_queue TO authenticated;
GRANT SELECT ON public.static_pages TO anon, authenticated;
GRANT SELECT ON public.standings_regular TO anon, authenticated;