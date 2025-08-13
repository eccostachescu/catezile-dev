-- Improve newsletter subscriber table security
-- Remove the redundant admin policies and keep only the essential ones
DROP POLICY IF EXISTS "admin delete newsletter_subscriber" ON public.newsletter_subscriber;
DROP POLICY IF EXISTS "admin update newsletter_subscriber" ON public.newsletter_subscriber;
DROP POLICY IF EXISTS "admin_only_delete_newsletter_subscriber" ON public.newsletter_subscriber;
DROP POLICY IF EXISTS "admin_only_update_newsletter_subscriber" ON public.newsletter_subscriber;
DROP POLICY IF EXISTS "admin_only_read_newsletter_subscriber" ON public.newsletter_subscriber;

-- Create secure functions for newsletter operations that don't expose emails
CREATE OR REPLACE FUNCTION public.get_newsletter_subscriber_count()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::INTEGER FROM public.newsletter_subscriber;
$$;

-- Add a secure function to check if email is already subscribed without exposing the email
CREATE OR REPLACE FUNCTION public.is_email_subscribed(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(SELECT 1 FROM public.newsletter_subscriber WHERE email = email_to_check);
$$;

-- Create secure function for profile access without exposing emails
CREATE OR REPLACE FUNCTION public.get_profile_without_email(profile_id UUID)
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  handle TEXT,
  avatar_url TEXT,
  locale TEXT,
  timezone TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
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
  WHERE p.id = profile_id;
$$;

-- Fix search_index RLS policy by ensuring proper read access
DROP POLICY IF EXISTS "public_read_search" ON public.search_index;
CREATE POLICY "public_read_search_index" ON public.search_index
  FOR SELECT USING (true);