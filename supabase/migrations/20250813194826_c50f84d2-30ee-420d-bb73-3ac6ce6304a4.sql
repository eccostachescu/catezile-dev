-- Try to identify and fix the specific Security Definer View issues
-- The linter may be detecting something specific about our views or functions

-- First, let's check if there are any views with specific issues
SELECT 
    viewname,
    definition,
    viewowner
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- Check if any functions are incorrectly flagged as views
SELECT 
    p.proname,
    p.prosecdef,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.prosecdef = true
AND p.proname IN ('profile_public', 'standings_regular', 'static_pages', 'ugc_queue')
ORDER BY p.proname;