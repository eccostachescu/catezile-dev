-- Populate competitions with proper league IDs
INSERT INTO competition (code, name, season, external) VALUES
('GB-PL', 'Premier League', 2024, '{"provider": "api-football", "league_id": "39"}'),
('ES-LL', 'La Liga', 2024, '{"provider": "api-football", "league_id": "140"}'),
('IT-SA', 'Serie A', 2024, '{"provider": "api-football", "league_id": "135"}'),
('DE-BL', 'Bundesliga', 2024, '{"provider": "api-football", "league_id": "78"}'),
('FR-L1', 'Ligue 1', 2024, '{"provider": "api-football", "league_id": "61"}'),
('EU-CL', 'UEFA Champions League', 2024, '{"provider": "api-football", "league_id": "2"}'),
('RO-L1', 'SuperLiga', 2024, '{"provider": "api-football", "league_id": "283"}')
ON CONFLICT (code) DO UPDATE SET
  external = EXCLUDED.external,
  season = EXCLUDED.season;