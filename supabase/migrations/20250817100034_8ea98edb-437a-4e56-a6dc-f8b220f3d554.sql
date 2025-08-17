-- Insert streaming platforms (they already exist from the table info)
INSERT INTO public.ott_platform (name, slug) VALUES
('Netflix', 'netflix'),
('Prime Video', 'prime-video'),
('HBO Max', 'hbo-max'),
('Disney+', 'disney-plus'),
('Apple TV+', 'apple-tv')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;