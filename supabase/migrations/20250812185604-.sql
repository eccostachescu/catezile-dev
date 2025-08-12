-- 0019_search_filters.sql
alter table public.search_index add column if not exists genres text[];
alter table public.search_index add column if not exists category_slug text;
create index if not exists idx_search_index_genres on public.search_index using gin (genres);
create index if not exists idx_search_index_category on public.search_index(category_slug);
