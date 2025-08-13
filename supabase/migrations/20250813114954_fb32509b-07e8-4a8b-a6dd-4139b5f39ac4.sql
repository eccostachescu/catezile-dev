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

-- 2. Only allow users to update their own profile (but not sensitive fields like email/role)
CREATE POLICY "secure_users_can_update_own_profile" 
ON public.profile 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

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

-- Create a secure function to safely get public profile info without exposing emails
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

-- Add a trigger to prevent email/role changes via direct updates
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins can change role
  IF (NEW.role IS DISTINCT FROM OLD.role) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change role';
  END IF;

  -- Only admins can change email
  IF (NEW.email IS DISTINCT FROM OLD.email) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change email';
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger for profile updates
DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation_trigger ON public.profile;
CREATE TRIGGER prevent_profile_privilege_escalation_trigger
  BEFORE UPDATE ON public.profile
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();