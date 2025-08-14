-- Fix the start_at and starts_at fields for events to ensure consistency
UPDATE event 
SET starts_at = start_at 
WHERE starts_at IS NULL AND start_at IS NOT NULL;

-- Also ensure all events have start_at if starts_at exists but start_at doesn't
UPDATE event 
SET start_at = starts_at 
WHERE start_at IS NULL AND starts_at IS NOT NULL;

-- For events that have neither, set them to a future date so they don't break
UPDATE event 
SET start_at = '2025-09-21 12:00:00+02', starts_at = '2025-09-21 12:00:00+02'
WHERE start_at IS NULL AND starts_at IS NULL AND title = 'Meciul anului: România - Italia';

UPDATE event 
SET start_at = '2025-09-30 15:00:00+02', starts_at = '2025-09-30 15:00:00+02'
WHERE start_at IS NULL AND starts_at IS NULL AND title = 'Festival de vară București';

UPDATE event 
SET start_at = '2025-10-16 20:00:00+02', starts_at = '2025-10-16 20:00:00+02'
WHERE start_at IS NULL AND starts_at IS NULL AND title = 'Concert extraordinar Inna';

UPDATE event 
SET start_at = '2025-10-20 10:00:00+02', starts_at = '2025-10-20 10:00:00+02'
WHERE start_at IS NULL AND starts_at IS NULL AND title = 'Conferința Tech Romania';

UPDATE event 
SET start_at = '2025-11-01 19:00:00+02', starts_at = '2025-11-01 19:00:00+02'
WHERE start_at IS NULL AND starts_at IS NULL AND title = 'Spectacol Ion Creangă';