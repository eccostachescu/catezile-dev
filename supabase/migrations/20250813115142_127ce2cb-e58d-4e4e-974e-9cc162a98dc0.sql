-- Remove public read access from newsletter_subscriber table to prevent email harvesting

-- The newsletter_subscriber table currently has admin-only policies which is correct,
-- but we need to ensure no other policies exist that might allow public read access

-- Double-check by explicitly dropping any potentially problematic policies
DROP POLICY IF EXISTS "public_read_newsletter_subscriber" ON public.newsletter_subscriber;
DROP POLICY IF EXISTS "anyone_can_read_newsletter_subscriber" ON public.newsletter_subscriber;

-- The existing policies should be:
-- 1. "admin read newsletter_subscriber" - admin only read ✓
-- 2. "admin delete newsletter_subscriber" - admin only delete ✓  
-- 3. "admin update newsletter_subscriber" - admin only update ✓
-- 4. "authenticated_users_can_subscribe" - authenticated users can insert ✓

-- All policies are correctly restrictive now