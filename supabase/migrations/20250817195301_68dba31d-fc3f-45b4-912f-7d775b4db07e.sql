-- Update the Rapid vs FCSB match to be live for demo purposes
UPDATE match 
SET status = 'LIVE', 
    score = jsonb_build_object(
      'home', jsonb_build_object('ht', 1, 'ft', null),
      'away', jsonb_build_object('ht', 0, 'ft', null),
      'minute', 65
    )
WHERE id = 'f80c1055-02fc-4d55-ab16-2e59537f2350';

-- Create a function to automatically call update_live_scores every 2 minutes during match hours
CREATE OR REPLACE FUNCTION trigger_live_scores_update()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    match_hours boolean := false;
BEGIN
    -- Check if it's during typical match hours (14:00-23:00 Romanian time)
    SELECT EXTRACT(hour FROM (NOW() AT TIME ZONE 'Europe/Bucharest')) BETWEEN 14 AND 23 INTO match_hours;
    
    IF match_hours THEN
        -- Call the edge function to update live scores
        PERFORM net.http_post(
            url := current_setting('app.supabase_url') || '/functions/v1/update_live_scores',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.service_role_key')
            ),
            body := '{}'::jsonb
        );
    END IF;
END;
$$;