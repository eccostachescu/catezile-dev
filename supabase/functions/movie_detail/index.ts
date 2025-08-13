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
    const slug = url.searchParams.get('slug');
    const tmdbId = url.searchParams.get('tmdb_id');

    if (!slug && !tmdbId) {
      return new Response(JSON.stringify({ error: 'Slug or tmdb_id parameter required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    // Build query based on available parameters
    let query = supabase
      .from('movie')
      .select(`
        *,
        platforms:movie_platform (
          available_from,
          url,
          platform:platform_id (
            slug,
            name
          )
        )
      `);

    if (slug) {
      query = query.eq('slug', slug);
    } else if (tmdbId) {
      query = query.eq('tmdb_id', parseInt(tmdbId));
    }

    const { data: movies, error: fetchError } = await query.limit(1);

    if (fetchError) {
      throw new Error(`Failed to fetch movie: ${fetchError.message}`);
    }

    if (!movies || movies.length === 0) {
      return new Response(JSON.stringify({ error: 'Movie not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const movie = movies[0];

    // Calculate next relevant date using the database function
    const { data: nextDateData, error: nextDateError } = await supabase
      .rpc('get_movie_next_date', { movie_row: movie });

    if (nextDateError) {
      console.warn('Error getting next date:', nextDateError);
    }

    // Get streaming platforms with dates
    const streamingPlatforms = (movie.platforms || [])
      .filter((p: any) => p.platform)
      .map((p: any) => ({
        slug: p.platform.slug,
        name: p.platform.name,
        available_from: p.available_from,
        url: p.url
      }));

    // Parse streaming_ro for available platforms without dates
    const streamingRo = movie.streaming_ro || {};
    const additionalPlatforms = Object.keys(streamingRo).map(name => ({
      name,
      available: true,
      available_from: null
    }));

    // Combine and deduplicate platforms
    const allPlatforms = [...streamingPlatforms];
    for (const additional of additionalPlatforms) {
      if (!allPlatforms.find(p => p.name === additional.name)) {
        allPlatforms.push(additional);
      }
    }

    // Calculate countdown information
    const today = new Date();
    let countdown = null;
    
    if (nextDateData) {
      const targetDate = new Date(nextDateData.date);
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      countdown = {
        target_date: nextDateData.date,
        days_remaining: diffDays,
        type: nextDateData.type,
        platform: nextDateData.platform,
        is_past: diffDays < 0
      };
    }

    // Prepare trailer URL if available
    const trailerUrl = movie.trailer_key 
      ? `https://www.youtube.com/watch?v=${movie.trailer_key}`
      : null;

    const response = {
      ...movie,
      platforms: allPlatforms,
      countdown,
      trailer_url: trailerUrl,
      poster_url: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdrop_url: movie.backdrop_path 
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in movie_detail:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});