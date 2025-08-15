import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🚀 Starting data population...');

    // Step 1: Generate holidays
    console.log('📋 Generating holidays...');
    try {
      const { data: holidaysResult, error: holidaysError } = await supabase.functions.invoke('holidays_generate');
      if (holidaysError) throw holidaysError;
      console.log('✅ holidays_generate completed:', holidaysResult);
    } catch (error) {
      console.error('❌ Error generating holidays:', error);
    }

    // Step 2: Sync TMDB movies
    console.log('📋 Syncing TMDB movies...');
    try {
      const { data: moviesResult, error: moviesError } = await supabase.functions.invoke('movies_sync_tmdb');
      if (moviesError) throw moviesError;
      console.log('✅ movies_sync_tmdb completed:', moviesResult);
    } catch (error) {
      console.error('❌ Error syncing movies:', error);
    }

    // Step 3: Import Liga 1 fixtures
    console.log('📋 Importing Liga 1 fixtures...');
    try {
      const { data: fixturesResult, error: fixturesError } = await supabase.functions.invoke('import_liga1_fixtures');
      if (fixturesError) throw fixturesError;
      console.log('✅ import_liga1_fixtures completed:', fixturesResult);
    } catch (error) {
      console.error('❌ Error importing fixtures:', error);
    }

    // Step 4: Import Romanian TV schedule
    console.log('📺 Importing Romanian TV shows...');
    try {
      const { data: tvResult, error: tvError } = await supabase.functions.invoke('import_ro_tv_schedule');
      if (tvError) throw tvError;
      console.log('✅ import_ro_tv_schedule completed:', tvResult);
    } catch (error) {
      console.error('❌ Error importing TV shows:', error);
    }

    // Step 5: Refresh search index
    console.log('📋 Refreshing search index...');
    try {
      const { data: searchResult, error: searchError } = await supabase.functions.invoke('search_index_refresh');
      if (searchError) throw searchError;
      console.log('✅ search_index_refresh completed:', searchResult);
    } catch (error) {
      console.error('❌ Error refreshing search:', error);
    }

    // Step 6: Check final counts
    console.log('📊 Checking final counts...');
    const [moviesCount, matchesCount, holidayCount, eventsCount] = await Promise.all([
      supabase.from('movie').select('id', { count: 'exact', head: true }),
      supabase.from('match').select('id', { count: 'exact', head: true }),
      supabase.from('holiday_instance').select('id', { count: 'exact', head: true }),
      supabase.from('event').select('id', { count: 'exact', head: true })
    ]);

    const summary = {
      movies: moviesCount.count || 0,
      matches: matchesCount.count || 0, 
      holidays: holidayCount.count || 0,
      events: eventsCount.count || 0
    };

    console.log('📈 Movies:', summary.movies);
    console.log('⚽ Matches:', summary.matches);
    console.log('📅 Holiday instances:', summary.holidays);
    console.log('🎉 Events:', summary.events);
    console.log('🎉 All data population completed successfully!');


    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database populated with real data including TV shows',
        data: summary
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error populating database:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});