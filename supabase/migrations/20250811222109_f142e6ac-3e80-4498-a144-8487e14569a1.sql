-- Create newsletter_subscriber table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscriber ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  -- Allow anyone (including anon) to insert a subscription
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'newsletter_subscriber' AND policyname = 'public insert newsletter_subscriber'
  ) THEN
    CREATE POLICY "public insert newsletter_subscriber"
      ON public.newsletter_subscriber
      FOR INSERT
      WITH CHECK (true);
  END IF;

  -- Only admins can read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'newsletter_subscriber' AND policyname = 'admin read newsletter_subscriber'
  ) THEN
    CREATE POLICY "admin read newsletter_subscriber"
      ON public.newsletter_subscriber
      FOR SELECT
      USING (is_admin());
  END IF;

  -- Only admins can update
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'newsletter_subscriber' AND policyname = 'admin update newsletter_subscriber'
  ) THEN
    CREATE POLICY "admin update newsletter_subscriber"
      ON public.newsletter_subscriber
      FOR UPDATE
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;

  -- Only admins can delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'newsletter_subscriber' AND policyname = 'admin delete newsletter_subscriber'
  ) THEN
    CREATE POLICY "admin delete newsletter_subscriber"
      ON public.newsletter_subscriber
      FOR DELETE
      USING (is_admin());
  END IF;
END
$$;
