-- Add image_url column to match table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'match' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.match ADD COLUMN image_url text;
    END IF;
END $$;