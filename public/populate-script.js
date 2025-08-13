import { supabase } from '@/integrations/supabase/client';

async function runPopulation() {
  console.log('🚀 Starting data population...');
  
  try {
    // Step 1: Generate holidays
    console.log('📅 Generating holidays...');
    const holidays = await supabase.functions.invoke('holidays_generate', {
      body: { fromYear: 2024, toYear: 2026 }
    });
    console.log('✅ Holidays generated:', holidays.data);

    // Step 2: Sync TMDB movies
    console.log('🎬 Syncing TMDB movies...');
    const movies = await supabase.functions.invoke('movies_sync_tmdb', {
      body: {}
    });
    console.log('✅ Movies synced:', movies.data);

    // Step 3: Import Liga 1 fixtures
    console.log('⚽ Importing Liga 1 fixtures...');
    const liga1 = await supabase.functions.invoke('import_liga1_fixtures', {
      body: {}
    });
    console.log('✅ Liga 1 fixtures imported:', liga1.data);

    // Step 4: Refresh search index
    console.log('🔍 Refreshing search index...');
    const search = await supabase.functions.invoke('search_index_refresh', {
      body: {}
    });
    console.log('✅ Search index refreshed:', search.data);

    console.log('🎉 All data population completed successfully!');
    
    // Check final counts
    const [movieCount, matchCount, holidayCount] = await Promise.all([
      supabase.from('movie').select('id', { count: 'exact' }),
      supabase.from('match').select('id', { count: 'exact' }),
      supabase.from('holiday_instance').select('id', { count: 'exact' })
    ]);
    
    console.log('📊 Final counts:');
    console.log(`- Movies: ${movieCount.count}`);
    console.log(`- Matches: ${matchCount.count}`);
    console.log(`- Holiday instances: ${holidayCount.count}`);
    
  } catch (error) {
    console.error('❌ Population failed:', error);
  }
}

// Auto-run the population
runPopulation();