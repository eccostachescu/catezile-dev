-- Comprehensive Security Audit and RLS Enhancement
-- This migration ensures all tables have proper Row Level Security policies

DO $$
DECLARE
    table_rec RECORD;
    policy_exists BOOLEAN;
BEGIN
    -- First, let's ensure all tables in public schema have RLS enabled
    FOR table_rec IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys') -- Skip PostGIS system table
    LOOP
        -- Check if RLS is enabled on the table
        SELECT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' 
            AND c.relname = table_rec.tablename 
            AND c.relrowsecurity = true
        ) INTO policy_exists;
        
        -- Enable RLS if not already enabled
        IF NOT policy_exists THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_rec.tablename);
            RAISE NOTICE 'Enabled RLS on table: %', table_rec.tablename;
        END IF;
    END LOOP;
END $$;

-- Specific security policies for critical tables that might need them

-- Ensure season table has proper policies (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'season') THEN
        -- Enable RLS
        ALTER TABLE public.season ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "public_read_season" ON public.season;
        DROP POLICY IF EXISTS "admin_write_season" ON public.season;
        
        -- Public read access
        CREATE POLICY "public_read_season" ON public.season
        FOR SELECT USING (true);
        
        -- Admin write access
        CREATE POLICY "admin_write_season" ON public.season
        FOR ALL USING (is_admin()) WITH CHECK (is_admin());
        
        RAISE NOTICE 'Applied RLS policies to season table';
    END IF;
END $$;

-- Ensure team table has proper policies (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team') THEN
        -- Enable RLS
        ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "public_read_team" ON public.team;
        DROP POLICY IF EXISTS "admin_write_team" ON public.team;
        
        -- Public read access
        CREATE POLICY "public_read_team" ON public.team
        FOR SELECT USING (true);
        
        -- Admin write access
        CREATE POLICY "admin_write_team" ON public.team
        FOR ALL USING (is_admin()) WITH CHECK (is_admin());
        
        RAISE NOTICE 'Applied RLS policies to team table';
    END IF;
END $$;

-- Ensure standings table has proper policies (if it exists as a table, not view)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'standings') THEN
        -- Enable RLS
        ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "public_read_standings" ON public.standings;
        DROP POLICY IF EXISTS "admin_write_standings" ON public.standings;
        
        -- Public read access
        CREATE POLICY "public_read_standings" ON public.standings
        FOR SELECT USING (true);
        
        -- Admin write access
        CREATE POLICY "admin_write_standings" ON public.standings
        FOR ALL USING (is_admin()) WITH CHECK (is_admin());
        
        RAISE NOTICE 'Applied RLS policies to standings table';
    END IF;
END $$;

-- Ensure tag table has proper policies (mentioned in schema)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tag') THEN
        -- Enable RLS
        ALTER TABLE public.tag ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "public_read_tag" ON public.tag;
        DROP POLICY IF EXISTS "admin_write_tag" ON public.tag;
        
        -- Public read access
        CREATE POLICY "public_read_tag" ON public.tag
        FOR SELECT USING (true);
        
        -- Admin write access
        CREATE POLICY "admin_write_tag" ON public.tag
        FOR ALL USING (is_admin()) WITH CHECK (is_admin());
        
        RAISE NOTICE 'Applied RLS policies to tag table';
    END IF;
END $$;

-- Ensure seo_template table has proper policies (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'seo_template') THEN
        -- Enable RLS
        ALTER TABLE public.seo_template ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "public_read_seo_template" ON public.seo_template;
        DROP POLICY IF EXISTS "admin_write_seo_template" ON public.seo_template;
        
        -- Public read access (SEO templates are needed for public pages)
        CREATE POLICY "public_read_seo_template" ON public.seo_template
        FOR SELECT USING (true);
        
        -- Admin write access
        CREATE POLICY "admin_write_seo_template" ON public.seo_template
        FOR ALL USING (is_admin()) WITH CHECK (is_admin());
        
        RAISE NOTICE 'Applied RLS policies to seo_template table';
    END IF;
END $$;

-- Ensure tv_channel table has proper policies (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tv_channel') THEN
        -- Enable RLS
        ALTER TABLE public.tv_channel ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "public_read_tv_channel" ON public.tv_channel;
        DROP POLICY IF EXISTS "admin_write_tv_channel" ON public.tv_channel;
        
        -- Public read access
        CREATE POLICY "public_read_tv_channel" ON public.tv_channel
        FOR SELECT USING (true);
        
        -- Admin write access
        CREATE POLICY "admin_write_tv_channel" ON public.tv_channel
        FOR ALL USING (is_admin()) WITH CHECK (is_admin());
        
        RAISE NOTICE 'Applied RLS policies to tv_channel table';
    END IF;
END $$;

-- Ensure tv_program table has proper policies (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tv_program') THEN
        -- Enable RLS
        ALTER TABLE public.tv_program ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "public_read_tv_program" ON public.tv_program;
        DROP POLICY IF EXISTS "admin_write_tv_program" ON public.tv_program;
        
        -- Public read access
        CREATE POLICY "public_read_tv_program" ON public.tv_program
        FOR SELECT USING (true);
        
        -- Admin write access
        CREATE POLICY "admin_write_tv_program" ON public.tv_program
        FOR ALL USING (is_admin()) WITH CHECK (is_admin());
        
        RAISE NOTICE 'Applied RLS policies to tv_program table';
    END IF;
END $$;

-- Ensure venue table has proper policies (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'venue') THEN
        -- Enable RLS
        ALTER TABLE public.venue ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "public_read_venue" ON public.venue;
        DROP POLICY IF EXISTS "admin_write_venue" ON public.venue;
        
        -- Public read access
        CREATE POLICY "public_read_venue" ON public.venue
        FOR SELECT USING (true);
        
        -- Admin write access
        CREATE POLICY "admin_write_venue" ON public.venue
        FOR ALL USING (is_admin()) WITH CHECK (is_admin());
        
        RAISE NOTICE 'Applied RLS policies to venue table';
    END IF;
END $$;

-- Security hardening: Ensure views are properly secured
DO $$
BEGIN
    -- Make all views use security invoker mode for proper RLS enforcement
    FOR table_rec IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true)', table_rec.viewname);
            RAISE NOTICE 'Set security_invoker=true for view: %', table_rec.viewname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not set security_invoker for view %: %', table_rec.viewname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Final security audit query to check for any remaining unprotected tables
DO $$
DECLARE
    unprotected_tables TEXT;
BEGIN
    SELECT string_agg(tablename, ', ') INTO unprotected_tables
    FROM (
        SELECT t.tablename
        FROM pg_tables t
        LEFT JOIN pg_class c ON c.relname = t.tablename
        LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE t.schemaname = 'public'
        AND (c.relrowsecurity = false OR c.relrowsecurity IS NULL)
        AND t.tablename NOT IN ('spatial_ref_sys') -- Skip PostGIS system table
    ) AS unprotected;
    
    IF unprotected_tables IS NOT NULL THEN
        RAISE WARNING 'The following tables still need RLS policies: %', unprotected_tables;
    ELSE
        RAISE NOTICE 'All public tables now have Row Level Security enabled.';
    END IF;
END $$;