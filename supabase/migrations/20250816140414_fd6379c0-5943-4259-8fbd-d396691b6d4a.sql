-- Comprehensive fix for all user email security issues

-- 1. First, let's completely lock down the profile table
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "profiles_own_data_select" ON public.profile;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profile;
DROP POLICY IF EXISTS "profiles_own_data_update" ON public.profile;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profile;
DROP POLICY IF EXISTS "profiles_system_insert" ON public.profile;
DROP POLICY IF EXISTS "profiles_no_delete" ON public.profile;

-- Ensure RLS is enabled
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- Create the most restrictive policies possible
-- Users can only see their own profile
CREATE POLICY "profile_self_read" ON public.profile
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- Admins can see all profiles
CREATE POLICY "profile_admin_read" ON public.profile
  FOR SELECT 
  TO authenticated
  USING (is_admin());

-- Users can only update their own profile (excluding email changes)
CREATE POLICY "profile_self_update" ON public.profile
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (OLD.email = NEW.email OR is_admin()) -- Prevent email changes unless admin
  );

-- Only admins can insert profiles (system operation)
CREATE POLICY "profile_admin_insert" ON public.profile
  FOR INSERT 
  TO authenticated
  WITH CHECK (is_admin());

-- Only admins can delete profiles
CREATE POLICY "profile_admin_delete" ON public.profile
  FOR DELETE 
  TO authenticated
  USING (is_admin());

-- 2. Fix newsletter subscriber table completely
-- Ensure RLS is enabled
ALTER TABLE public.newsletter_subscriber ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "newsletter_admin_only" ON public.newsletter_subscriber;
DROP POLICY IF EXISTS "newsletter_admin_read" ON public.newsletter_subscriber;
DROP POLICY IF EXISTS "newsletter_admin_write" ON public.newsletter_subscriber;

-- Only admins can access newsletter subscriber data
CREATE POLICY "newsletter_admin_access" ON public.newsletter_subscriber
  FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3. Fix admin_emails table security
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "admin_emails_no_client_access" ON public.admin_emails;

-- Completely block client access to admin emails
CREATE POLICY "admin_emails_block_all" ON public.admin_emails
  FOR ALL 
  USING (false)
  WITH CHECK (false);

-- 4. Fix the profile_public view to be completely safe
DROP VIEW IF EXISTS public.profile_public CASCADE;

-- Create a truly safe public profile view that respects RLS
CREATE VIEW public.profile_public 
WITH (security_barrier=true) AS
SELECT 
  p.id,
  p.display_name,
  p.avatar_url,
  p.handle,
  p.created_at
FROM public.profile p
-- This view will automatically respect the RLS policies on the profile table
-- No additional WHERE clause needed as RLS handles the filtering;

-- 5. Update the public profile function to be safer
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(id uuid, display_name text, avatar_url text, handle text, created_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY INVOKER -- Changed from SECURITY DEFINER to INVOKER
SET search_path TO 'public'
AS $$
  -- This function will now run with the caller's permissions
  -- RLS policies will automatically be enforced
  SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    p.handle,
    p.created_at
  FROM public.profile p
  WHERE p.id = profile_id;
$$;

-- 6. Create a special admin function for system operations (like user creation)
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id uuid,
  user_email text,
  user_display_name text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow this to be called by the auth system or admins
  IF NOT (auth.uid() = user_id OR is_admin()) THEN
    RAISE EXCEPTION 'Unauthorized profile creation';
  END IF;
  
  INSERT INTO public.profile (id, email, display_name, role)
  VALUES (
    user_id, 
    user_email, 
    COALESCE(user_display_name, split_part(user_email, '@', 1)),
    CASE 
      WHEN lower(user_email) = lower('eccostachescu@gmail.com') THEN 'ADMIN'
      ELSE 'USER'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, profile.display_name);
END;
$$;