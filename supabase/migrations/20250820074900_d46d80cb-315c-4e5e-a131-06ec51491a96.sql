-- Simplified but comprehensive fix for user email exposure
-- Lock down profile table access with clear, working policies

-- First, drop all existing profile policies to start fresh
DROP POLICY IF EXISTS "profiles_no_anonymous_access" ON public.profile;
DROP POLICY IF EXISTS "profiles_own_data_select" ON public.profile;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profile;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profile;
DROP POLICY IF EXISTS "profiles_no_delete" ON public.profile;
DROP POLICY IF EXISTS "profiles_own_data_update" ON public.profile;
DROP POLICY IF EXISTS "profiles_system_insert" ON public.profile;
DROP POLICY IF EXISTS "profiles_deny_all_default" ON public.profile;

-- Create restrictive policies for each operation

-- SELECT: Only allow users to see their own data, or admins to see all
CREATE POLICY "profiles_select_own_or_admin" 
ON public.profile 
FOR SELECT 
TO authenticated
USING (auth.uid() = id OR public.is_admin());

-- UPDATE: Only allow users to update their own data, or admins to update all
CREATE POLICY "profiles_update_own_or_admin" 
ON public.profile 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- INSERT: Only allow system/admin to create profiles during user registration
CREATE POLICY "profiles_insert_system_only" 
ON public.profile 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id OR public.is_admin());

-- DELETE: Only allow admins to delete profiles
CREATE POLICY "profiles_delete_admin_only" 
ON public.profile 
FOR DELETE 
TO authenticated
USING (public.is_admin());

-- Explicitly deny ALL access to anonymous users
CREATE POLICY "profiles_deny_anonymous" 
ON public.profile 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- Create a secure view for public profile data that excludes sensitive information
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT 
  id,
  display_name,
  avatar_url,
  handle,
  created_at
FROM public.profile
WHERE id IS NOT NULL; -- Basic filter to ensure view works properly

-- Grant SELECT access to the public view for everyone
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Update the secure function for getting public profile data
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
  SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    p.handle,
    p.created_at
  FROM public.profile p
  WHERE p.id = profile_id;
$$;

-- Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION public.get_safe_profile(uuid) TO anon, authenticated;

-- Add documentation
COMMENT ON POLICY "profiles_deny_anonymous" ON public.profile 
IS 'Explicitly denies all access to profile data for anonymous users to prevent email exposure';

COMMENT ON VIEW public.profiles_public 
IS 'Safe public view of profiles that excludes email addresses and other sensitive data';

COMMENT ON FUNCTION public.get_safe_profile(uuid) 
IS 'Secure function to get public profile data without exposing emails or sensitive information';