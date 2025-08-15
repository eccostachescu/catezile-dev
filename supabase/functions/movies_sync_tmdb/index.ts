import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  popularity: number;
  release_dates?: {
    results: Array<{
      iso_3166_1: string;
      release_dates: Array<{
        type: number;
        release_date: string;
        certification?: string;
      }>;
    }>;
  };
  'watch/providers'?: {
    results: {
      RO?: {
        flatrate?: Array<{ provider_name: string }>;
        ads?: Array<{ provider_name: string }>;
        rent?: Array<{ provider_name: string }>;
        buy?: Array<{ provider_name: string }>;
      };
    };
  };
  videos?: {
    results: Array<{
      key: string;
      site: string;
      type: string;
      official: boolean;
    }>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Validate cron secret only for cron jobs (when header is present)
    const cronSecret = Deno.env.get('ADMIN_CRON_SECRET');
    const providedSecret = req.headers.get('x-cron-secret');
    if (cronSecret && providedSecret && providedSecret !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
    console.log('TMDB_API_KEY exists:', !!TMDB_API_KEY);
    if (!TMDB_API_KEY) {
      console.log('TMDB_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'TMDB_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Starting TMDB movies sync...');

    // Helper function to fetch from TMDB
    const fetchTMDB = async (endpoint: string) => {
      const url = `https://api.themoviedb.org/3${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      return response.json();
    };

    // Extract Romania cinema release date
    const extractCinemaReleaseRO = (releaseDates: TMDBMovie['release_dates']) => {
      if (!releaseDates?.results) return null;
      
      const roData = releaseDates.results.find(r => r.iso_3166_1 === 'RO');
      if (!roData?.release_dates) return null;

      // Priority: 3=Theatrical, 2=Theatrical limited, 1=Premiere
      const priorities = [3, 2, 1];
      for (const type of priorities) {
        const release = roData.release_dates.find(r => r.type === type);
        if (release) {
          return {
            date: release.release_date.split('T')[0],
            certification: release.certification || null
          };
        }
      }
      return null;
    };

    // Extract streaming data for Romania
    const extractStreamingRO = (watchProviders: TMDBMovie['watch/providers']) => {
      const ro = watchProviders?.results?.RO;
      if (!ro) return {};

      const streaming: Record<string, string | null> = {};
      
      // Only use flatrate (subscription) providers for now
      if (ro.flatrate) {
        for (const provider of ro.flatrate) {
          streaming[provider.provider_name] = null; // Will be populated later with actual dates
        }
      }
      
      return streaming;
    };

    // Extract trailer key
    const extractTrailerKey = (videos: TMDBMovie['videos']) => {
      if (!videos?.results) return null;
      
      // Find first official trailer
      const trailer = videos.results.find(v => 
        v.site === 'YouTube' && 
        v.type === 'Trailer' && 
        v.official
      );
      
      if (trailer) return trailer.key;
      
      // Fallback to first trailer
      const firstTrailer = videos.results.find(v => 
        v.site === 'YouTube' && 
        v.type === 'Trailer'
      );
      
      return firstTrailer?.key || null;
    };

    const processedMovies = [];

    // Fetch upcoming movies
    console.log('Fetching upcoming movies...');
    const upcoming = await fetchTMDB('/movie/upcoming?region=RO&page=1');
    
    // Fetch popular movies
    console.log('Fetching popular movies...');
    const popular = await fetchTMDB('/movie/popular?region=RO&page=1');

    // Combine and deduplicate
    const allMovies = [...upcoming.results, ...popular.results];
    const uniqueMovies = allMovies.reduce((acc, movie) => {
      if (!acc.find(m => m.id === movie.id)) {
        acc.push(movie);
      }
      return acc;
    }, []);

    console.log(`Processing ${uniqueMovies.length} unique movies...`);

    // Process each movie
    for (const movie of uniqueMovies.slice(0, 50)) { // Limit to 50 per run
      try {
        console.log(`Processing: ${movie.title} (${movie.id})`);
        
        // Fetch detailed movie data with enhanced metadata
        const detailed = await fetchTMDB(
          `/movie/${movie.id}?append_to_response=release_dates,watch/providers,videos,keywords,credits`
        ) as TMDBMovie;

        const cinemaRelease = extractCinemaReleaseRO(detailed.release_dates);
        const streamingRO = extractStreamingRO(detailed['watch/providers']);
        const trailerKey = extractTrailerKey(detailed.videos);

        // Enhanced slug generation with year for better SEO
        const releaseYear = cinemaRelease?.date ? new Date(cinemaRelease.date).getFullYear() : '';
        const slug = (detailed.title + (releaseYear ? ` ${releaseYear}` : ''))
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        // Determine status
        const today = new Date().toISOString().split('T')[0];
        const status = cinemaRelease?.date && cinemaRelease.date <= today ? 'RELEASED' : 'SCHEDULED';

        // Enhanced overview with Romanian context
        let enhancedOverview = detailed.overview || '';
        if (enhancedOverview && cinemaRelease?.date) {
          const releaseInfo = status === 'RELEASED' 
            ? `Filmul a fost lansat în cinematografele românești pe ${new Date(cinemaRelease.date).toLocaleDateString('ro-RO')}.`
            : `Filmul urmează să fie lansat în cinematografele românești pe ${new Date(cinemaRelease.date).toLocaleDateString('ro-RO')}.`;
          enhancedOverview = `${enhancedOverview}\n\n${releaseInfo}`;
        }

        // Extract director and main cast for enhanced metadata
        const director = detailed.credits?.crew?.find((person: any) => person.job === 'Director')?.name || '';
        const mainCast = detailed.credits?.cast?.slice(0, 5)?.map((actor: any) => actor.name).join(', ') || '';

        // Upsert movie
        const { error: upsertError } = await supabase
          .from('movie')
          .upsert({
            tmdb_id: detailed.id,
            title: detailed.title,
            original_title: detailed.original_title,
            overview: enhancedOverview,
            poster_path: detailed.poster_path,
            backdrop_path: detailed.backdrop_path,
            runtime: detailed.runtime,
            genres: detailed.genres?.map(g => g.name) || [],
            certification: cinemaRelease?.certification,
            cinema_release_ro: cinemaRelease?.date,
            streaming_ro: {
              ...streamingRO,
              director,
              main_cast: mainCast,
              keywords: detailed.keywords?.keywords?.slice(0, 10)?.map((k: any) => k.name) || []
            },
            release_calendar: detailed.release_dates || {},
            trailer_key: trailerKey,
            popularity: detailed.popularity || 0,
            status,
            slug,
            updated_ext_at: new Date().toISOString()
          }, {
            onConflict: 'tmdb_id',
            ignoreDuplicates: false
          });

        if (upsertError) {
          console.error(`Error upserting movie ${detailed.title}:`, upsertError);
        } else {
          processedMovies.push(detailed.title);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error processing movie ${movie.title}:`, error);
      }
    }

    console.log(`Sync completed. Processed ${processedMovies.length} movies.`);

    return new Response(JSON.stringify({ 
      success: true, 
      processed: processedMovies.length,
      movies: processedMovies 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in movies_sync_tmdb:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});