-- Clean up duplicate RLS policies on profile table and ensure proper security
-- Drop existing policies
DROP POLICY IF EXISTS "own profile" ON public.profile;
DROP POLICY IF EXISTS "own profile update" ON public.profile;
DROP POLICY IF EXISTS "select own profile" ON public.profile;
DROP POLICY IF EXISTS "update own profile" ON public.profile;

-- Create clean, secure policies
-- Users can only select their own profile, admins can select all
CREATE POLICY "users_can_view_own_profile" ON public.profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_admin());

-- Users can only update their own profile
CREATE POLICY "users_can_update_own_profile" ON public.profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No public insert or delete allowed (profiles are created via trigger)
-- Ensure only the system can insert profiles
CREATE POLICY "system_can_insert_profiles" ON public.profile
  FOR INSERT
  TO authenticated
  WITH CHECK (false); -- Block all inserts via API, only triggers can insert