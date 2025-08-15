-- Add TVMaze integration fields to tv_program table
ALTER TABLE public.tv_program 
ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS show_name TEXT,
ADD COLUMN IF NOT EXISTS season INTEGER,
ADD COLUMN IF NOT EXISTS episode_number INTEGER,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS genres TEXT[],
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS channel_name TEXT;

-- Create index for external_id
CREATE INDEX IF NOT EXISTS idx_tv_program_external_id ON public.tv_program(external_id);
CREATE INDEX IF NOT EXISTS idx_tv_program_source ON public.tv_program(source);
CREATE INDEX IF NOT EXISTS idx_tv_program_show_name ON public.tv_program(show_name);

-- Create TV shows table for better organization
CREATE TABLE IF NOT EXISTS public.tv_show (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE,
  name TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  genres TEXT[],
  network_name TEXT,
  country_code TEXT,
  source TEXT DEFAULT 'tvmaze',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for tv_show
CREATE INDEX IF NOT EXISTS idx_tv_show_external_id ON public.tv_show(external_id);
CREATE INDEX IF NOT EXISTS idx_tv_show_source ON public.tv_show(source);

-- Add trigger for updated_at
CREATE TRIGGER update_tv_show_updated_at
  BEFORE UPDATE ON public.tv_show
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_tv_program();

-- Enable RLS on tv_show (read-only for public)
ALTER TABLE public.tv_show ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TV shows are publicly readable" ON public.tv_show
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify TV shows" ON public.tv_show
  FOR ALL
  USING (public.is_admin());