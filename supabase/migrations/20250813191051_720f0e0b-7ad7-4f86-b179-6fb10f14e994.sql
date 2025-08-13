-- Fix all remaining security warnings (corrected order)

-- 1. Create audit table first
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

-- 2. Create logging function for admin email access
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

-- 3. Enhanced Profile Security
-- Remove old policies and create secure ones
DROP POLICY IF EXISTS "secure_users_can_view_own_profile" ON public.profile;
DROP POLICY IF EXISTS "secure_users_can_update_own_profile" ON public.profile;

-- Create new policies for users to access their own profile
CREATE POLICY "users_view_own_profile_secure" ON public.profile
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile_secure" ON public.profile  
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Enhanced Newsletter Security
-- Completely block direct access to newsletter emails
DROP POLICY IF EXISTS "admin_read_newsletter_count_only" ON public.newsletter_subscriber;

CREATE POLICY "block_direct_newsletter_access" ON public.newsletter_subscriber
  FOR SELECT USING (false); -- No direct access allowed

-- 5. Enhanced Admin Email Security  
-- Replace existing policies with audit-logged ones
DROP POLICY IF EXISTS "admin read admin_emails" ON public.admin_emails;
DROP POLICY IF EXISTS "admin write admin_emails" ON public.admin_emails;

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