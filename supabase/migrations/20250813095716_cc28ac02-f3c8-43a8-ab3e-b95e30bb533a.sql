-- Migration 0027: Events module (Part 1 - Foundation)
-- 1) Cities table
CREATE TABLE IF NOT EXISTS public.city (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug CITEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT DEFAULT 'RO',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Venues table  
CREATE TABLE IF NOT EXISTS public.venue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug CITEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city_id UUID REFERENCES public.city(id) ON DELETE SET NULL,
  website TEXT,
  phone TEXT,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3) Event categories
CREATE TABLE IF NOT EXISTS public.event_category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug CITEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default categories
INSERT INTO public.event_category(slug, name) VALUES
('festival', 'Festival'),
('concert', 'Concert'),
('expozitie', 'Expoziție'),
('conferinta', 'Conferință'),
('parada', 'Parade/Ceremonii'),
('family', 'Family/Junior')
ON CONFLICT (slug) DO NOTHING;

-- 4) Add missing columns to existing event table
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS category_id UUID;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS venue_id UUID;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS city_id UUID;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS official_url TEXT;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS tickets_affiliate_link_id UUID;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS curated BOOLEAN DEFAULT false;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS submitted_by UUID;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS moderator_id UUID;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- Add foreign key constraints after columns exist
DO $$
BEGIN
  -- Add foreign key constraints if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'event_category_id_fkey') THEN
    ALTER TABLE public.event ADD CONSTRAINT event_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES public.event_category(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'event_venue_id_fkey') THEN
    ALTER TABLE public.event ADD CONSTRAINT event_venue_id_fkey 
    FOREIGN KEY (venue_id) REFERENCES public.venue(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'event_city_id_fkey') THEN
    ALTER TABLE public.event ADD CONSTRAINT event_city_id_fkey 
    FOREIGN KEY (city_id) REFERENCES public.city(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5) Event moderation log
CREATE TABLE IF NOT EXISTS public.event_moderation_log (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.event(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('SUBMIT','APPROVE','REJECT','UPDATE','MERGE')),
  actor UUID,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6) Basic indexes
CREATE INDEX IF NOT EXISTS idx_city_name ON public.city(name);
CREATE INDEX IF NOT EXISTS idx_venue_city ON public.venue(city_id);
CREATE INDEX IF NOT EXISTS idx_venue_name ON public.venue(name);
CREATE INDEX IF NOT EXISTS idx_event_starts_at ON public.event(starts_at);
CREATE INDEX IF NOT EXISTS idx_event_city ON public.event(city_id);
CREATE INDEX IF NOT EXISTS idx_event_category ON public.event(category_id);
CREATE INDEX IF NOT EXISTS idx_event_status ON public.event(status);

-- 7) Enable RLS
ALTER TABLE public.city ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_moderation_log ENABLE ROW LEVEL SECURITY;

-- 8) Basic RLS policies
DROP POLICY IF EXISTS "city_read" ON public.city;
CREATE POLICY "city_read" ON public.city FOR SELECT USING (true);

DROP POLICY IF EXISTS "venue_read" ON public.venue;
CREATE POLICY "venue_read" ON public.venue FOR SELECT USING (true);

DROP POLICY IF EXISTS "event_category_read" ON public.event_category;
CREATE POLICY "event_category_read" ON public.event_category FOR SELECT USING (true);

DROP POLICY IF EXISTS "event_log_admin" ON public.event_moderation_log;
CREATE POLICY "event_log_admin" ON public.event_moderation_log FOR ALL USING (public.is_admin());