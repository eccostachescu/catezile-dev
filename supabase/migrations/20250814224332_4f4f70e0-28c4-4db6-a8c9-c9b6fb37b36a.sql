-- Remove the specified leagues
DELETE FROM competition WHERE code IN (
  'AT-BL',     -- Austria Bundesliga
  'GB-CH',     -- Championship
  'PL-EK',     -- Poland Ekstraklasa
  'NL-ED',     -- Netherlands Eredivisie
  'ES-SD',     -- Segunda División
  'MX-LMX',    -- Liga MX Mexico
  'PT-LP',     -- Liga Portugal
  'GR-SL',     -- Greece Super League
  'CH-SL'      -- Switzerland Super League
);

-- Final list of remaining competitions
SELECT code, name, external->>'league_id' as api_league_id 
FROM competition 
ORDER BY name;