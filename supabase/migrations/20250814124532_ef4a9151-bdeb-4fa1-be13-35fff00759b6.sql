-- Remove materialized view from API access completely
-- This fixes the "Materialized View in API" warning

-- Hide materialized view from PostgREST API
COMMENT ON MATERIALIZED VIEW public.popular_countdowns_mv IS '@private';