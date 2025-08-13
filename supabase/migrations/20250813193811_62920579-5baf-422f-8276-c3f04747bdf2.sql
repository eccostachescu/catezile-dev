-- Check for any functions that might be causing security definer view warnings
-- and identify the real issue

-- List all existing views to see what's being flagged
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- Check for materialized views too
SELECT 
    schemaname,
    matviewname,
    matviewowner,
    definition
FROM pg_matviews 
WHERE schemaname = 'public'
ORDER BY matviewname;