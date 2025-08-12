-- 0019_search_fix_security.sql
-- Move extensions to extensions schema when possible
create schema if not exists extensions;
-- Try setting extension schema (will fail if not installed in public or lacks permission, which is fine in transaction?)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'unaccent') THEN
    ALTER EXTENSION unaccent SET SCHEMA extensions;
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    ALTER EXTENSION pg_trgm SET SCHEMA extensions;
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'citext') THEN
    ALTER EXTENSION citext SET SCHEMA extensions;
  END IF;
END $$;

-- Recreate functions with explicit search_path
CREATE OR REPLACE FUNCTION public.normalize_text(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE
SET search_path TO 'public'
AS $$
  select lower(unaccent(coalesce(input,'')));
$$;

CREATE OR REPLACE FUNCTION public.refresh_search_row()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  if tg_table_name = 'event' then
    update public.event set search_tsv = to_tsvector('simple', public.normalize_text(coalesce(title,'')||' '||coalesce(description,''))) where id=new.id;
  elsif tg_table_name = 'match' then
    update public.match set search_tsv = to_tsvector('simple', public.normalize_text(coalesce(home,'')||' '||coalesce(away,'')||' '||coalesce(array_to_string(tv_channels,' '),''))) where id=new.id;
  elsif tg_table_name = 'movie' then
    update public.movie set search_tsv = to_tsvector('simple', public.normalize_text(coalesce(title,'')||' '||coalesce(original_title,'')||' '||coalesce(array_to_string(genres,' '),''))) where id=new.id;
  elsif tg_table_name = 'countdown' then
    update public.countdown set search_tsv = to_tsvector('simple', public.normalize_text(coalesce(title,''))) where id=new.id;
  end if;
  return null;
end;
$$;