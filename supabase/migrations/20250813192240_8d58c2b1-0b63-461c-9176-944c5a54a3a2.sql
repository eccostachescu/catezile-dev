-- Critical Security Fixes - Fixed Version
-- Fix 1: Secure profile table - Remove public access and ensure only own profile access

-- Drop existing policies first
DROP POLICY IF EXISTS "users_view_own_profile_secure" ON public.profile;
DROP POLICY IF EXISTS "users_update_own_profile_secure" ON public.profile;
DROP POLICY IF EXISTS "block_direct_profile_deletes" ON public.profile;
DROP POLICY IF EXISTS "block_direct_profile_inserts" ON public.profile;

-- Create secure profile policies
CREATE POLICY "users_can_view_own_profile_only" 
ON public.profile 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile_only" 
ON public.profile 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Block direct inserts/deletes - these should only happen via triggers
CREATE POLICY "block_profile_inserts" 
ON public.profile 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "block_profile_deletes" 
ON public.profile 
FOR DELETE 
USING (false);

-- Fix 2: Fix newsletter_subscriber table - Make it completely private except for admin functions
DROP POLICY IF EXISTS "block_direct_newsletter_access" ON public.newsletter_subscriber;
DROP POLICY IF EXISTS "secure_newsletter_subscription" ON public.newsletter_subscriber;

-- Only allow edge functions to insert (not authenticated users directly)
CREATE POLICY "newsletter_no_direct_access" 
ON public.newsletter_subscriber 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Fix 3: Add missing venue table security (create table first)
CREATE TABLE IF NOT EXISTS public.venue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on venue table
ALTER TABLE public.venue ENABLE ROW LEVEL SECURITY;

-- Drop and recreate venue policies
DROP POLICY IF EXISTS "venue_admin_only" ON public.venue;
CREATE POLICY "venue_admin_only" 
ON public.venue 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Add additional security function to check if user can access profile data
CREATE OR REPLACE FUNCTION public.can_access_profile(profile_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        auth.uid() = profile_id OR 
        public.is_admin()
$$;