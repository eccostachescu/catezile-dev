-- Fix materialized view security by adding RLS policy
ALTER MATERIALIZED VIEW popular_countdowns_mv ENABLE ROW LEVEL SECURITY;

-- Allow public read access to the materialized view (same as events table)
CREATE POLICY "public read popular_countdowns_mv" 
ON popular_countdowns_mv 
FOR SELECT 
USING (true);