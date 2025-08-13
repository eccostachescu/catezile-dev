-- Fix security linter warning - Set search_path for security function
CREATE OR REPLACE FUNCTION public.can_access_profile(profile_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
    SELECT 
        auth.uid() = profile_id OR 
        public.is_admin()
$$;