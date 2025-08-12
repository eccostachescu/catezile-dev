-- 0019_search.sql (retry without IF NOT EXISTS for policies)
-- Enable extensions
create extension if not exists unaccent with schema public;
create extension if not exists pg_trgm with schema public;
create extension if not exists citext with schema public;

-- EVENT: FTS + trigram
alter table public.event add column if not exists search_tsv tsvector;
create index if not exists idx_event_tsv on public.event using gin (search_tsv);
create index if not exists idx_event_title_trgm on public.event using gin (title gin_trgm_ops);

-- MATCH: FTS + trigram on teams
alter table public.match add column if not exists search_tsv tsvector;
create index if not exists idx_match_tsv on public.match using gin (search_tsv);
create index if not exists idx_match_home_trgm on public.match using gin ((home) gin_trgm_ops);
create index if not exists idx_match_away_trgm on public.match using gin ((away) gin_trgm_ops);

-- MOVIE: FTS + trigram
alter table public.movie add column if not exists search_tsv tsvector;
create index if not exists idx_movie_tsv on public.movie using gin (search_tsv);
create index if not exists idx_movie_title_trgm on public.movie using gin (title gin_trgm_ops);

-- COUNTDOWN: FTS + trigram
alter table public.countdown add column if not exists search_tsv tsvector;
create index if not exists idx_countdown_tsv on public.countdown using gin (search_tsv);
create index if not exists idx_countdown_title_trgm on public.countdown using gin (title gin_trgm_ops);

-- TAG taxonomy
create table if not exists public.tag (
  id uuid primary key default gen_random_uuid(),
  slug citext unique not null,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.event_tag (
  event_id uuid references public.event(id) on delete cascade,
  tag_id uuid references public.tag(id) on delete cascade,
  primary key (event_id, tag_id)
);
create index if not exists idx_event_tag_event on public.event_tag(event_id);
create index if not exists idx_event_tag_tag on public.event_tag(tag_id);

-- TV channels (navigable). Seed from tv_channel_alias canonical list
create table if not exists public.tv_channel (
  id uuid primary key default gen_random_uuid(),
  slug citext unique not null,
  name text not null,
  created_at timestamptz default now()
);

insert into public.tv_channel(slug, name)
select distinct lower(replace(canonical,' ','-')), canonical from public.tv_channel_alias
on conflict do nothing;

-- Optional synonyms for search tuning
create table if not exists public.search_synonym (
  canonical citext not null,
  term citext not null,
  created_at timestamptz default now(),
  primary key (canonical, term)
);

-- Unified search index
create table if not exists public.search_index (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('event','match','movie','countdown','team','tv','tag')),
  entity_id uuid,
  slug text,
  title text not null,
  subtitle text,
  when_at timestamptz,
  tv text[],
  popularity numeric default 0,
  search_text text not null,
  search_tsv tsvector,
  updated_at timestamptz default now()
);
create index if not exists idx_search_index_tsv on public.search_index using gin (search_tsv);
create index if not exists idx_search_index_trgm on public.search_index using gin (title gin_trgm_ops);
create index if not exists idx_search_index_when on public.search_index(when_at);
create index if not exists idx_search_index_kind on public.search_index(kind);

-- Helper: normalize text (unaccent and lower)
create or replace function public.normalize_text(input text)
returns text language sql immutable parallel safe as $$
  select lower(unaccent(coalesce(input,'')));
$$;

-- Refresh FTS columns on source tables
create or replace function public.refresh_search_row() returns trigger language plpgsql as $$
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
end;$$;

-- Column-specific triggers
create trigger _event_search_tsv after insert or update of title, description on public.event
  for each row execute function public.refresh_search_row();
create trigger _match_search_tsv after insert or update of home, away, tv_channels on public.match
  for each row execute function public.refresh_search_row();
create trigger _movie_search_tsv after insert or update of title, original_title, genres on public.movie
  for each row execute function public.refresh_search_row();
create trigger _countdown_search_tsv after insert or update of title on public.countdown
  for each row execute function public.refresh_search_row();

-- RLS policies
alter table public.tag enable row level security;
alter table public.event_tag enable row level security;
alter table public.tv_channel enable row level security;
alter table public.search_index enable row level security;
alter table public.search_synonym enable row level security;

-- public read
create policy public_read_tag on public.tag for select using (true);
create policy public_read_tv_channel on public.tv_channel for select using (true);
create policy public_read_event_tag on public.event_tag for select using (true);
create policy public_read_search_index on public.search_index for select using (true);

-- admin write
create policy admin_write_tag on public.tag for all using (is_admin()) with check (is_admin());
create policy admin_write_tv_channel on public.tv_channel for all using (is_admin()) with check (is_admin());
create policy admin_write_search_index on public.search_index for all using (is_admin()) with check (is_admin());
create policy admin_write_synonym on public.search_synonym for all using (is_admin()) with check (is_admin());

-- Seed initial FTS
update public.event set search_tsv = to_tsvector('simple', public.normalize_text(coalesce(title,'')||' '||coalesce(description,''))) where search_tsv is null;
update public.match set search_tsv = to_tsvector('simple', public.normalize_text(coalesce(home,'')||' '||coalesce(away,'')||' '||coalesce(array_to_string(tv_channels,' '),''))) where search_tsv is null;
update public.movie set search_tsv = to_tsvector('simple', public.normalize_text(coalesce(title,'')||' '||coalesce(original_title,'')||' '||coalesce(array_to_string(genres,' '),''))) where search_tsv is null;
update public.countdown set search_tsv = to_tsvector('simple', public.normalize_text(coalesce(title,''))) where search_tsv is null;