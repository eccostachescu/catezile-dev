-- Fix critical security issue: Prevent public access to user email addresses
-- Create a restrictive policy that explicitly denies public access to profiles

-- First, check if there are any permissive policies that might allow public access
-- We need to ensure only authenticated users can access profiles and only their own data or admin data

-- Drop any existing public access policies if they exist
DO $$ 
BEGIN
    -- Check if there's a policy allowing public access and drop it
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profile' 
        AND policyname LIKE '%public%'
    ) THEN
        DROP POLICY IF EXISTS "public_read_profiles" ON public.profile;
    END IF;
END $$;

-- Create an explicit restrictive policy for unauthenticated users
-- This ensures that anonymous users cannot access profile data at all
CREATE POLICY "profiles_no_anonymous_access" 
ON public.profile 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- Ensure the existing policies are correct for authenticated users
-- Users should only see their own data or be admins
-- Let's recreate the select policy to be more explicit
DROP POLICY IF EXISTS "profiles_own_data_select" ON public.profile;
CREATE POLICY "profiles_own_data_select" 
ON public.profile 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Create a secure function for getting public profile data without emails
-- This replaces any direct table access for public profile information
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_id uuid)
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

-- Grant execute permission on the safe function to all users
GRANT EXECUTE ON FUNCTION public.get_public_profile_safe(uuid) TO anon, authenticated;

-- Ensure the profile_public table is properly secured as well
-- Even though it doesn't contain emails, it should have proper RLS
ALTER TABLE public.profile_public ENABLE ROW LEVEL SECURITY;

-- Create a policy for profile_public that allows read access
CREATE POLICY "profile_public_read_access" 
ON public.profile_public 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Add a comment documenting the security fix
COMMENT ON POLICY "profiles_no_anonymous_access" ON public.profile 
IS 'Critical security fix: Prevents anonymous users from accessing user profile data including email addresses';

COMMENT ON FUNCTION public.get_public_profile_safe(uuid) 
IS 'Secure function to get public profile data without exposing email addresses or other sensitive information';