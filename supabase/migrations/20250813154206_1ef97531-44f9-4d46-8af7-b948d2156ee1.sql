-- Enable RLS on system tables that currently lack protection
ALTER TABLE public.standings_regular ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for standings_regular (make it read-only for public)
CREATE POLICY "public_read_standings_regular" ON public.standings_regular
  FOR SELECT USING (true);

CREATE POLICY "admin_write_standings_regular" ON public.standings_regular
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- Create RLS policies for ugc_queue (admin only access)
CREATE POLICY "admin_only_ugc_queue" ON public.ugc_queue
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- Improve newsletter subscriber table security
-- Remove the redundant admin policies and keep only the essential ones
DROP POLICY IF EXISTS "admin delete newsletter_subscriber" ON public.newsletter_subscriber;
DROP POLICY IF EXISTS "admin update newsletter_subscriber" ON public.newsletter_subscriber;
DROP POLICY IF EXISTS "admin_only_delete_newsletter_subscriber" ON public.newsletter_subscriber;
DROP POLICY IF EXISTS "admin_only_update_newsletter_subscriber" ON public.newsletter_subscriber;

-- Create more restrictive newsletter policies
CREATE POLICY "admin_read_newsletter_count_only" ON public.newsletter_subscriber
  FOR SELECT USING (is_admin() AND false); -- Completely restrict email reading

-- Create a secure function for newsletter operations that doesn't expose emails
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

-- Improve profile table security by adding email hashing option
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