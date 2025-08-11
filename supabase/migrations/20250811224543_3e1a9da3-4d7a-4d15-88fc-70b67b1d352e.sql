-- Security hardening migration (revised)
-- NOTE: ugc_queue appears to be a view; skipping RLS there since Postgres does not support RLS on views.

-- 1) Protect match_offer (enable RLS and admin-only policies)
ALTER TABLE public.match_offer ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin match_offer" ON public.match_offer;
CREATE POLICY "admin match_offer"
ON public.match_offer
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2) Prevent duplicate newsletter subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'newsletter_subscriber_email_key'
  ) THEN
    ALTER TABLE public.newsletter_subscriber
    ADD CONSTRAINT newsletter_subscriber_email_key UNIQUE (email);
  END IF;
END$$;
