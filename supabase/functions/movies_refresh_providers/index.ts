import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Validate cron secret if provided
    const cronSecret = Deno.env.get('ADMIN_CRON_SECRET');
    if (cronSecret && req.headers.get('x-cron-secret') !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
    if (!TMDB_API_KEY) {
      return new Response(JSON.stringify({ error: 'TMDB_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Refreshing watch providers...');

    // Get movies that need provider updates (recent or without streaming data)
    const { data: movies, error: fetchError } = await supabase
      .from('movie')
      .select('id, tmdb_id, title, streaming_ro')
      .not('tmdb_id', 'is', null)
      .or('streaming_ro.is.null,updated_ext_at.lt.now() - interval \'1 week\'')
      .limit(100);

    if (fetchError) {
      throw new Error(`Failed to fetch movies: ${fetchError.message}`);
    }

    console.log(`Updating providers for ${movies?.length || 0} movies...`);

    let updatedCount = 0;

    for (const movie of movies || []) {
      try {
        // Fetch watch providers from TMDB
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.tmdb_id}/watch/providers?api_key=${TMDB_API_KEY}`
        );
        
        if (!response.ok) {
          console.warn(`TMDB API error for movie ${movie.title}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const ro = data.results?.RO;
        
        const streaming: Record<string, string | null> = {};
        
        // Extract flatrate (subscription) providers
        if (ro?.flatrate) {
          for (const provider of ro.flatrate) {
            streaming[provider.provider_name] = null; // Will be populated with actual dates later
          }
        }

        // Update the movie's streaming_ro data
        const { error: updateError } = await supabase
          .from('movie')
          .update({
            streaming_ro: streaming,
            updated_ext_at: new Date().toISOString()
          })
          .eq('id', movie.id);

        if (updateError) {
          console.error(`Error updating movie ${movie.title}:`, updateError);
        } else {
          updatedCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Error processing movie ${movie.title}:`, error);
      }
    }

    console.log(`Provider refresh completed. Updated ${updatedCount} movies.`);

    return new Response(JSON.stringify({ 
      success: true, 
      processed: movies?.length || 0,
      updated: updatedCount 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in movies_refresh_providers:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});