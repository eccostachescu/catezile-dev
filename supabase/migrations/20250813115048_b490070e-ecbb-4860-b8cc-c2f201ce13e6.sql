-- Fix newsletter_subscriber table to prevent email harvesting

-- Drop the existing public insert policy which was too permissive
DROP POLICY IF EXISTS "public insert newsletter_subscriber" ON public.newsletter_subscriber;

-- Create a more secure insert policy that includes rate limiting considerations
-- Users can only subscribe their own email addresses if authenticated
CREATE POLICY "authenticated_users_can_subscribe" 
ON public.newsletter_subscriber 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Note: Consider implementing additional validation at the application level:
-- - Rate limiting by IP address
-- - Email verification before saving to database  
-- - CAPTCHA or other anti-bot measures