-- More comprehensive fix for user email exposure
-- Completely lock down profile table access and create separate secure access patterns

-- First, drop all existing profile policies to start fresh
DROP POLICY IF EXISTS "profiles_no_anonymous_access" ON public.profile;
DROP POLICY IF EXISTS "profiles_own_data_select" ON public.profile;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profile;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profile;
DROP POLICY IF EXISTS "profiles_no_delete" ON public.profile;
DROP POLICY IF EXISTS "profiles_own_data_update" ON public.profile;
DROP POLICY IF EXISTS "profiles_system_insert" ON public.profile;

-- Create extremely restrictive default policy - deny everything to everyone
CREATE POLICY "profiles_deny_all_default" 
ON public.profile 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Allow authenticated users to select only their own profile data
CREATE POLICY "profiles_own_select_only" 
ON public.profile 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to update only their own profile data (excluding email and role)
CREATE POLICY "profiles_own_update_safe" 
ON public.profile 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND OLD.email = NEW.email  -- prevent email changes
  AND OLD.role = NEW.role    -- prevent role changes
);

-- Allow admins full access
CREATE POLICY "profiles_admin_full_access" 
ON public.profile 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Allow system to insert new profiles (for new user registration)
CREATE POLICY "profiles_system_insert_only" 
ON public.profile 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id OR public.is_admin());

-- Create a view for public profile data that explicitly excludes sensitive information
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  display_name,
  avatar_url,
  handle,
  created_at
FROM public.profile;

-- Ensure the view has proper RLS
ALTER VIEW public.profiles_public SET (security_barrier = true);

-- Grant access to the public view
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Update the existing secure function to be even more explicit
CREATE OR REPLACE FUNCTION public.get_safe_profile(profile_id uuid)
RETURNS TABLE(
  id uuid, 
  display_name text, 
  avatar_url text, 
  handle text, 
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Explicitly return only safe fields, never email or role
  SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    p.handle,
    p.created_at
  FROM public.profile p
  WHERE p.id = profile_id;
$$;

-- Grant execute to everyone
GRANT EXECUTE ON FUNCTION public.get_safe_profile(uuid) TO anon, authenticated;

-- Add explicit comments documenting the security measures
COMMENT ON POLICY "profiles_deny_all_default" ON public.profile 
IS 'Default deny-all policy to prevent any unauthorized access to profile data including emails';

COMMENT ON VIEW public.profiles_public 
IS 'Public view of profile data that excludes sensitive information like email addresses and roles';

COMMENT ON FUNCTION public.get_safe_profile(uuid) 
IS 'Secure function to retrieve public profile information without exposing email addresses or other sensitive data';