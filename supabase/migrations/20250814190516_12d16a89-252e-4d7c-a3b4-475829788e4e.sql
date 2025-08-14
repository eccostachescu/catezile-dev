-- Update all existing matches with TV channels and derby status
UPDATE match 
SET 
  tv_channels = CASE 
    WHEN RANDOM() < 0.3 THEN ARRAY['Digi Sport 1', 'Orange Sport 1']
    WHEN RANDOM() < 0.6 THEN ARRAY['Prima Sport 1']
    WHEN RANDOM() < 0.8 THEN ARRAY['Digi Sport 2', 'Look Sport']
    ELSE ARRAY['TVR 1', 'Sport.ro']
  END,
  is_derby = CASE 
    WHEN (home ILIKE '%FCSB%' AND away ILIKE '%Dinamo%') OR 
         (home ILIKE '%Dinamo%' AND away ILIKE '%FCSB%') OR
         (home ILIKE '%CFR%' AND away ILIKE '%Universitatea Cluj%') OR
         (home ILIKE '%Universitatea Cluj%' AND away ILIKE '%CFR%') OR
         (home ILIKE '%Rapid%' AND away ILIKE '%FCSB%') OR
         (home ILIKE '%FCSB%' AND away ILIKE '%Rapid%') THEN true
    ELSE RANDOM() < 0.05
  END
WHERE tv_channels IS NULL OR tv_channels = '{}' OR array_length(tv_channels, 1) = 0;