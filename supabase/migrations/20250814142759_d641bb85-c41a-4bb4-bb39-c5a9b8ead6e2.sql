-- Add RLS policy to secure the materialized view
ALTER MATERIALIZED VIEW public.popular_countdowns_mv OWNER TO postgres;

-- Create RLS policy for the materialized view (comment it out so it's not accessible via API)
COMMENT ON MATERIALIZED VIEW public.popular_countdowns_mv IS 'Internal view for popular countdowns - not accessible via API';

-- Ensure it's not publicly accessible
REVOKE ALL ON public.popular_countdowns_mv FROM public;
REVOKE ALL ON public.popular_countdowns_mv FROM anon;
REVOKE ALL ON public.popular_countdowns_mv FROM authenticated;

-- Grant access only to specific roles
GRANT SELECT ON public.popular_countdowns_mv TO service_role;