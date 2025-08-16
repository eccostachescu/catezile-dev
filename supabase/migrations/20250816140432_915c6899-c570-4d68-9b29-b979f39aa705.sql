-- Fix the syntax error in the previous migration

-- Fix the profile_public view
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
FROM public.profile p;

-- Update the public profile function to be safer
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(id uuid, display_name text, avatar_url text, handle text, created_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY INVOKER
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