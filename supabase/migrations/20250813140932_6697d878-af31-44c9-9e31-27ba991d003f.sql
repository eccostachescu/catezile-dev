-- Fix additional security issues identified in the scan
-- This addresses the newsletter_subscriber and profile table vulnerabilities

-- Fix newsletter_subscriber table - only admins should read email addresses
DO $$
BEGIN
    -- Drop existing public read policies that expose emails
    DROP POLICY IF EXISTS "admin read newsletter_subscriber" ON public.newsletter_subscriber;
    DROP POLICY IF EXISTS "admin_only_read_newsletter_subscriber" ON public.newsletter_subscriber;
    
    -- Create secure admin-only read policy
    CREATE POLICY "admin_only_read_newsletter_subscriber" ON public.newsletter_subscriber
    FOR SELECT USING (is_admin());
    
    RAISE NOTICE 'Updated newsletter_subscriber RLS policies - now admin-only access';
END $$;

-- Fix profile table - users can only see their own profiles, not others
DO $$
BEGIN
    -- Drop any overly permissive policies
    DROP POLICY IF EXISTS "secure_users_can_view_own_profile" ON public.profile;
    
    -- Create proper policy - users can only view their own profile, admins can view all
    CREATE POLICY "secure_users_can_view_own_profile" ON public.profile
    FOR SELECT USING (
        (auth.uid() = id) OR is_admin()
    );
    
    RAISE NOTICE 'Updated profile RLS policies - users can only see their own profiles';
END $$;

-- Additional security hardening: Ensure user settings table is properly secured
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_settings') THEN
        -- Enable RLS
        ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "owner_read_user_settings" ON public.user_settings;
        DROP POLICY IF EXISTS "owner_write_user_settings" ON public.user_settings;
        DROP POLICY IF EXISTS "admin_all_user_settings" ON public.user_settings;
        
        -- Users can only access their own settings
        CREATE POLICY "owner_read_user_settings" ON public.user_settings
        FOR SELECT USING (user_id = auth.uid());
        
        CREATE POLICY "owner_write_user_settings" ON public.user_settings
        FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
        
        -- Admins can access all settings
        CREATE POLICY "admin_all_user_settings" ON public.user_settings
        FOR ALL USING (is_admin()) WITH CHECK (is_admin());
        
        RAISE NOTICE 'Applied RLS policies to user_settings table';
    END IF;
END $$;

-- Security audit: Check for any policies that might be too permissive
DO $$
DECLARE
    policy_rec RECORD;
    warning_count INTEGER := 0;
BEGIN
    -- Check for policies with overly broad access (using 'true' condition)
    FOR policy_rec IN 
        SELECT schemaname, tablename, policyname, qual
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND (
            qual LIKE '%true%' 
            OR qual IS NULL
        )
        AND policyname NOT LIKE '%public_read%'
        AND tablename NOT IN ('category', 'city', 'competition', 'event', 'match', 'movie', 'holiday', 'exam', 'exam_phase', 'holiday_instance', 'school_calendar', 'ott_platform', 'movie_platform', 'league', 'round', 'derby', 'event_category', 'event_tag', 'seo_template', 'tv_channel', 'tv_program', 'venue', 'season', 'team', 'tag')
    LOOP
        warning_count := warning_count + 1;
        RAISE WARNING 'Potentially overly permissive policy found: %.% - %', 
            policy_rec.tablename, policy_rec.policyname, policy_rec.qual;
    END LOOP;
    
    IF warning_count = 0 THEN
        RAISE NOTICE 'Security audit completed - no overly permissive policies found';
    ELSE
        RAISE WARNING 'Found % potentially risky policies that should be reviewed', warning_count;
    END IF;
END $$;