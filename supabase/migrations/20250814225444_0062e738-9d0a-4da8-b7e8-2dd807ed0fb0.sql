-- Update existing matches with generated image URLs (fixed variable naming)
CREATE OR REPLACE FUNCTION update_match_images() RETURNS INTEGER AS $$
DECLARE
    match_record RECORD;
    generated_image_url TEXT;
    sport_images TEXT[] := ARRAY[
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop'
    ];
    hash_value INTEGER;
    image_index INTEGER;
    updated_count INTEGER := 0;
BEGIN
    -- Update matches that don't have image_url set
    FOR match_record IN 
        SELECT id, home, away 
        FROM public.match 
        WHERE image_url IS NULL OR image_url = ''
    LOOP
        -- Generate hash from team names
        hash_value := hashtext(match_record.home || '-' || match_record.away);
        image_index := (abs(hash_value) % array_length(sport_images, 1)) + 1;
        generated_image_url := sport_images[image_index];
        
        -- Update the match
        UPDATE public.match 
        SET image_url = generated_image_url
        WHERE id = match_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the function to update existing matches
SELECT update_match_images() as matches_updated;