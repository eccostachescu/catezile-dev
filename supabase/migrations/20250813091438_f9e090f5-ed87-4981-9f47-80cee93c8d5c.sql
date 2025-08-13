-- Holidays & School Days Module Migration
-- 1) Sărbători
CREATE TABLE IF NOT EXISTS public.holiday (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug CITEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('legal','religious','national','observance')),
  rule TEXT NOT NULL,
  description TEXT,
  official_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_holiday_kind ON public.holiday(kind);

-- 2) Instanțe pe ani (materializate pentru viteză & SSG)
CREATE TABLE IF NOT EXISTS public.holiday_instance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_id UUID NOT NULL REFERENCES public.holiday(id) ON DELETE CASCADE,
  year SMALLINT NOT NULL,
  date DATE NOT NULL,
  date_end DATE,
  is_weekend BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (holiday_id, year)
);

CREATE INDEX IF NOT EXISTS idx_holiday_instance_year ON public.holiday_instance(year);

-- 3) Calendar școlar (intervale)
CREATE TABLE IF NOT EXISTS public.school_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_year TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('module','vacation','other')),
  name TEXT NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  official_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_school_calendar_year ON public.school_calendar(school_year);

-- 4) Examene (per sesiune)
CREATE TABLE IF NOT EXISTS public.exam (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug CITEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('BAC','EN','ADMITERE','TEZE')),
  year SMALLINT NOT NULL,
  official_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exam_phase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exam(id) ON DELETE CASCADE,
  slug CITEXT NOT NULL,
  name TEXT NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (exam_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_exam_year ON public.exam(year);

-- 5) RLS Policies
ALTER TABLE public.holiday ENABLE ROW LEVEL SECURITY;
CREATE POLICY "holiday_read" ON public.holiday FOR SELECT USING (true);
CREATE POLICY "holiday_admin_write" ON public.holiday FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE public.holiday_instance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "holiday_instance_read" ON public.holiday_instance FOR SELECT USING (true);
CREATE POLICY "holiday_instance_admin_write" ON public.holiday_instance FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE public.school_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "school_calendar_read" ON public.school_calendar FOR SELECT USING (true);
CREATE POLICY "school_calendar_admin_write" ON public.school_calendar FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE public.exam ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exam_read" ON public.exam FOR SELECT USING (true);
CREATE POLICY "exam_admin_write" ON public.exam FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE public.exam_phase ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exam_phase_read" ON public.exam_phase FOR SELECT USING (true);
CREATE POLICY "exam_phase_admin_write" ON public.exam_phase FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 6) Seed initial holidays
INSERT INTO public.holiday (slug, name, kind, rule, description) VALUES
('anul-nou', 'Anul Nou', 'legal', 'fixed:01-01', 'Anul Nou'),
('a-doua-zi-an-nou', 'A doua zi de Anul Nou', 'legal', 'fixed:01-02', 'A doua zi de Anul Nou'),
('unirea-principatelor', 'Unirea Principatelor Române', 'national', 'fixed:01-24', 'Ziua Unirii Principatelor Române'),
('boboteaza', 'Boboteaza', 'religious', 'fixed:01-06', 'Botezul Domnului'),
('vinerea-mare', 'Vinerea Mare', 'religious', 'orthodox_easter:-2', 'Vinerea Mare'),
('paste-ortodox', 'Paștele ortodox', 'religious', 'orthodox_easter:0', 'Ziua de Paște'),
('a-doua-zi-paste', 'A doua zi de Paște', 'religious', 'orthodox_easter:+1', 'A doua zi de Paște'),
('ziua-muncii', 'Ziua Muncii', 'legal', 'fixed:05-01', 'Ziua Internațională a Muncii'),
('ziua-copilului', 'Ziua Copilului', 'national', 'fixed:06-01', 'Ziua Internațională a Copilului'),
('rusalii', 'Rusaliile', 'religious', 'orthodox_easter:+49', 'Rusaliile'),
('a-doua-zi-rusalii', 'A doua zi de Rusalii', 'religious', 'orthodox_easter:+50', 'A doua zi de Rusalii'),
('adormirea-maicii-domnului', 'Adormirea Maicii Domnului', 'religious', 'fixed:08-15', 'Adormirea Maicii Domnului'),
('sfantul-andrei', 'Sfântul Andrei', 'religious', 'fixed:11-30', 'Sfântul Andrei'),
('ziua-nationala', 'Ziua Națională', 'national', 'fixed:12-01', 'Ziua Națională a României'),
('craciun', 'Crăciunul', 'religious', 'fixed:12-25', 'Nașterea Domnului'),
('a-doua-zi-craciun', 'A doua zi de Crăciun', 'religious', 'fixed:12-26', 'A doua zi de Crăciun')
ON CONFLICT (slug) DO NOTHING;

-- 7) Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_holiday()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_holiday_updated_at
  BEFORE UPDATE ON public.holiday
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_holiday();