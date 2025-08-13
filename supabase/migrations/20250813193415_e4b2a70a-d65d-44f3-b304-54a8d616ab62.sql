-- 1) Profile table security - lock down emails
-- Enable RLS if not already enabled
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "users_can_view_own_profile_only" ON public.profile;
DROP POLICY IF EXISTS "users_can_update_own_profile_only" ON public.profile;
DROP POLICY IF EXISTS "block_profile_inserts" ON public.profile;
DROP POLICY IF EXISTS "block_profile_deletes" ON public.profile;

-- Create strict policies
CREATE POLICY "profile_self_or_admin_read"
  ON public.profile FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profile_self_update"
  ON public.profile FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profile_admin_all"
  ON public.profile FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Block inserts and deletes for non-admins
CREATE POLICY "profile_block_inserts"
  ON public.profile FOR INSERT
  WITH CHECK (false);

CREATE POLICY "profile_block_deletes"
  ON public.profile FOR DELETE
  USING (false);

-- 2) Create public view without email
CREATE OR REPLACE VIEW public.profile_public AS
  SELECT id, display_name, handle, avatar_url, created_at
  FROM public.profile;

-- Grant access to the public view
GRANT SELECT ON public.profile_public TO anon, authenticated;

-- 3) Newsletter subscriber - admin-only, write via Edge
ALTER TABLE public.newsletter_subscriber ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "newsletter_no_direct_access" ON public.newsletter_subscriber;

-- Admin-only access
CREATE POLICY "newsletter_admin_read"
  ON public.newsletter_subscriber FOR SELECT
  USING (public.is_admin());

CREATE POLICY "newsletter_admin_write"
  ON public.newsletter_subscriber FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4) Admin emails - zero client access
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "admin_read_admin_emails_audited" ON public.admin_emails;
DROP POLICY IF EXISTS "admin_write_admin_emails_audited" ON public.admin_emails;

-- Strict deny to all clients
CREATE POLICY "admin_emails_no_client_access"
  ON public.admin_emails FOR ALL
  USING (false)
  WITH CHECK (false);

-- Update is_admin function to be more secure
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_emails a
    WHERE lower(a.email) = lower(coalesce(auth.jwt()->>'email',''))
  ) OR EXISTS (
    SELECT 1 
    FROM public.profile p
    WHERE p.id = auth.uid() AND p.role = 'ADMIN'
  );
END$$;

-- Revoke direct access to admin_emails
REVOKE ALL ON public.admin_emails FROM anon, authenticated;