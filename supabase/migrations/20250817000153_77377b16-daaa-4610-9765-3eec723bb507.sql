-- Fix the security definer view issue by explicitly setting security_invoker=on
-- for the v_tv_episodes_upcoming view

-- Drop and recreate the view with SECURITY INVOKER
DROP VIEW IF EXISTS public.v_tv_episodes_upcoming;

CREATE VIEW public.v_tv_episodes_upcoming 
WITH (security_invoker=on) AS
SELECT te.id,
    te.tvmaze_episode_id,
    te.tvmaze_show_id,
    te.season,
    te.number,
    te.name,
    te.airdate,
    te.airtime,
    te.airstamp,
    te.runtime,
    te.summary,
    te.image,
    te.network_name,
    te.created_at,
    te.updated_at,
    ts.name AS show_name,
    ts.genres AS show_genres,
    sm.image_url AS show_image_url,
    sm.slug AS show_slug
FROM ((tv_episode te
     LEFT JOIN tv_show ts ON ((te.tvmaze_show_id = ts.tvmaze_id)))
     LEFT JOIN show_mapping sm ON ((ts.id = sm.tv_show_id)))
WHERE ((te.airdate IS NOT NULL) AND (te.airdate >= CURRENT_DATE) AND (te.airdate <= (CURRENT_DATE + '30 days'::interval)));