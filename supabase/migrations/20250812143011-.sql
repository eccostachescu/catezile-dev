-- 0014_events_general.sql
-- Categorii standard (dacă nu există deja)
insert into public.category (slug, name)
select 'sarbatori','Sărbători'
where not exists (select 1 from public.category where slug = 'sarbatori');

insert into public.category (slug, name)
select 'examene','Examene'
where not exists (select 1 from public.category where slug = 'examene');

insert into public.category (slug, name)
select 'festivaluri','Festivaluri'
where not exists (select 1 from public.category where slug = 'festivaluri');

-- Extinderi event
alter table public.event
  add column if not exists location_city text,
  add column if not exists country text default 'RO',
  add column if not exists is_recurring boolean default false,
  add column if not exists rrule text,
  add column if not exists official_source_url text,
  add column if not exists verified_at timestamptz,
  add column if not exists editorial_status text check (editorial_status in ('DRAFT','REVIEW','PUBLISHED')) default 'DRAFT';

-- Indexe utile
create index if not exists idx_event_editorial on public.event(editorial_status);
create index if not exists idx_event_category_start on public.event(category_id, start_at);

-- Șabloane SEO pe categorie (pentru evenimente)
-- Folosim compute_event_seo care alege șablonul pe baza category.slug
insert into public.seo_template (entity_type, code, title_tmpl, meta_desc_tmpl, h1_tmpl, og_theme, is_default)
select 'event','sarbatori',
  '{{title}} — {{year}} (România) | Câte zile până la {{title}}?',
  'Află când este {{title}} în {{year}}, câte zile mai sunt și dacă este zi liberă legală.',
  'Când este {{title}} în {{year}}?',
  'T2', false
where not exists (
  select 1 from public.seo_template where entity_type='event' and code='sarbatori'
);

insert into public.seo_template (entity_type, code, title_tmpl, meta_desc_tmpl, h1_tmpl, og_theme, is_default)
select 'event','examene',
  '{{title}} {{year}} — Calendar, probe, rezultate',
  'Date oficiale pentru {{title}} {{year}}: înscriere, probe scrise, rezultate.',
  '{{title}} {{year}}: calendar și rezultate',
  'T2', false
where not exists (
  select 1 from public.seo_template where entity_type='event' and code='examene'
);

insert into public.seo_template (entity_type, code, title_tmpl, meta_desc_tmpl, h1_tmpl, og_theme, is_default)
select 'event','festivaluri',
  '{{title}} {{year}} — Date, program, bilete',
  'Când are loc {{title}} în {{city}}. Program, bilete și informații utile.',
  'Când are loc {{title}}?',
  'T2', false
where not exists (
  select 1 from public.seo_template where entity_type='event' and code='festivaluri'
);
