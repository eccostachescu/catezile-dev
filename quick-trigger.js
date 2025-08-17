// Quick script to populate data on CateZile
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://ibihfzhrsllndxhfwgvb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaWhmemhyc2xsbmR4aGZ3Z3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzAyNTAsImV4cCI6MjA3MDUwNjI1MH0.Zqikiwqpgb4lksNXcAdLA3fQzZwfV4WwFYzxpAwxCoU"
);

async function populateData() {
  console.log('🚀 Starting data population...');
  
  try {
    // 1. Populate movies from TMDB
    console.log('🎬 Syncing TMDB movies...');
    const moviesSync = await supabase.functions.invoke('movies_sync_tmdb', {});
    if (moviesSync.error) {
      console.error('❌ Movies sync error:', moviesSync.error);
    } else {
      console.log('✅ Movies synced:', moviesSync.data);
    }

    // 2. Populate monthly movies for 2025
    console.log('🗓️ Populating monthly movies...');
    const monthlyMovies = await supabase.functions.invoke('populate_monthly_movies', {
      body: { year: 2025 }
    });
    if (monthlyMovies.error) {
      console.error('❌ Monthly movies error:', monthlyMovies.error);
    } else {
      console.log('✅ Monthly movies populated:', monthlyMovies.data);
    }

    // 3. Import European leagues
    console.log('🌍 Importing European leagues...');
    const euroLeagues = await supabase.functions.invoke('import_multi_leagues', {
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
    if (euroLeagues.error) {
      console.error('❌ Euro leagues error:', euroLeagues.error);
    } else {
      console.log('✅ Euro leagues imported:', euroLeagues.data);
    }

    // 4. Import Liga 1 fixtures
    console.log('⚽ Importing Liga 1...');
    const liga1 = await supabase.functions.invoke('import_liga1_fixtures', {});
    if (liga1.error) {
      console.error('❌ Liga 1 error:', liga1.error);
    } else {
      console.log('✅ Liga 1 imported:', liga1.data);
    }

    // 5. Update movie providers
    console.log('📺 Updating movie providers...');
    const providers = await supabase.functions.invoke('movies_refresh_providers', {});
    if (providers.error) {
      console.error('❌ Providers error:', providers.error);
    } else {
      console.log('✅ Providers updated:', providers.data);
    }

    // 6. Refresh search index
    console.log('🔍 Refreshing search index...');
    const search = await supabase.functions.invoke('search_index_refresh', {});
    if (search.error) {
      console.error('❌ Search error:', search.error);
    } else {
      console.log('✅ Search index refreshed:', search.data);
    }

    console.log('🎉 Data population completed!');
    
    // Check final counts
    const [movieCount, matchCount] = await Promise.all([
      supabase.from('movie').select('id', { count: 'exact' }),
      supabase.from('match').select('id', { count: 'exact' })
    ]);
    
    console.log('📊 Final counts:');
    console.log(`- Movies: ${movieCount.count}`);
    console.log(`- Matches: ${matchCount.count}`);

  } catch (error) {
    console.error('❌ Population failed:', error);
  }
}

// Run the population
populateData();