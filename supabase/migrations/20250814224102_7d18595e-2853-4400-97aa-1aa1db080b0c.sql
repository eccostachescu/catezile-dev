-- Remove unwanted leagues
DELETE FROM competition WHERE code IN ('liga-pt', 'brasileirao', 'mls', 'liga-mx', 'eredivisie');

-- Add new competitions/tournaments
INSERT INTO competition (code, name, external) VALUES 
('saudi-pro', 'Saudi Pro League', '{"league_id": "307"}'),
('world-cup', 'FIFA World Cup', '{"league_id": "1"}'),
('nations-league', 'UEFA Nations League', '{"league_id": "5"}'),
('euro', 'UEFA European Championship', '{"league_id": "4"}'),
('mls', 'Major League Soccer', '{"league_id": "253"}');

-- Display final list of all competitions
SELECT code, name, external->>'league_id' as api_league_id 
FROM competition 
ORDER BY name;