-- Fix security vulnerabilities in user data access

-- 1. First, let's check if there's a profile_public view that's exposing data
-- If it exists, we need to ensure it doesn't expose email addresses
DROP VIEW IF EXISTS public.profile_public CASCADE;

-- 2. Create a secure public profile view that only exposes safe data
CREATE VIEW public.profile_public AS
SELECT 
  id,
  display_name,
  avatar_url,
  handle,
  created_at
FROM public.profile;

-- 3. Enable RLS on the view (though views inherit from underlying tables)
-- Make sure the profile table has proper RLS
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- 4. Drop any existing problematic policies and recreate them securely
DROP POLICY IF EXISTS "profile_self_or_admin_read" ON public.profile;
DROP POLICY IF EXISTS "profile_admin_all" ON public.profile;
DROP POLICY IF EXISTS "profile_allow_system_insert" ON public.profile;
DROP POLICY IF EXISTS "profile_self_update" ON public.profile;
DROP POLICY IF EXISTS "profile_block_deletes" ON public.profile;

-- 5. Create secure RLS policies that prevent public access to email addresses
CREATE POLICY "profiles_own_data_select" ON public.profile
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "profiles_admin_select" ON public.profile
  FOR SELECT 
  USING (is_admin());

CREATE POLICY "profiles_own_data_update" ON public.profile
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON public.profile
  FOR ALL 
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "profiles_system_insert" ON public.profile
  FOR INSERT 
  WITH CHECK (auth.uid() = id OR is_admin());

-- 6. Block all deletes except by admins
CREATE POLICY "profiles_no_delete" ON public.profile
  FOR DELETE 
  USING (is_admin());

-- 7. Fix newsletter subscriber table RLS
ALTER TABLE public.newsletter_subscriber ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "newsletter_admin_read" ON public.newsletter_subscriber;
DROP POLICY IF EXISTS "newsletter_admin_write" ON public.newsletter_subscriber;

-- Create secure policies for newsletter
CREATE POLICY "newsletter_admin_only" ON public.newsletter_subscriber
  FOR ALL 
  USING (is_admin())
  WITH CHECK (is_admin());

-- 8. Check if user_settings table exists and secure it
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
    EXECUTE 'ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY';
    
    -- Drop existing policies if any
    EXECUTE 'DROP POLICY IF EXISTS "user_settings_own_data" ON public.user_settings';
    EXECUTE 'DROP POLICY IF EXISTS "user_settings_admin_all" ON public.user_settings';
    
    -- Create secure policies
    EXECUTE 'CREATE POLICY "user_settings_own_data" ON public.user_settings
      FOR ALL 
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id)';
      
    EXECUTE 'CREATE POLICY "user_settings_admin_all" ON public.user_settings
      FOR ALL 
      USING (is_admin())
      WITH CHECK (is_admin())';
  END IF;
END
$$;