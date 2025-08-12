-- Movies extra columns and indexes (Prompt 13)
ALTER TABLE public.movie
  ADD COLUMN IF NOT EXISTS original_title text,
  ADD COLUMN IF NOT EXISTS overview text,
  ADD COLUMN IF NOT EXISTS backdrop_url text,
  ADD COLUMN IF NOT EXISTS trailer_youtube_key text,
  ADD COLUMN IF NOT EXISTS genres text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS provider jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source jsonb DEFAULT '{}'::jsonb;

-- Indexes for filters
CREATE INDEX IF NOT EXISTS idx_movie_genres ON public.movie USING GIN (genres);
CREATE INDEX IF NOT EXISTS idx_movie_status ON public.movie(status);