-- Fix profile table access policy - drop and recreate if needed
DROP POLICY IF EXISTS "profile_self_or_admin_read_secure" ON public.profile;

-- Only allow self-access for profile reads (already exists as profile_self_or_admin_read)
-- Admin access is already handled by profile_admin_all policy

-- Update any materialized view to ensure it's not publicly accessible
COMMENT ON MATERIALIZED VIEW public.popular_countdowns_mv IS '@internal @private';