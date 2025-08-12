-- 0019_search_index_unique.sql
create unique index if not exists uniq_search_kind_entity on public.search_index(kind, entity_id);