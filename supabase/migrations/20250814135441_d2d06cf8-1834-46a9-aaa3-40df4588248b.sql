-- Ensure all sensitive tables have proper RLS restrictions
-- Fix any missing or overly permissive policies

-- Check if security_event table exists and secure it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'security_event') THEN
        ALTER TABLE public.security_event ENABLE ROW LEVEL SECURITY;
        
        -- Drop any overly permissive policies
        DROP POLICY IF EXISTS "security_event_public_read" ON public.security_event;
        
        -- Create admin-only policy
        CREATE POLICY "admin_only_security_event" ON public.security_event
        FOR ALL USING (is_admin())
        WITH CHECK (is_admin());
    END IF;
END $$;

-- Check if trending table exists and secure it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trending') THEN
        ALTER TABLE public.trending ENABLE ROW LEVEL SECURITY;
        
        -- Create admin-only policy
        CREATE POLICY "admin_only_trending" ON public.trending
        FOR ALL USING (is_admin())
        WITH CHECK (is_admin());
    END IF;
END $$;

-- Ensure profile table only allows self-access or admin access
DROP POLICY IF EXISTS "profile_public_read" ON public.profile;

-- Make sure profile access is properly restricted
CREATE POLICY "profile_self_or_admin_read_secure" ON public.profile
FOR SELECT USING (auth.uid() = id OR is_admin());

-- Ensure admin_audit_log is admin-only
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Ensure newsletter_subscriber is admin-only for reads
DROP POLICY IF EXISTS "newsletter_public_read" ON public.newsletter_subscriber;