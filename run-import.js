// Quick script to run the import after adding API keys
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://ibihfzhrsllndxhfwgvb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaWhmemhyc2xsbmR4aGZ3Z3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzAyNTAsImV4cCI6MjA3MDUwNjI1MH0.Zqikiwqpgb4lksNXcAdLA3fQzZwfV4WwFYzxpAwxCoU"
);

console.log('🚀 Starting import_multi_leagues...');

try {
  const { data, error } = await supabase.functions.invoke('import_multi_leagues', {
    body: {
      league_codes: [
        'GB-PL',     // Premier League
        'ES-LL',     // La Liga
        'IT-SA',     // Serie A
        'DE-BL',     // Bundesliga
        'FR-L1',     // Ligue 1
        'EU-CL',     // Champions League
        'EU-EL'      // Europa League
      ],
      season: 2024
    }
  });
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Success:', data);
  }
} catch (err) {
  console.error('❌ Failed:', err);
}