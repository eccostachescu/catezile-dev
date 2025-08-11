-- 0003_security_fixes.sql
begin;

-- Enable RLS on remaining public tables
alter table public.admin_emails enable row level security;
alter table public.settings enable row level security;
alter table public.seo_template enable row level security;
alter table public.ad_slot enable row level security;
alter table public.competition enable row level security;
alter table public.ingestion_log enable row level security;

-- Policies
-- admin_emails: admin only
create policy "admin read admin_emails" on public.admin_emails for select using (public.is_admin());
create policy "admin write admin_emails" on public.admin_emails for all using (public.is_admin()) with check (public.is_admin());

-- settings: public read; admin write
create policy "public read settings" on public.settings for select using (true);
create policy "admin write settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- seo_template: public read; admin write
create policy "public read seo_template" on public.seo_template for select using (true);
create policy "admin write seo_template" on public.seo_template for all using (public.is_admin()) with check (public.is_admin());

-- ad_slot: admin only
create policy "admin ad_slot" on public.ad_slot for all using (public.is_admin()) with check (public.is_admin());

-- competition: public read; admin write
create policy "public read competition" on public.competition for select using (true);
create policy "admin write competition" on public.competition for all using (public.is_admin()) with check (public.is_admin());

-- ingestion_log: admin only
create policy "admin read logs" on public.ingestion_log for select using (public.is_admin());
create policy "admin write logs" on public.ingestion_log for all using (public.is_admin()) with check (public.is_admin());

-- Harden functions: set explicit search_path
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_email()
returns text
language sql stable
set search_path = public
as $$
  select coalesce(nullif((current_setting('request.jwt.claims', true)::json->>'email'), ''), null);
$$;

create or replace function public.slugify(txt text)
returns text language plpgsql
set search_path = public
as $$
declare s text;
begin
  s := lower(txt);
  s := translate(s, 'ăâîșşțţÁÂÎȘŞȚŢĂ', 'aaissttAAISSTTA');
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := regexp_replace(s, '(^-|-$)', '', 'g');
  return s;
end$$;

create or replace function public.render_template(tmpl text, vars jsonb)
returns text language plpgsql
set search_path = public
as $$
declare out text := tmpl;
declare k text; v text;
begin
  for k, v in select key, value::text from jsonb_each(vars) loop
    out := replace(out, '{{' || k || '}}', coalesce(v,''));
  end loop;
  return trim(out);
end$$;

create or replace function public.compute_event_seo(e public.event)
returns public.event language plpgsql
set search_path = public
as $$
declare tmpl record; vars jsonb; y text;
begin
  y := to_char(e.start_at at time zone e.timezone, 'YYYY');
  select * into tmpl from public.seo_template where entity_type='event'
    and (code = coalesce((select slug from public.category where id = e.category_id), 'default') or is_default)
    order by is_default desc limit 1;
  vars := jsonb_build_object(
    'title', e.title,
    'date_ro', to_char(e.start_at at time zone e.timezone, 'DD MON YYYY'),
    'year', y,
    'city', coalesce(e.city,''),
    'category', coalesce((select name from public.category c where c.id=e.category_id),'')
  );
  e.seo_title := coalesce(e.seo_title, public.render_template(coalesce(tmpl.title_tmpl,'{{title}} ({{year}})'), vars));
  e.seo_description := coalesce(e.seo_description, public.render_template(coalesce(tmpl.meta_desc_tmpl,'Află în câte zile până la {{title}} ({{date_ro}}).'), vars));
  e.seo_h1 := coalesce(e.seo_h1, public.render_template(coalesce(tmpl.h1_tmpl,'Câte zile până la {{title}}?'), vars));
  e.og_theme := coalesce(e.og_theme, coalesce(tmpl.og_theme,'T2'));
  if e.slug is null or e.slug = '' then e.slug := public.slugify(e.title || '-' || y); end if;
  return e;
end$$;

create or replace function public.event_before_insert()
returns trigger language plpgsql
set search_path = public
as $$
begin new := public.compute_event_seo(new); return new; end$$;

create or replace function public.event_before_update()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if (new.title is distinct from old.title) or (new.start_at is distinct from old.start_at) or (new.category_id is distinct from old.category_id) then
    new := public.compute_event_seo(new);
  end if;
  return new;
end$$;

create or replace function public.compute_match_seo(m public.match)
returns public.match language plpgsql
set search_path = public
as $$
declare tmpl record; vars jsonb; d text; t text;
begin
  select * into tmpl from public.seo_template where entity_type='match'
    and (code = coalesce((select code from public.competition where id = m.competition_id),'default') or is_default)
    order by is_default desc limit 1;
  d := to_char(m.kickoff_at at time zone 'Europe/Bucharest', 'DD MON YYYY');
  t := to_char(m.kickoff_at at time zone 'Europe/Bucharest', 'HH24:MI');
  vars := jsonb_build_object(
    'home', m.home,
    'away', m.away,
    'date_ro', d,
    'time_ro', t,
    'tv', array_to_string(coalesce(m.tv_channels,'{}'), ', ')
  );
  m.seo_title := coalesce(m.seo_title, public.render_template(coalesce(tmpl.title_tmpl,'{{home}} vs {{away}} — {{date_ro}} {{time_ro}}'), vars));
  m.seo_description := coalesce(m.seo_description, public.render_template(coalesce(tmpl.meta_desc_tmpl,'Pe ce canal e {{home}} – {{away}}? Ora {{time_ro}}, {{date_ro}}. Canale: {{tv}}.'), vars));
  m.seo_h1 := coalesce(m.seo_h1, public.render_template(coalesce(tmpl.h1_tmpl,'{{home}} – {{away}}: ora și canal TV'), vars));
  if m.slug is null or m.slug = '' then m.slug := public.slugify(m.home || '-' || m.away || '-' || d); end if;
  return m;
end$$;

create or replace function public.match_bi() returns trigger language plpgsql
set search_path = public
as $$
begin new := public.compute_match_seo(new); return new; end$$;

create or replace function public.match_bu() returns trigger language plpgsql
set search_path = public
as $$
begin if (new.home, new.away, new.kickoff_at) is distinct from (old.home, old.away, old.kickoff_at) then new := public.compute_match_seo(new); end if; return new; end$$;

create or replace function public.compute_movie_seo(x public.movie)
returns public.movie language plpgsql
set search_path = public
as $$
begin
  if x.slug is null or x.slug = '' then x.slug := public.slugify(x.title); end if;
  x.seo_title := coalesce(x.seo_title, x.title || ' — Data lansării în România');
  x.seo_description := coalesce(x.seo_description, 'Când apare ' || x.title || ' la cinema în România și pe Netflix/Prime.');
  x.seo_h1 := coalesce(x.seo_h1, 'Când apare ' || x.title || '?');
  return x;
end$$;

create or replace function public.movie_bi() returns trigger language plpgsql
set search_path = public
as $$
begin new := public.compute_movie_seo(new); return new; end$$;

create or replace function public.movie_bu() returns trigger language plpgsql
set search_path = public
as $$
begin if (new.title is distinct from old.title) then new := public.compute_movie_seo(new); end if; return new; end$$;

create or replace function public.countdown_bi() returns trigger language plpgsql
set search_path = public
as $$
begin
  if new.owner_id is null then new.owner_id := auth.uid(); end if;
  if new.slug is null or new.slug='' then new.slug := public.slugify(new.title || '-' || to_char(new.target_at, 'YYYYMMDD')); end if;
  if new.seo_title is null then new.seo_title := new.title || ' — Câte zile au rămas'; end if;
  if new.seo_description is null then new.seo_description := 'Vezi câte zile au rămas până la ' || new.title || '.'; end if;
  if new.seo_h1 is null then new.seo_h1 := 'Câte zile până la ' || new.title || '?'; end if;
  return new;
end$$;

commit;