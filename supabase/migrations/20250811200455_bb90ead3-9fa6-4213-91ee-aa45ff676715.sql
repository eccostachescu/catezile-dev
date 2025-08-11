-- Fix 1: Prevent privilege escalation on profiles (role/email changes by non-admins)
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  -- Only admins can change role
  if (new.role is distinct from old.role) and not public.is_admin() then
    raise exception 'Only admins can change role';
  end if;

  -- Only admins can change email
  if (new.email is distinct from old.email) and not public.is_admin() then
    raise exception 'Only admins can change email';
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_profile_prevent_privilege_escalation ON public.profile;
CREATE TRIGGER trg_profile_prevent_privilege_escalation
BEFORE UPDATE ON public.profile
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- Fix 2: Prevent users from self-approving countdowns or transferring ownership
CREATE OR REPLACE FUNCTION public.enforce_countdown_owner_and_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  -- Only admins can change ownership
  if (new.owner_id is distinct from old.owner_id) and not public.is_admin() then
    raise exception 'Only admins can change owner_id';
  end if;

  -- Only admins can change status (e.g., self-approve)
  if (new.status is distinct from old.status) and not public.is_admin() then
    raise exception 'Only admins can change status';
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_countdown_enforce_owner_status ON public.countdown;
CREATE TRIGGER trg_countdown_enforce_owner_status
BEFORE UPDATE ON public.countdown
FOR EACH ROW
EXECUTE FUNCTION public.enforce_countdown_owner_and_status();

-- Fix 3: Strengthen RLS for countdown updates so owner_id must remain the same for non-admins
DROP POLICY IF EXISTS "owner update/delete countdown" ON public.countdown;

CREATE POLICY "owner update countdown"
ON public.countdown
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Ensure delete by owner is permitted (if not already defined)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'countdown' AND policyname = 'owner delete countdown'
  ) THEN
    CREATE POLICY "owner delete countdown"
    ON public.countdown
    FOR DELETE
    USING (owner_id = auth.uid());
  END IF;
END$$;