-- Fix Function Search Path Mutable security issue
-- Add secure search_path settings to functions that don't have them

-- Fix current_user_email function
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  select coalesce(nullif((current_setting('request.jwt.claims', true)::json->>'email'), ''), null);
$$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  select exists (
    select 1 from public.profile p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
  or exists (
    select 1 from public.admin_emails a
    where a.email = public.current_user_email()
  );
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
begin
  insert into public.profile (id, email, display_name)
  values (new.id, new.email, split_part(new.email,'@',1))
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  if lower(new.email) = lower('eccostachescu@gmail.com') then
    update public.profile set role = 'ADMIN' where id = new.id;
  end if;

  return new;
end;
$$;

-- Fix slugify function
CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $$
declare s text;
begin
  s := lower(txt);
  s := translate(s, 'ăâîșşțţÁÂÎȘŞȚŢĂ', 'aaissttAAISSTTA');
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := regexp_replace(s, '(^-|-$)', '', 'g');
  return s;
end;
$$;

-- Fix normalize_text function
CREATE OR REPLACE FUNCTION public.normalize_text(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE
SET search_path = 'public'
AS $$
  select lower(translate(coalesce(input,''), 'șşȘŞțţȚŢăĂâÂîÎ', 'ssSSttTTaAaAiI'));
$$;

-- Fix render_template function
CREATE OR REPLACE FUNCTION public.render_template(tmpl text, vars jsonb)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $$
declare out text := tmpl;
declare k text; v text;
begin
  for k, v in select key, value::text from jsonb_each(vars) loop
    out := replace(out, '{{' || k || '}}', coalesce(v,''));
  end loop;
  return trim(out);
end;
$$;

-- Fix ugc_quota_exceeded function
CREATE OR REPLACE FUNCTION public.ugc_quota_exceeded(p_user uuid, p_kind text DEFAULT 'countdown'::text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT count(*) >= 3 FROM public.ugc_quota
  WHERE user_id = p_user AND kind = p_kind AND created_at > now() - interval '24 hours';
$$;