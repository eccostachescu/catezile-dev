-- Fix search path issue for set_updated_at_tv_program function
CREATE OR REPLACE FUNCTION public.set_updated_at_tv_program()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;