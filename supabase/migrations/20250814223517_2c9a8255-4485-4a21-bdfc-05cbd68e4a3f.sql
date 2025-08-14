-- Insert popular European leagues with their API-Football league IDs
INSERT INTO competition (code, name, area, season, external) VALUES
-- Premier League
('GB-PL', 'Premier League', 'England', 2024, '{"provider": "api-football", "league_id": "39"}'),
-- La Liga
('ES-LL', 'La Liga', 'Spain', 2024, '{"provider": "api-football", "league_id": "140"}'),
-- Serie A
('IT-SA', 'Serie A', 'Italy', 2024, '{"provider": "api-football", "league_id": "135"}'),
-- Bundesliga
('DE-BL', 'Bundesliga', 'Germany', 2024, '{"provider": "api-football", "league_id": "78"}'),
-- Ligue 1
('FR-L1', 'Ligue 1', 'France', 2024, '{"provider": "api-football", "league_id": "61"}'),
-- Champions League
('EU-CL', 'UEFA Champions League', 'Europe', 2024, '{"provider": "api-football", "league_id": "2"}'),
-- Europa League
('EU-EL', 'UEFA Europa League', 'Europe', 2024, '{"provider": "api-football", "league_id": "3"}'),
-- Romanian Cup
('RO-CUP', 'Cupa României', 'Romania', 2024, '{"provider": "api-football", "league_id": "415"}'),
-- Segunda División
('ES-SD', 'Segunda División', 'Spain', 2024, '{"provider": "api-football", "league_id": "141"}'),
-- Championship
('GB-CH', 'Championship', 'England', 2024, '{"provider": "api-football", "league_id": "40"}'),
-- Liga Portugal
('PT-LP', 'Liga Portugal', 'Portugal', 2024, '{"provider": "api-football", "league_id": "94"}'),
-- Turkish Süper Lig
('TR-SL', 'Süper Lig', 'Turkey', 2024, '{"provider": "api-football", "league_id": "203"}'),
-- Dutch Eredivisie
('NL-ED', 'Eredivisie', 'Netherlands', 2024, '{"provider": "api-football", "league_id": "88"}'),
-- Belgian Pro League
('BE-PL', 'Pro League', 'Belgium', 2024, '{"provider": "api-football", "league_id": "144"}'),
-- Swiss Super League
('CH-SL', 'Super League', 'Switzerland', 2024, '{"provider": "api-football", "league_id": "207"}'),
-- Austrian Bundesliga
('AT-BL', 'Bundesliga', 'Austria', 2024, '{"provider": "api-football", "league_id": "218"}'),
-- Scottish Premiership
('SC-SP', 'Scottish Premiership', 'Scotland', 2024, '{"provider": "api-football", "league_id": "179"}'),
-- Croatian First League
('HR-1L', 'First League', 'Croatia', 2024, '{"provider": "api-football", "league_id": "210"}'),
-- Czech First League
('CZ-1L', 'First League', 'Czech Republic', 2024, '{"provider": "api-football", "league_id": "345"}'),
-- Polish Ekstraklasa
('PL-EK', 'Ekstraklasa', 'Poland', 2024, '{"provider": "api-football", "league_id": "106"}'),
-- Hungarian NB I
('HU-NB1', 'NB I', 'Hungary', 2024, '{"provider": "api-football", "league_id": "271"}'),
-- Bulgarian First League
('BG-FL', 'First League', 'Bulgaria', 2024, '{"provider": "api-football", "league_id": "172"}'),
-- Serbian SuperLiga
('RS-SL', 'SuperLiga', 'Serbia', 2024, '{"provider": "api-football", "league_id": "286"}'),
-- Greek Super League
('GR-SL', 'Super League', 'Greece', 2024, '{"provider": "api-football", "league_id": "197"}'),
-- Cypriot First Division
('CY-FD', 'First Division', 'Cyprus', 2024, '{"provider": "api-football", "league_id": "318"}'),
-- MLS
('US-MLS', 'Major League Soccer', 'USA', 2024, '{"provider": "api-football", "league_id": "253"}'),
-- Liga MX
('MX-LMX', 'Liga MX', 'Mexico', 2024, '{"provider": "api-football", "league_id": "262"}'),
-- Brazilian Série A
('BR-SA', 'Série A', 'Brazil', 2024, '{"provider": "api-football", "league_id": "71"}'),
-- Argentine Primera División
('AR-PD', 'Primera División', 'Argentina', 2024, '{"provider": "api-football", "league_id": "128"}')
ON CONFLICT (code) DO UPDATE SET
external = EXCLUDED.external,
area = EXCLUDED.area;