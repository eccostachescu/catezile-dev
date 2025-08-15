-- Add streaming_providers column and other necessary columns for TMDB integration
ALTER TABLE movie ADD COLUMN IF NOT EXISTS streaming_providers JSONB;
ALTER TABLE movie ADD COLUMN IF NOT EXISTS trailer_key TEXT;
ALTER TABLE movie ADD COLUMN IF NOT EXISTS backdrop_path TEXT;
ALTER TABLE movie ADD COLUMN IF NOT EXISTS poster_path TEXT;
ALTER TABLE movie ADD COLUMN IF NOT EXISTS certification TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movie_streaming_providers 
ON movie USING GIN (streaming_providers);

CREATE INDEX IF NOT EXISTS idx_movie_streaming_ro 
ON movie USING GIN (streaming_ro);

CREATE INDEX IF NOT EXISTS idx_movie_tmdb_id 
ON movie (tmdb_id);