-- Remove the duplicate MLS entry (keeping the one with proper code)
DELETE FROM competition WHERE code = 'US-MLS';

-- Final list of all competitions
SELECT code, name, external->>'league_id' as api_league_id 
FROM competition 
ORDER BY name;