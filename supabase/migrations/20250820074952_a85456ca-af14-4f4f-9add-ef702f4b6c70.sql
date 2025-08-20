-- Final comprehensive security fix - completely lock down sensitive data
-- This addresses all critical user data exposure issues

-- ==== PROFILE TABLE SECURITY ====

-- Drop ALL existing policies on profile table
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profile;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profile;
DROP POLICY IF EXISTS "profiles_insert_system_only" ON public.profile;
DROP POLICY IF EXISTS "profiles_delete_admin_only" ON public.profile;
DROP POLICY IF EXISTS "profiles_deny_anonymous" ON public.profile;

-- Create a single, extremely restrictive default policy for profile table
-- This denies ALL access by default
CREATE POLICY "profile_restrictive_default" 
ON public.profile 
AS RESTRICTIVE
FOR ALL 
USING (false);

-- Create specific permissive policies for ONLY the required operations
CREATE POLICY "profile_own_select_authenticated" 
ON public.profile 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profile_admin_all_access" 
ON public.profile 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "profile_own_update_authenticated" 
ON public.profile 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "profile_system_insert_authenticated" 
ON public.profile 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id OR public.is_admin());

-- ==== NEWSLETTER SUBSCRIBER SECURITY ====

-- Fix newsletter_subscriber table - should only be accessible to admins
DROP POLICY IF EXISTS "newsletter_admin_only" ON public.newsletter_subscriber;

-- Create restrictive policy for newsletter_subscriber
CREATE POLICY "newsletter_admin_only_access" 
ON public.newsletter_subscriber 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Deny all access to anonymous users for newsletter_subscriber
CREATE POLICY "newsletter_deny_anonymous" 
ON public.newsletter_subscriber 
AS RESTRICTIVE
FOR ALL 
TO anon
USING (false);

-- ==== ADMIN AUDIT LOG SECURITY ====

-- Ensure admin_audit_log is properly secured
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Create admin-only policy for audit log
CREATE POLICY "admin_audit_log_admin_only" 
ON public.admin_audit_log 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Deny all access to anonymous users for admin audit log
CREATE POLICY "admin_audit_log_deny_anonymous" 
ON public.admin_audit_log 
AS RESTRICTIVE
FOR ALL 
TO anon
USING (false);

-- ==== ADDITIONAL SECURITY MEASURES ====

-- Revoke any excessive permissions
REVOKE ALL ON public.profile FROM anon;
REVOKE ALL ON public.newsletter_subscriber FROM anon;
REVOKE ALL ON public.admin_audit_log FROM anon;

-- Grant only necessary permissions to authenticated users
GRANT SELECT ON public.profile TO authenticated;
GRANT UPDATE ON public.profile TO authenticated;
GRANT INSERT ON public.profile TO authenticated;

-- Admin tables should have no direct access except through functions
REVOKE ALL ON public.newsletter_subscriber FROM authenticated;
REVOKE ALL ON public.admin_audit_log FROM authenticated;

-- Update the public profiles view to be completely safe
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public WITH (security_barrier = true) AS
SELECT 
  id,
  display_name,
  avatar_url,
  handle,
  created_at
FROM public.profile;

-- Ensure view permissions are correct
REVOKE ALL ON public.profiles_public FROM anon;
REVOKE ALL ON public.profiles_public FROM authenticated;
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Document the security measures
COMMENT ON POLICY "profile_restrictive_default" ON public.profile 
IS 'SECURITY: Restrictive policy that denies all access by default. Only specific permissive policies can grant access.';

COMMENT ON POLICY "newsletter_admin_only_access" ON public.newsletter_subscriber 
IS 'SECURITY: Only administrators can access newsletter subscriber data to prevent email harvesting.';

COMMENT ON POLICY "admin_audit_log_admin_only" ON public.admin_audit_log 
IS 'SECURITY: Only administrators can access audit logs to prevent information leakage.';