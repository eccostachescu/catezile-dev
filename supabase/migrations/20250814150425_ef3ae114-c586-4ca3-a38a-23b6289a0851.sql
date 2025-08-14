-- Create edge function to enrich missing images for events
-- This function will run daily to populate image_url for events that don't have images

-- First, let's add columns to track image sources and credits if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'image_source') THEN
        ALTER TABLE public.events ADD COLUMN image_source TEXT; -- tmdb|sports|holiday|pexels|manual
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'image_credit') THEN
        ALTER TABLE public.events ADD COLUMN image_credit TEXT; -- photographer/source credit
    END IF;
END $$;

-- Create function to count live events
CREATE OR REPLACE FUNCTION count_live_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    live_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO live_count
    FROM events
    WHERE status = 'live' 
    AND start_date <= NOW()
    AND (end_date IS NULL OR end_date >= NOW());
    
    RETURN live_count;
END;
$$;

-- Create function to get live events
CREATE OR REPLACE FUNCTION get_live_events(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    image_url TEXT,
    location TEXT,
    category TEXT,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.title,
        e.slug,
        e.start_date,
        e.end_date,
        e.image_url,
        e.location,
        e.category,
        e.status
    FROM events e
    WHERE e.status = 'live' 
    AND e.start_date <= NOW()
    AND (e.end_date IS NULL OR e.end_date >= NOW())
    ORDER BY e.start_date DESC
    LIMIT limit_count;
END;
$$;