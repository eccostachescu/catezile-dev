-- Extinderi pentru filme
alter table public.movie
  add column if not exists original_title text,
  add column if not exists overview text,
  add column if not exists backdrop_url text,
  add column if not exists trailer_youtube_key text,
  add column if not exists genres text[] default '{}'::text[],
  add column if not exists provider jsonb default '{}'::jsonb,
  add column if not exists source jsonb default '{}'::jsonb;

-- Indexe pentru filtre
create index if not exists idx_movie_genres on public.movie using gin (genres);
create index if not exists idx_movie_status on public.movie(status);