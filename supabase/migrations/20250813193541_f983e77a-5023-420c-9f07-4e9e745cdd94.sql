-- Fix security linter warning - views don't need SECURITY DEFINER
-- Replace the view with a normal view (not SECURITY DEFINER)
DROP VIEW IF EXISTS public.profile_public;

CREATE VIEW public.profile_public AS
  SELECT id, display_name, handle, avatar_url, created_at
  FROM public.profile;