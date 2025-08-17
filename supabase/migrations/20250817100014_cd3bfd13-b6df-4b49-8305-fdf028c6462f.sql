-- Create ott_platform table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ott_platform (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ott_platform ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can view platforms" 
ON public.ott_platform 
FOR SELECT 
USING (true);

-- Create movie_platform table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.movie_platform (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movie(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES public.ott_platform(id) ON DELETE CASCADE,
  available_from DATE,
  available_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(movie_id, platform_id)
);

-- Enable RLS
ALTER TABLE public.movie_platform ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can view movie platforms" 
ON public.movie_platform 
FOR SELECT 
USING (true);

-- Insert streaming platforms
INSERT INTO public.ott_platform (name, slug, website) VALUES
('Netflix', 'netflix', 'https://netflix.com'),
('Prime Video', 'prime-video', 'https://primevideo.com'),
('HBO Max', 'hbo-max', 'https://hbomax.com'),
('Disney+', 'disney-plus', 'https://disneyplus.com'),
('Apple TV+', 'apple-tv', 'https://tv.apple.com')
ON CONFLICT (slug) DO NOTHING;

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_ott_platform()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ott_platform_updated_at
  BEFORE UPDATE ON public.ott_platform
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_ott_platform();

CREATE OR REPLACE FUNCTION public.set_updated_at_movie_platform()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_movie_platform_updated_at
  BEFORE UPDATE ON public.movie_platform
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_movie_platform();