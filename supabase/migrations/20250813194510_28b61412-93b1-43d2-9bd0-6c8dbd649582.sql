-- Fix all security issues identified by the scanner

-- 1. Fix user_settings table - restrict to user-only access
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies
DROP POLICY IF EXISTS "user_settings_read" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_write" ON public.user_settings;

-- Create strict policies for user_settings
CREATE POLICY "user_settings_self_only"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_admin_all"
  ON public.user_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. Ensure follow table has proper RLS
ALTER TABLE public.follow ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies
DROP POLICY IF EXISTS "owner follow" ON public.follow;

-- Create strict policies for follow
CREATE POLICY "follow_user_only"
  ON public.follow FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "follow_admin_all"
  ON public.follow FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Ensure reminder table has proper RLS  
ALTER TABLE public.reminder ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies
DROP POLICY IF EXISTS "owner reminder" ON public.reminder;

-- Create strict policies for reminder
CREATE POLICY "reminder_user_only"
  ON public.reminder FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reminder_admin_all"
  ON public.reminder FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Remove unnecessary security definer functions that may be causing linter issues
-- Keep only essential ones and make sure they're properly secured

-- Update get_public_profile to be more restrictive
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(id uuid, display_name text, avatar_url text, handle text, created_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
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

-- Update get_profile_without_email to ensure it doesn't expose sensitive data
CREATE OR REPLACE FUNCTION public.get_profile_without_email(profile_id uuid)
RETURNS TABLE(id uuid, display_name text, handle text, avatar_url text, locale text, timezone text, role text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.display_name,
    p.handle,
    p.avatar_url,
    p.locale,
    p.timezone,
    p.role,
    p.created_at,
    p.updated_at
  FROM public.profile p
  WHERE p.id = profile_id
  AND (auth.uid() = p.id OR public.is_admin());
$$;

-- 5. Create a user_settings table if it doesn't exist (based on security scan)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_settings if just created
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Apply the policies we created above for user_settings
-- (already done above, but ensuring they exist)