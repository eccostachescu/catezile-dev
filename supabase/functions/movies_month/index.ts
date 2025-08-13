import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const year = url.searchParams.get('year');
    const month = url.searchParams.get('month');

    if (!year || !month) {
      return new Response(JSON.stringify({ error: 'Year and month parameters required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    // Calculate month boundaries
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Fetching movies for ${year}-${month}: ${startDateStr} to ${endDateStr}`);

    // Fetch cinema releases for the month
    const { data: cinemaMovies, error: cinemaError } = await supabase
      .from('movie')
      .select(`
        id,
        title,
        slug,
        poster_path,
        cinema_release_ro,
        overview,
        genres,
        runtime,
        popularity
      `)
      .gte('cinema_release_ro', startDateStr)
      .lte('cinema_release_ro', endDateStr)
      .order('cinema_release_ro', { ascending: true });

    if (cinemaError) {
      throw new Error(`Failed to fetch cinema movies: ${cinemaError.message}`);
    }

    // Fetch streaming releases for the month
    const { data: streamingMovies, error: streamingError } = await supabase
      .from('movie_platform')
      .select(`
        available_from,
        movie:movie_id (
          id,
          title,
          slug,
          poster_path,
          overview,
          genres,
          runtime,
          popularity
        ),
        platform:platform_id (
          slug,
          name
        )
      `)
      .gte('available_from', startDateStr)
      .lte('available_from', endDateStr)
      .order('available_from', { ascending: true });

    if (streamingError) {
      throw new Error(`Failed to fetch streaming movies: ${streamingError.message}`);
    }

    // Group streaming movies by platform
    const streamingByPlatform: Record<string, any[]> = {};
    
    for (const item of streamingMovies || []) {
      const platform = item.platform?.slug || 'unknown';
      if (!streamingByPlatform[platform]) {
        streamingByPlatform[platform] = [];
      }
      streamingByPlatform[platform].push({
        ...item.movie,
        available_from: item.available_from,
        platform_name: item.platform?.name
      });
    }

    const response = {
      year: yearNum,
      month: monthNum,
      month_name: new Date(yearNum, monthNum - 1).toLocaleDateString('ro-RO', { month: 'long' }),
      cinema: cinemaMovies || [],
      streaming: streamingByPlatform,
      total_cinema: cinemaMovies?.length || 0,
      total_streaming: streamingMovies?.length || 0
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in movies_month:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});