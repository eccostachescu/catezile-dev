#!/usr/bin/env node

const SUPABASE_URL = 'https://ibihfzhrsllndxhfwgvb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaWhmemhyc2xsbmR4aGZ3Z3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzAyNTAsImV4cCI6MjA3MDUwNjI1MH0.Zqikiwqpgb4lksNXcAdLA3fQzZwfV4WwFYzxpAwxCoU';

async function triggerMovieSync() {
  console.log('🎬 Starting movie population...');
  
  try {
    // 1. Populate monthly movies for 2025
    console.log('📅 Populating monthly movies for 2025...');
    const monthlyResponse = await fetch(`${SUPABASE_URL}/functions/v1/populate_monthly_movies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        year: 2025,
        months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      })
    });
    
    if (monthlyResponse.ok) {
      const monthlyResult = await monthlyResponse.text();
      console.log('✅ Monthly movies populated:', monthlyResult);
    } else {
      console.error('❌ Monthly movies failed:', monthlyResponse.status, await monthlyResponse.text());
    }

    // 2. Sync with TMDB for latest data
    console.log('🔄 Syncing with TMDB...');
    const tmdbResponse = await fetch(`${SUPABASE_URL}/functions/v1/movies_sync_tmdb`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    if (tmdbResponse.ok) {
      const tmdbResult = await tmdbResponse.text();
      console.log('✅ TMDB sync completed:', tmdbResult);
    } else {
      console.error('❌ TMDB sync failed:', tmdbResponse.status, await tmdbResponse.text());
    }

    // 3. Update movie providers
    console.log('🎭 Updating movie providers...');
    const providersResponse = await fetch(`${SUPABASE_URL}/functions/v1/update_movie_providers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    if (providersResponse.ok) {
      const providersResult = await providersResponse.text();
      console.log('✅ Providers updated:', providersResult);
    } else {
      console.error('❌ Providers update failed:', providersResponse.status, await providersResponse.text());
    }

    console.log('🎉 Movie population completed!');
    
  } catch (error) {
    console.error('💥 Error during movie population:', error);
  }
}

// Run the script
triggerMovieSync();