-- 0019_search_fix_unaccent.sql
CREATE OR REPLACE FUNCTION public.normalize_text(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE
SET search_path TO 'public'
AS $$
  select lower(extensions.unaccent(coalesce(input,'')));
$$;