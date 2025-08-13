-- Migration 0025: Movies Final Module
-- Extends existing movie table and adds OTT platform support

-- 1) Extend movie table with all TMDB fields
ALTER TABLE public.movie 
  ADD COLUMN IF NOT EXISTS tmdb_id integer UNIQUE,
  ADD COLUMN IF NOT EXISTS original_title text,
  ADD COLUMN IF NOT EXISTS overview text,
  ADD COLUMN IF NOT EXISTS poster_path text,
  ADD COLUMN IF NOT EXISTS backdrop_path text,
  ADD COLUMN IF NOT EXISTS runtime smallint,
  ADD COLUMN IF NOT EXISTS genres text[],
  ADD COLUMN IF NOT EXISTS certification text,
  ADD COLUMN IF NOT EXISTS cinema_release_ro date,
  ADD COLUMN IF NOT EXISTS streaming_ro jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS release_calendar jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS trailer_key text,
  ADD COLUMN IF NOT EXISTS popularity numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_ext_at timestamptz;

-- Update status column to include new values
ALTER TABLE public.movie DROP CONSTRAINT IF EXISTS movie_status_check;
ALTER TABLE public.movie ADD CONSTRAINT movie_status_check 
  CHECK (status IN ('SCHEDULED','RELEASED','DELAYED','TBA'));

-- 2) Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_movie_cinema_ro ON public.movie(cinema_release_ro);
CREATE INDEX IF NOT EXISTS idx_movie_popularity ON public.movie(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_movie_tmdb_id ON public.movie(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movie_status ON public.movie(status);

-- 3) OTT platforms lookup table
CREATE TABLE IF NOT EXISTS public.ott_platform (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug citext UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert common OTT platforms
INSERT INTO public.ott_platform(slug, name) VALUES
  ('netflix', 'Netflix'),
  ('prime', 'Amazon Prime Video'),
  ('max', 'Max'),
  ('hbo-max', 'HBO Max'),
  ('disney', 'Disney+'),
  ('apple-tv', 'Apple TV+'),
  ('hbo-go', 'HBO GO'),
  ('voyo', 'Voyo')
ON CONFLICT (slug) DO NOTHING;

-- 4) Movie-platform mapping for manual overrides
CREATE TABLE IF NOT EXISTS public.movie_platform (
  movie_id uuid REFERENCES public.movie(id) ON DELETE CASCADE,
  platform_id uuid REFERENCES public.ott_platform(id) ON DELETE CASCADE,
  available_from date,
  url text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (movie_id, platform_id)
);

-- 5) Enable RLS on new tables
ALTER TABLE public.ott_platform ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_platform ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "ott_platform_read" ON public.ott_platform 
  FOR SELECT USING (true);

CREATE POLICY "ott_platform_admin" ON public.ott_platform 
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "movie_platform_read" ON public.movie_platform 
  FOR SELECT USING (true);

CREATE POLICY "movie_platform_admin" ON public.movie_platform 
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Update movie table RLS to be admin-only for writes
DROP POLICY IF EXISTS "movie_no_direct_write" ON public.movie;
CREATE POLICY "movie_admin_write" ON public.movie 
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 6) Create function to get next relevant date for a movie
CREATE OR REPLACE FUNCTION public.get_movie_next_date(movie_row public.movie)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
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
$function$;