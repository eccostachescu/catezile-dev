-- Migration 0022_black_friday.sql
-- 1) Extend bf_merchant with additional fields
ALTER TABLE public.bf_merchant
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS program_url text,
  ADD COLUMN IF NOT EXISTS affiliate_base_url text,
  ADD COLUMN IF NOT EXISTS epc_estimate numeric,
  ADD COLUMN IF NOT EXISTS priority int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Updated at trigger (reuse existing function)
DO $$ BEGIN
  PERFORM 1 FROM pg_trigger WHERE tgname = '_bf_merchant_updated';
  IF NOT FOUND THEN
    CREATE TRIGGER _bf_merchant_updated BEFORE UPDATE ON public.bf_merchant
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- 2) Categories
CREATE TABLE IF NOT EXISTS public.bf_category (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3) Offers
CREATE TABLE IF NOT EXISTS public.bf_offer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.bf_merchant(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.bf_category(id) ON DELETE SET NULL,
  title text NOT NULL,
  subtitle text,
  price numeric(12,2),
  price_old numeric(12,2),
  discount_percent smallint,
  image_url text,
  product_url text,
  affiliate_link_id uuid REFERENCES public.affiliate_link(id) ON DELETE SET NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'COMING_SOON' CHECK (status in ('COMING_SOON','LIVE','EXPIRED')),
  score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bf_offer_merchant ON public.bf_offer(merchant_id);
CREATE INDEX IF NOT EXISTS idx_bf_offer_status ON public.bf_offer(status);
CREATE INDEX IF NOT EXISTS idx_bf_offer_times ON public.bf_offer(starts_at, ends_at);

DO $$ BEGIN
  PERFORM 1 FROM pg_trigger WHERE tgname = '_bf_offer_updated';
  IF NOT FOUND THEN
    CREATE TRIGGER _bf_offer_updated BEFORE UPDATE ON public.bf_offer
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- 4) RLS
ALTER TABLE public.bf_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bf_offer ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE polname = 'admin write bf_category';
  IF NOT FOUND THEN
    CREATE POLICY "admin write bf_category" ON public.bf_category FOR ALL
      USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE polname = 'admin write bf_offer';
  IF NOT FOUND THEN
    CREATE POLICY "admin write bf_offer" ON public.bf_offer FOR ALL
      USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Seed default categories (idempotent)
INSERT INTO public.bf_category(slug,name)
VALUES
  ('electronice','Electronice'),('electrocasnice','Electrocasnice'),('it','IT'),
  ('telefoane','Telefoane'),('fashion','Fashion'),('beauty','Beauty'),('home','Home'),
  ('travel','Travel'),('auto','Auto')
ON CONFLICT (slug) DO NOTHING;
