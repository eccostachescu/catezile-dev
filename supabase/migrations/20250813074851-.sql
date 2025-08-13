-- Fix linter ERROR 0010: Security Definer View
-- Switch public views to SQL SECURITY INVOKER to ensure queries run with caller permissions
-- This is safe and preserves functionality (views only read from allowed sources)

DO $$
BEGIN
  -- Make static_pages a SECURITY INVOKER view (idempotent)
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'static_pages' AND c.relkind = 'v'
  ) THEN
    EXECUTE 'ALTER VIEW public.static_pages SET (security_invoker = true)';
  END IF;

  -- Ensure ugc_queue is also SECURITY INVOKER (idempotent safety)
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'ugc_queue' AND c.relkind = 'v'
  ) THEN
    EXECUTE 'ALTER VIEW public.ugc_queue SET (security_invoker = true)';
  END IF;
END$$;