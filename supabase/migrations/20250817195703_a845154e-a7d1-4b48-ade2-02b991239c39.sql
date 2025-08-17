-- Fix the security warning by setting search_path for the function
DROP FUNCTION IF EXISTS trigger_live_scores_update();

CREATE OR REPLACE FUNCTION trigger_live_scores_update()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    match_hours boolean := false;
BEGIN
    -- Check if it's during typical match hours (14:00-23:00 Romanian time)
    SELECT EXTRACT(hour FROM (NOW() AT TIME ZONE 'Europe/Bucharest')) BETWEEN 14 AND 23 INTO match_hours;
    
    IF match_hours THEN
        -- For now, just log that we would update scores
        -- We'll implement the actual HTTP call when we have the proper setup
        INSERT INTO ingestion_log (source, status, message) 
        VALUES ('live_scores_trigger', 'INFO', 'Live scores update triggered during match hours');
    END IF;
END;
$$;