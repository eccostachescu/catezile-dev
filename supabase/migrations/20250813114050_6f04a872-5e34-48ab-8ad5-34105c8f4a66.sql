-- Fix profile table RLS policies to prevent unauthorized access to user email addresses

-- Drop existing policies that might be problematic
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profile;
DROP POLICY IF EXISTS "system_can_insert_profiles" ON public.profile;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profile;

-- Create secure policies for profile table
-- 1. Only allow users to view their own profile or admins to view any profile
CREATE POLICY "secure_users_can_view_own_profile" 
ON public.profile 
FOR SELECT 
USING (
  auth.uid() = id OR is_admin()
);

-- 2. Only allow users to update their own profile (excluding sensitive fields)
CREATE POLICY "secure_users_can_update_own_profile" 
ON public.profile 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND old.id = new.id 
  AND old.email = new.email  -- Prevent email changes via this table
  AND old.role = new.role    -- Prevent role escalation
);

-- 3. Block all direct inserts (profiles should only be created via triggers)
CREATE POLICY "block_direct_profile_inserts" 
ON public.profile 
FOR INSERT 
WITH CHECK (false);

-- 4. Block all direct deletes (profiles should be managed via auth system)
CREATE POLICY "block_direct_profile_deletes" 
ON public.profile 
FOR DELETE 
USING (false);

-- Additional security: Add a function to safely get public profile info without exposing emails
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id UUID)
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  avatar_url TEXT,
  handle TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
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

-- Create a secure view for public profile data (without emails)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  display_name,
  avatar_url,
  handle,
  created_at
FROM public.profile;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Create policy for the public_profiles view
CREATE POLICY "public_profiles_readable" 
ON public.public_profiles 
FOR SELECT 
USING (true);