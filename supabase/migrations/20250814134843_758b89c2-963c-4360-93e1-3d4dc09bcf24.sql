-- Fix all views to use SECURITY INVOKER instead of SECURITY DEFINER
-- This prevents privilege escalation vulnerabilities

-- Drop and recreate popular_signals view with SECURITY INVOKER
DROP VIEW IF EXISTS public.popular_signals CASCADE;
CREATE VIEW public.popular_signals
WITH (security_invoker=on)
AS
SELECT e.id AS event_id,
    sum(((
        CASE
            WHEN (c.kind = 'reminder_set'::text) THEN 4
            WHEN (c.kind = ANY (ARRAY['card_click'::text, 'hero_click'::text])) THEN 2
            WHEN (c.kind = 'share_click'::text) THEN 3
            WHEN (c.kind = 'affiliate_click'::text) THEN 2
            ELSE 1
        END)::numeric * exp(((- (EXTRACT(epoch FROM (now() - c.created_at)) / 3600.0)) / 72.0)))) AS score
   FROM (event e
     JOIN click c ON ((c.entity_id = e.id)))
  WHERE (c.created_at > (now() - '7 days'::interval))
  GROUP BY e.id;

-- Drop and recreate profile_public view with SECURITY INVOKER
DROP VIEW IF EXISTS public.profile_public CASCADE;
CREATE VIEW public.profile_public
WITH (security_invoker=on)
AS
SELECT id,
    display_name,
    handle,
    avatar_url,
    created_at
   FROM profile;

-- Drop and recreate standings_regular view with SECURITY INVOKER
DROP VIEW IF EXISTS public.standings_regular CASCADE;
CREATE VIEW public.standings_regular
WITH (security_invoker=on)
AS
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

-- Drop and recreate static_pages view with SECURITY INVOKER
DROP VIEW IF EXISTS public.static_pages CASCADE;
CREATE VIEW public.static_pages
WITH (security_invoker=on)
AS
SELECT '/legal/terms'::text AS url
UNION ALL
 SELECT '/legal/privacy'::text AS url
UNION ALL
 SELECT '/legal/cookies'::text AS url
UNION ALL
 SELECT '/contact'::text AS url;

-- Drop and recreate ugc_queue view with SECURITY INVOKER
DROP VIEW IF EXISTS public.ugc_queue CASCADE;
CREATE VIEW public.ugc_queue
WITH (security_invoker=on)
AS
SELECT id,
    'countdown'::text AS kind,
    title,
    target_at AS date_at,
    owner_id,
    status,
    created_at
   FROM countdown
  WHERE (status = 'PENDING'::text);