-- Fix function search path security issues by setting search_path to empty
CREATE OR REPLACE FUNCTION public.get_newsletter_subscriber_count()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
  SELECT COUNT(*)::INTEGER FROM public.newsletter_subscriber;
$$;

CREATE OR REPLACE FUNCTION public.is_email_subscribed(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
  SELECT EXISTS(SELECT 1 FROM public.newsletter_subscriber WHERE email = email_to_check);
$$;

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
SET search_path TO ''
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