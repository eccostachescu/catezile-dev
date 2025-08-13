-- Migration 0027: Events module
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
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.event_category(id);
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES public.venue(id) ON DELETE SET NULL;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.city(id) ON DELETE SET NULL;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS official_url TEXT;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS tickets_affiliate_link_id UUID REFERENCES public.affiliate_link(id) ON DELETE SET NULL;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS curated BOOLEAN DEFAULT false;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.event ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- 5) Event moderation log
CREATE TABLE IF NOT EXISTS public.event_moderation_log (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.event(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('SUBMIT','APPROVE','REJECT','UPDATE','MERGE')),
  actor UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6) Indexes
CREATE INDEX IF NOT EXISTS idx_city_name_trgm ON public.city USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_venue_city ON public.venue(city_id);
CREATE INDEX IF NOT EXISTS idx_venue_name_trgm ON public.venue USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_event_time ON public.event(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_event_city ON public.event(city_id);
CREATE INDEX IF NOT EXISTS idx_event_category ON public.event(category_id);
CREATE INDEX IF NOT EXISTS idx_event_status ON public.event(status);
CREATE INDEX IF NOT EXISTS idx_event_title_trgm ON public.event USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_event_tsv ON public.event USING gin (search_tsv);

-- 7) RLS Policies
ALTER TABLE public.city ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "city_read" ON public.city;
CREATE POLICY "city_read" ON public.city FOR SELECT USING (true);

ALTER TABLE public.venue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "venue_read" ON public.venue;
CREATE POLICY "venue_read" ON public.venue FOR SELECT USING (true);

ALTER TABLE public.event_category ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "event_category_read" ON public.event_category;
CREATE POLICY "event_category_read" ON public.event_category FOR SELECT USING (true);

-- Update event policies
DROP POLICY IF EXISTS "event_public_read" ON public.event;
DROP POLICY IF EXISTS "event_own_read" ON public.event;
DROP POLICY IF EXISTS "event_submit" ON public.event;
DROP POLICY IF EXISTS "event_admin" ON public.event;

CREATE POLICY "event_public_read" ON public.event FOR SELECT USING (status='PUBLISHED');
CREATE POLICY "event_own_read" ON public.event FOR SELECT USING (auth.uid() = submitted_by);
CREATE POLICY "event_submit" ON public.event FOR INSERT WITH CHECK (auth.uid() = submitted_by AND status IN ('DRAFT','PENDING'));
CREATE POLICY "event_admin" ON public.event FOR ALL USING (public.is_admin());

ALTER TABLE public.event_moderation_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "event_log_admin" ON public.event_moderation_log;
CREATE POLICY "event_log_admin" ON public.event_moderation_log FOR ALL USING (public.is_admin());

-- 8) Search trigger for events
CREATE OR REPLACE FUNCTION update_event_search_tsv()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_tsv := to_tsvector('simple', 
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.subtitle, '') || ' ' ||
    COALESCE(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS event_search_update ON public.event;
CREATE TRIGGER event_search_update
  BEFORE INSERT OR UPDATE ON public.event
  FOR EACH ROW EXECUTE FUNCTION update_event_search_tsv();

-- 9) Auto-update timestamps
CREATE OR REPLACE FUNCTION update_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS city_updated_at ON public.city;
CREATE TRIGGER city_updated_at
  BEFORE UPDATE ON public.city
  FOR EACH ROW EXECUTE FUNCTION update_timestamps();

DROP TRIGGER IF EXISTS venue_updated_at ON public.venue;
CREATE TRIGGER venue_updated_at
  BEFORE UPDATE ON public.venue
  FOR EACH ROW EXECUTE FUNCTION update_timestamps();

DROP TRIGGER IF EXISTS event_updated_at ON public.event;
CREATE TRIGGER event_updated_at
  BEFORE UPDATE ON public.event
  FOR EACH ROW EXECUTE FUNCTION update_timestamps();