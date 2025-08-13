-- Fix remaining functions with mutable search_path

-- Fix refresh_search_row function
CREATE OR REPLACE FUNCTION public.refresh_search_row()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
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

-- Fix set_updated_at_tv_program function
CREATE OR REPLACE FUNCTION public.set_updated_at_tv_program()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix get_movie_next_date function
CREATE OR REPLACE FUNCTION public.get_movie_next_date(movie_row movie)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = 'public'
AS $$
DECLARE
  next_date date;
  platform_name text;
  date_type text;
BEGIN
  -- Check cinema release first (priority)
  IF movie_row.cinema_release_ro IS NOT NULL AND movie_row.cinema_release_ro > CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'date', movie_row.cinema_release_ro,
      'type', 'cinema',
      'platform', 'Cinema'
    );
  END IF;
  
  -- Check streaming platforms
  SELECT mp.available_from, op.name
  INTO next_date, platform_name
  FROM public.movie_platform mp
  JOIN public.ott_platform op ON mp.platform_id = op.id
  WHERE mp.movie_id = movie_row.id 
    AND mp.available_from > CURRENT_DATE
  ORDER BY mp.available_from ASC
  LIMIT 1;
  
  IF next_date IS NOT NULL THEN
    RETURN jsonb_build_object(
      'date', next_date,
      'type', 'streaming',
      'platform', platform_name
    );
  END IF;
  
  -- Check if already in cinema
  IF movie_row.cinema_release_ro IS NOT NULL AND movie_row.cinema_release_ro <= CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'date', movie_row.cinema_release_ro,
      'type', 'released',
      'platform', 'Cinema'
    );
  END IF;
  
  RETURN NULL;
END;
$$;

-- Fix set_updated_at_holiday function
CREATE OR REPLACE FUNCTION public.set_updated_at_holiday()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix enforce_countdown_owner_and_status function
CREATE OR REPLACE FUNCTION public.enforce_countdown_owner_and_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
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

-- Fix set_updated_at function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;