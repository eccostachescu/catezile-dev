-- 0019_search_normalize_no_unaccent.sql
CREATE OR REPLACE FUNCTION public.normalize_text(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE
SET search_path TO 'public'
AS $$
  select lower(translate(coalesce(input,''), 'șşȘŞțţȚŢăĂâÂîÎ', 'ssSSttTTaAaAiI'));
$$;

-- Recompute seeded FTS using new normalizer
update public.event set search_tsv = to_tsvector('simple', public.normalize_text(coalesce(title,'')||' '||coalesce(description,'')));
update public.match set search_tsv = to_tsvector('simple', public.normalize_text(coalesce(home,'')||' '||coalesce(away,'')||' '||coalesce(array_to_string(tv_channels,' '),'')));
update public.movie set search_tsv = to_tsvector('simple', public.normalize_text(coalesce(title,'')||' '||coalesce(original_title,'')||' '||coalesce(array_to_string(genres,' '),'')));
update public.countdown set search_tsv = to_tsvector('simple', public.normalize_text(coalesce(title,'')));