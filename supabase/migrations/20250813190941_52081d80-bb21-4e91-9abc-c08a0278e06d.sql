-- Fix all remaining security warnings

-- 1. Enhanced Profile Security
-- Remove email access from regular profile policies and create audit-logged admin access
DROP POLICY IF EXISTS "secure_users_can_view_own_profile" ON public.profile;
DROP POLICY IF EXISTS "secure_users_can_update_own_profile" ON public.profile;

-- Create a new policy for users to view their own profile WITHOUT email exposure to admins
CREATE POLICY "users_view_own_profile_secure" ON public.profile
  FOR SELECT USING (auth.uid() = id);

-- Create a new policy for users to update their own profile
CREATE POLICY "users_update_own_profile_secure" ON public.profile  
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create audit table for admin access to sensitive data
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  accessed_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "admin_read_audit_log" ON public.admin_audit_log
  FOR SELECT USING (is_admin());

-- Create secure function for admin profile access with audit logging
CREATE OR REPLACE FUNCTION public.admin_get_profile_with_audit(
  profile_id UUID,
  admin_reason TEXT DEFAULT 'Profile review'
)
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  handle TEXT,
  avatar_url TEXT,
  email TEXT,
  locale TEXT,
  timezone TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Log the access
  INSERT INTO public.admin_audit_log (admin_id, action, table_name, record_id)
  VALUES (auth.uid(), admin_reason, 'profile', profile_id);
  
  -- Return profile data
  RETURN QUERY
  SELECT 
    p.id,
    p.display_name,
    p.handle,
    p.avatar_url,
    p.email,
    p.locale,
    p.timezone,
    p.role,
    p.created_at,
    p.updated_at
  FROM public.profile p
  WHERE p.id = profile_id;
END;
$$;

-- 2. Enhanced Newsletter Security
-- Ensure no direct read access to newsletter emails
DROP POLICY IF EXISTS "admin_read_newsletter_count_only" ON public.newsletter_subscriber;

-- Create policy that completely blocks direct access to newsletter emails
CREATE POLICY "block_direct_newsletter_access" ON public.newsletter_subscriber
  FOR SELECT USING (false); -- No direct access allowed

-- Create audit-logged admin function for newsletter management
CREATE OR REPLACE FUNCTION public.admin_newsletter_action(
  action_type TEXT,
  email_address TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Log the action
  INSERT INTO public.admin_audit_log (admin_id, action, table_name)
  VALUES (auth.uid(), 'newsletter_' || action_type, 'newsletter_subscriber');
  
  -- Execute action based on type
  CASE action_type
    WHEN 'count' THEN
      SELECT jsonb_build_object('count', COUNT(*)) INTO result
      FROM public.newsletter_subscriber;
    WHEN 'delete' THEN
      IF email_address IS NULL THEN
        RAISE EXCEPTION 'Email address required for delete action';
      END IF;
      DELETE FROM public.newsletter_subscriber WHERE email = email_address;
      result := jsonb_build_object('deleted', email_address);
    ELSE
      RAISE EXCEPTION 'Invalid action type: %', action_type;
  END CASE;
  
  RETURN result;
END;
$$;

-- 3. Enhanced Admin Email Security
-- Create additional protection for admin emails table
DROP POLICY IF EXISTS "admin read admin_emails" ON public.admin_emails;
DROP POLICY IF EXISTS "admin write admin_emails" ON public.admin_emails;

-- Create highly restricted policies with audit logging
CREATE POLICY "admin_read_admin_emails_audited" ON public.admin_emails
  FOR SELECT USING (
    is_admin() AND 
    (SELECT public.log_admin_email_access(auth.uid())) -- Force audit logging
  );

CREATE POLICY "admin_write_admin_emails_audited" ON public.admin_emails
  FOR ALL USING (
    is_admin() AND 
    (SELECT public.log_admin_email_access(auth.uid())) -- Force audit logging
  )
  WITH CHECK (
    is_admin() AND 
    (SELECT public.log_admin_email_access(auth.uid())) -- Force audit logging
  );

-- Function to log admin email access
CREATE OR REPLACE FUNCTION public.log_admin_email_access(admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (admin_id, action, table_name)
  VALUES (admin_id, 'admin_emails_access', 'admin_emails');
  RETURN true;
END;
$$;

-- 4. Create secure admin dashboard functions that replace direct table access
CREATE OR REPLACE FUNCTION public.admin_get_user_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Log the access
  INSERT INTO public.admin_audit_log (admin_id, action, table_name)
  VALUES (auth.uid(), 'user_stats_access', 'profile');
  
  -- Return aggregated stats without exposing individual emails
  SELECT jsonb_build_object(
    'total_users', COUNT(*),
    'users_with_display_name', COUNT(*) FILTER (WHERE display_name IS NOT NULL),
    'users_by_role', jsonb_object_agg(role, role_count)
  ) INTO result
  FROM (
    SELECT role, COUNT(*) as role_count
    FROM public.profile
    GROUP BY role
  ) role_stats
  CROSS JOIN public.profile;
  
  RETURN result;
END;
$$;