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
      console.error('❌ Error importing Liga 1 fixtures:', error);
    }

    // Step 4: Import multi-league sports data
    console.log('⚽ Importing international sports leagues...');
    try {
      const { data: multiLeagueResult, error: multiLeagueError } = await supabase.functions.invoke('import_multi_leagues', {
        body: { 
          league_codes: ['PL', 'PD', 'SA', 'BL1', 'FL1', 'CL'], // Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League
          season: 2025 
        }
      });
      if (multiLeagueError) throw multiLeagueError;
      console.log('✅ import_multi_leagues completed:', multiLeagueResult);
    } catch (error) {
      console.error('❌ Error importing multi-league data:', error);
    }

    // Step 5: Import Romanian TV schedule
    console.log('📺 Importing Romanian TV shows...');
    try {
      const { data: tvResult, error: tvError } = await supabase.functions.invoke('import_ro_tv_schedule');
      if (tvError) throw tvError;
      console.log('✅ import_ro_tv_schedule completed:', tvResult);
    } catch (error) {
      console.error('❌ Error importing TV shows:', error);
    }

    // Step 6: Refresh search index
    console.log('📋 Refreshing search index...');
    try {
      const { data: searchResult, error: searchError } = await supabase.functions.invoke('search_index_refresh');
      if (searchError) throw searchError;
      console.log('✅ search_index_refresh completed:', searchResult);
    } catch (error) {
      console.error('❌ Error refreshing search:', error);
    }

    // Step 7: Generate sample events
    console.log('🎉 Generating sample events...');
    try {
      const { data: eventsResult, error: eventsError } = await supabase.functions.invoke('events_submit', {
        body: { 
          title: 'Eurovision 2025',
          description: 'Concursul Eurovision 2025',
          start_at: '2025-05-17T21:00:00Z',
          category: 'Muzică',
          city: 'Basel'
        }
      });
      if (eventsError) throw eventsError;
      console.log('✅ Sample events generated:', eventsResult);
    } catch (error) {
      console.error('❌ Error generating events:', error);
    }

    // Step 8: Check final counts
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
        message: 'Database populated with complete data: movies, sports, TV shows, holidays, and events',
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