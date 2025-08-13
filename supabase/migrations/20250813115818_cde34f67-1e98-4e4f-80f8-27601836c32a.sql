-- Fix Extension in Public security issue
-- Move extensions from public schema to dedicated extensions schema

-- Create a dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema to necessary roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Drop and recreate the unaccent extension in the extensions schema
-- First check if it exists and drop it from public
DROP EXTENSION IF EXISTS unaccent CASCADE;

-- Create the extension in the extensions schema
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA extensions;

-- Recreate the unaccent functions in public schema that reference the extension
-- These functions are used by the normalize_text function
CREATE OR REPLACE FUNCTION public.unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE STRICT
SET search_path = 'public'
AS $$
  SELECT extensions.unaccent('extensions.unaccent', $1);
$$;

-- Update the normalize_text function to work with the new setup
CREATE OR REPLACE FUNCTION public.normalize_text(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE
SET search_path = 'public'
AS $$
  select lower(translate(coalesce(input,''), 'șşȘŞțţȚŢăĂâÂîÎ', 'ssSSttTTaAaAiI'));
$$;

-- Check for and move other common extensions that might be in public
-- Move pg_trgm if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    DROP EXTENSION pg_trgm CASCADE;
    CREATE EXTENSION pg_trgm SCHEMA extensions;
  END IF;
END $$;

-- Move uuid-ossp if it exists  
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    DROP EXTENSION "uuid-ossp" CASCADE;
    CREATE EXTENSION "uuid-ossp" SCHEMA extensions;
  END IF;
END $$;

-- Move pgcrypto if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    DROP EXTENSION pgcrypto CASCADE;
    CREATE EXTENSION pgcrypto SCHEMA extensions;
  END IF;
END $$;