-- Add some upcoming movies for countdowns
INSERT INTO movie (id, tmdb_id, title, slug, overview, genres, runtime, cinema_release_ro, poster_path, popularity)
VALUES 
  ('new-lilo-stitch-2025', 12345, 'Lilo & Stitch (2025)', 'lilo-stitch-2025', 'O adaptare live-action a clasicului animat Disney despre prietenia dintre o fetiță din Hawaii și un extraterestru.', ARRAY['Familie', 'Comedie', 'Aventură'], 105, '2025-05-21', '/tUae3mefrDVTgm5mRzqWnZK6fOP.jpg', 85.5),
  ('new-how-to-train-your-dragon-2025', 67890, 'How to Train Your Dragon (2025)', 'how-to-train-your-dragon-2025', 'O adaptare live-action a poveștii despre Hiccup și dragonul său Toothless.', ARRAY['Familie', 'Aventură', 'Fantasy'], 120, '2025-06-13', '/v0CiAqBeVgQ1fXb0hVeWLhYp3XQ.jpg', 78.3),
  ('new-28-years-later', 11111, '28 Years Later', '28-years-later', 'Continuarea seriei de filme zombie cu infectați cu virusul Rage.', ARRAY['Horror', 'Thriller', 'Sci-Fi'], 118, '2025-06-20', '/fUCFEGFlMIFet9ja72JDAeG1he8.jpg', 92.1),
  ('new-superman-2025', 22222, 'Superman (2025)', 'superman-2025', 'O nouă viziune asupra ultimului fiu al planetei Krypton.', ARRAY['Acțiune', 'Sci-Fi', 'Aventură'], 140, '2025-07-11', '/dfUCs5HNtGu4fofh83uiE2Qcy3v.jpg', 95.7),
  ('new-demon-slayer', 33333, 'Demon Slayer: Kimetsu no Yaiba Infinity Castle', 'demon-slayer-kimetsu-no-yaiba-infinity-castle', 'Tanjiro și prietenii săi se confruntă cu cea mai mare provocare din Castelul Infinit.', ARRAY['Animație', 'Acțiune', 'Supernatural'], 125, '2025-09-12', '/xHlzrPT8aJ5lSNqjOHjXWUhZonx.jpg', 88.9),
  ('new-ne-zha-2', 44444, 'Ne Zha 2', 'ne-zha-2', 'Continuarea aventurilor tânărului zeu rebel Ne Zha din mitologia chineză.', ARRAY['Animație', 'Familie', 'Fantasy'], 110, '2025-08-30', '/8aQF5ZQh4VQCP6wfm8OdYWUQRz7.jpg', 72.4)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  overview = EXCLUDED.overview,
  genres = EXCLUDED.genres,
  runtime = EXCLUDED.runtime,
  cinema_release_ro = EXCLUDED.cinema_release_ro,
  poster_path = EXCLUDED.poster_path,
  popularity = EXCLUDED.popularity;