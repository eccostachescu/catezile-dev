-- Create TVMaze shows table
CREATE TABLE IF NOT EXISTS public.tvmaze_show (
  id bigserial PRIMARY KEY,
  tvmaze_id integer UNIQUE NOT NULL,
  name text NOT NULL,
  status text,
  language text,
  genres text[],
  network jsonb,
  official_site text,
  premiered date,
  ended date,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create TVMaze episodes table  
CREATE TABLE IF NOT EXISTS public.tvmaze_episode (
  id bigserial PRIMARY KEY,
  tvmaze_episode_id integer UNIQUE NOT NULL,
  tvmaze_show_id integer NOT NULL REFERENCES tvmaze_show(tvmaze_id),
  season integer,
  number integer,
  name text,
  airdate date,
  airtime text,
  airstamp timestamptz,
  runtime integer,
  summary text,
  image jsonb,
  network_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create show mapping table for TMDB integration
CREATE TABLE IF NOT EXISTS public.show_mapping (
  tvmaze_show_id integer UNIQUE NOT NULL REFERENCES tvmaze_show(tvmaze_id),
  tmdb_id integer,
  slug text UNIQUE,
  image_url text,
  image_source text,
  verified boolean DEFAULT false,
  manual_override boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add TVMaze episode reference to event table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event' AND column_name = 'tvmaze_episode_id') THEN
    ALTER TABLE public.event ADD COLUMN tvmaze_episode_id integer UNIQUE REFERENCES tvmaze_episode(tvmaze_episode_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event' AND column_name = 'network') THEN
    ALTER TABLE public.event ADD COLUMN network text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event' AND column_name = 'season') THEN
    ALTER TABLE public.event ADD COLUMN season integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event' AND column_name = 'episode') THEN
    ALTER TABLE public.event ADD COLUMN episode integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event' AND column_name = 'series_name') THEN
    ALTER TABLE public.event ADD COLUMN series_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event' AND column_name = 'image_credit') THEN
    ALTER TABLE public.event ADD COLUMN image_credit text;
  END IF;
END $$;

-- Create event_alt_airings table for reruns
CREATE TABLE IF NOT EXISTS public.event_alt_airings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES event(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  network text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tvmaze_episode_airstamp ON tvmaze_episode(airstamp);
CREATE INDEX IF NOT EXISTS idx_event_tvmaze_episode_id ON event(tvmaze_episode_id);
CREATE INDEX IF NOT EXISTS idx_tvmaze_show_tvmaze_id ON tvmaze_show(tvmaze_id);
CREATE INDEX IF NOT EXISTS idx_show_mapping_tmdb_id ON show_mapping(tmdb_id);

-- Create view for upcoming TV episodes
CREATE OR REPLACE VIEW v_tv_episodes_upcoming AS
SELECT 
  te.*,
  ts.name as show_name,
  ts.genres as show_genres,
  sm.image_url as show_image_url,
  sm.slug as show_slug
FROM tvmaze_episode te
JOIN tvmaze_show ts ON ts.tvmaze_id = te.tvmaze_show_id
LEFT JOIN show_mapping sm ON sm.tvmaze_show_id = te.tvmaze_show_id
WHERE te.airstamp >= now()
ORDER BY te.airstamp ASC;

-- RLS policies
ALTER TABLE tvmaze_show ENABLE ROW LEVEL SECURITY;
ALTER TABLE tvmaze_episode ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_alt_airings ENABLE ROW LEVEL SECURITY;

-- Public read access through views
CREATE POLICY "tvmaze_show_read" ON tvmaze_show FOR SELECT USING (true);
CREATE POLICY "tvmaze_episode_read" ON tvmaze_episode FOR SELECT USING (true);
CREATE POLICY "show_mapping_read" ON show_mapping FOR SELECT USING (true);
CREATE POLICY "event_alt_airings_read" ON event_alt_airings FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "tvmaze_show_admin_write" ON tvmaze_show FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "tvmaze_episode_admin_write" ON tvmaze_episode FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "show_mapping_admin_write" ON show_mapping FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "event_alt_airings_admin_write" ON event_alt_airings FOR ALL USING (is_admin()) WITH CHECK (is_admin());