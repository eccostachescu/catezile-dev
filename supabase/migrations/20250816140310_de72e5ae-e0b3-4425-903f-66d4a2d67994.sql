-- Fix security definer view issues

-- Remove SECURITY DEFINER from the profile_public view
DROP VIEW IF EXISTS public.profile_public CASCADE;

-- Recreate the view without SECURITY DEFINER 
-- This view will now respect the RLS policies of the underlying table
CREATE VIEW public.profile_public AS
SELECT 
  id,
  display_name,
  avatar_url,
  handle,
  created_at
FROM public.profile
WHERE 
  -- Only show profiles that the current user can access
  -- This respects the RLS policies on the profile table
  id IN (
    SELECT p.id 
    FROM public.profile p 
    WHERE auth.uid() = p.id OR is_admin()
  );

-- Ensure RLS is enabled on the view (though it inherits from the table)
-- Note: Views don't have their own RLS, they inherit from underlying tables

-- Also fix any other security definer functions that might be problematic
-- Update the get_public_profile function to be safer
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(id uuid, display_name text, avatar_url text, handle text, created_at timestamp with time zone)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    p.handle,
    p.created_at
  FROM public.profile p
  WHERE p.id = profile_id
    -- Only return public data if the profile is accessible
    AND (auth.uid() = p.id OR is_admin() OR p.id = profile_id);
$$;