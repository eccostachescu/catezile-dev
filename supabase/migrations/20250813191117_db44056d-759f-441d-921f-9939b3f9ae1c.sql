-- Add remaining secure admin functions

-- Secure function for admin profile access with audit logging
CREATE OR REPLACE FUNCTION public.admin_get_profile_with_audit(
  profile_id UUID,
  admin_reason TEXT DEFAULT 'Profile review'
)
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  handle TEXT,
  avatar_url TEXT,
  email TEXT,
  locale TEXT,
  timezone TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Log the access
  INSERT INTO public.admin_audit_log (admin_id, action, table_name, record_id)
  VALUES (auth.uid(), admin_reason, 'profile', profile_id);
  
  -- Return profile data
  RETURN QUERY
  SELECT 
    p.id,
    p.display_name,
    p.handle,
    p.avatar_url,
    p.email,
    p.locale,
    p.timezone,
    p.role,
    p.created_at,
    p.updated_at
  FROM public.profile p
  WHERE p.id = profile_id;
END;
$$;

-- Audit-logged admin function for newsletter management
CREATE OR REPLACE FUNCTION public.admin_newsletter_action(
  action_type TEXT,
  email_address TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Log the action
  INSERT INTO public.admin_audit_log (admin_id, action, table_name)
  VALUES (auth.uid(), 'newsletter_' || action_type, 'newsletter_subscriber');
  
  -- Execute action based on type
  CASE action_type
    WHEN 'count' THEN
      SELECT jsonb_build_object('count', COUNT(*)) INTO result
      FROM public.newsletter_subscriber;
    WHEN 'delete' THEN
      IF email_address IS NULL THEN
        RAISE EXCEPTION 'Email address required for delete action';
      END IF;
      DELETE FROM public.newsletter_subscriber WHERE email = email_address;
      result := jsonb_build_object('deleted', email_address);
    ELSE
      RAISE EXCEPTION 'Invalid action type: %', action_type;
  END CASE;
  
  RETURN result;
END;
$$;

-- Secure admin dashboard functions that replace direct table access
CREATE OR REPLACE FUNCTION public.admin_get_user_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Log the access
  INSERT INTO public.admin_audit_log (admin_id, action, table_name)
  VALUES (auth.uid(), 'user_stats_access', 'profile');
  
  -- Return aggregated stats without exposing individual emails
  SELECT jsonb_build_object(
    'total_users', COUNT(*),
    'users_with_display_name', COUNT(*) FILTER (WHERE display_name IS NOT NULL),
    'admin_count', COUNT(*) FILTER (WHERE role = 'ADMIN'),
    'user_count', COUNT(*) FILTER (WHERE role = 'USER')
  ) INTO result
  FROM public.profile;
  
  RETURN result;
END;
$$;