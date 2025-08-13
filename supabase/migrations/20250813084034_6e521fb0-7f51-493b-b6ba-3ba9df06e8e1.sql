-- Fix database security linting issues

-- 1. Fix function search paths to be immutable
-- Update functions that don't have proper search_path set
CREATE OR REPLACE FUNCTION public.normalize_text(input text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
 SET search_path TO 'public'
AS $function$
  select lower(translate(coalesce(input,''), 'șşȘŞțţȚŢăĂâÂîÎ', 'ssSSttTTaAaAiI'));
$function$;

CREATE OR REPLACE FUNCTION public.slugify(txt text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
declare s text;
begin
  s := lower(txt);
  s := translate(s, 'ăâîșşțţÁÂÎȘŞȚŢĂ', 'aaissttAAISSTTA');
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := regexp_replace(s, '(^-|-$)', '', 'g');
  return s;
end$function$;

CREATE OR REPLACE FUNCTION public.render_template(tmpl text, vars jsonb)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
declare out text := tmpl;
declare k text; v text;
begin
  for k, v in select key, value::text from jsonb_each(vars) loop
    out := replace(out, '{{' || k || '}}', coalesce(v,''));
  end loop;
  return trim(out);
end$function$;

CREATE OR REPLACE FUNCTION public.ugc_quota_exceeded(p_user uuid, p_kind text DEFAULT 'countdown'::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT count(*) >= 3 FROM public.ugc_quota
  WHERE user_id = p_user AND kind = p_kind AND created_at > now() - interval '24 hours';
$function$;

CREATE OR REPLACE FUNCTION public.current_user_email()
 RETURNS text
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(nullif((current_setting('request.jwt.claims', true)::json->>'email'), ''), null);
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.profile p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
  or exists (
    select 1 from public.admin_emails a
    where a.email = public.current_user_email()
  );
$function$;

-- 2. Enable RLS and create policies for tables missing protection

-- Enable RLS on standings_regular table
ALTER TABLE public.standings_regular ENABLE ROW LEVEL SECURITY;

-- Create policy for standings_regular (public read access)
CREATE POLICY "public_read_standings_regular" ON public.standings_regular
  FOR SELECT
  TO public
  USING (true);

-- Create admin write policy for standings_regular
CREATE POLICY "admin_write_standings_regular" ON public.standings_regular
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Enable RLS on static_pages table  
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;

-- Create policy for static_pages (public read access)
CREATE POLICY "public_read_static_pages" ON public.static_pages
  FOR SELECT
  TO public
  USING (true);

-- Create admin write policy for static_pages
CREATE POLICY "admin_write_static_pages" ON public.static_pages
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Complete the ugc_queue table structure if it's incomplete
DO $$
BEGIN
  -- Check if ugc_queue table exists and has proper columns
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ugc_queue') THEN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ugc_queue' AND column_name = 'id') THEN
      ALTER TABLE public.ugc_queue ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ugc_queue' AND column_name = 'user_id') THEN
      ALTER TABLE public.ugc_queue ADD COLUMN user_id uuid NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ugc_queue' AND column_name = 'kind') THEN
      ALTER TABLE public.ugc_queue ADD COLUMN kind text NOT NULL DEFAULT 'countdown';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ugc_queue' AND column_name = 'status') THEN
      ALTER TABLE public.ugc_queue ADD COLUMN status text NOT NULL DEFAULT 'PENDING';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ugc_queue' AND column_name = 'created_at') THEN
      ALTER TABLE public.ugc_queue ADD COLUMN created_at timestamp with time zone DEFAULT now();
    END IF;
    
    -- Enable RLS on ugc_queue table
    ALTER TABLE public.ugc_queue ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for ugc_queue (users can only see their own entries)
    DROP POLICY IF EXISTS "users_own_ugc_queue" ON public.ugc_queue;
    CREATE POLICY "users_own_ugc_queue" ON public.ugc_queue
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
      
    -- Admin can see all
    DROP POLICY IF EXISTS "admin_all_ugc_queue" ON public.ugc_queue;
    CREATE POLICY "admin_all_ugc_queue" ON public.ugc_queue
      FOR ALL
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END
$$;