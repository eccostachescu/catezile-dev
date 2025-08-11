-- Security hardening migration
-- 1) Protect tables missing RLS

-- match_offer: enable RLS and restrict access to admins only (mirrors event_offer)
ALTER TABLE public.match_offer ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin match_offer" ON public.match_offer;
CREATE POLICY "admin match_offer"
ON public.match_offer
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ugc_queue: enable RLS; allow owners to insert/select their own rows; admins full control
ALTER TABLE public.ugc_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner insert ugc_queue" ON public.ugc_queue;
DROP POLICY IF EXISTS "owner select ugc_queue" ON public.ugc_queue;
DROP POLICY IF EXISTS "admin update ugc_queue" ON public.ugc_queue;
DROP POLICY IF EXISTS "admin delete ugc_queue" ON public.ugc_queue;

-- Owners can insert their own items
CREATE POLICY "owner insert ugc_queue"
ON public.ugc_queue
FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Owners can view their own items; admins can view everything
CREATE POLICY "owner select ugc_queue"
ON public.ugc_queue
FOR SELECT
USING ((owner_id = auth.uid()) OR public.is_admin());

-- Admins can update
CREATE POLICY "admin update ugc_queue"
ON public.ugc_queue
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admins can delete
CREATE POLICY "admin delete ugc_queue"
ON public.ugc_queue
FOR DELETE
USING (public.is_admin());

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
