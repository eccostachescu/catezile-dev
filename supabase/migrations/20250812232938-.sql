-- Patch: set immutable search_path for updated_at function
CREATE OR REPLACE FUNCTION public.set_updated_at_tv_program()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;