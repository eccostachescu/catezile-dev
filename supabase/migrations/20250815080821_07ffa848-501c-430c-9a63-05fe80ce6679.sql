-- Create some sample countdowns with images for testing
INSERT INTO public.countdown (title, target_at, image_url, slug, status, privacy, city) VALUES
('Crăciun 2025', '2025-12-25T00:00:00Z', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop', 'craciun-2025', 'APPROVED', 'PUBLIC', 'București'),
('Anul Nou 2026', '2026-01-01T00:00:00Z', 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&h=600&fit=crop', 'anul-nou-2026', 'APPROVED', 'PUBLIC', 'Cluj'),
('Paște 2025', '2025-04-20T00:00:00Z', 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=800&h=600&fit=crop', 'paste-2025', 'APPROVED', 'PUBLIC', 'Timișoara'),
('1 Mai 2025', '2025-05-01T00:00:00Z', 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop', '1-mai-2025', 'APPROVED', 'PUBLIC', 'Iași'),
('Festivalul de Vară', '2025-07-15T00:00:00Z', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop', 'festivalul-de-vara-2025', 'APPROVED', 'PUBLIC', 'Constanța');

-- Update existing movies with poster URLs instead of creating new ones
UPDATE public.movie 
SET poster_url = 'https://images.unsplash.com/photo-1489599510072-12d66b9ac1ae?w=800&h=600&fit=crop'
WHERE tmdb_id IN (SELECT tmdb_id FROM public.movie LIMIT 1);

UPDATE public.movie 
SET poster_url = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop'
WHERE tmdb_id IN (SELECT tmdb_id FROM public.movie WHERE poster_url IS NULL LIMIT 1);