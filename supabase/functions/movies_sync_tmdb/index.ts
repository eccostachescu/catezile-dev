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

    // Multiple categories for more comprehensive import
    const movieCategories = [
      { name: 'upcoming', endpoint: '/movie/upcoming?region=RO' },
      { name: 'popular', endpoint: '/movie/popular?region=RO' },
      { name: 'now_playing', endpoint: '/movie/now_playing?region=RO' },
      { name: 'top_rated', endpoint: '/movie/top_rated?region=RO' },
      { name: 'discover_2024', endpoint: '/discover/movie?primary_release_year=2024&region=RO&sort_by=popularity.desc' },
      { name: 'discover_2025', endpoint: '/discover/movie?primary_release_year=2025&region=RO&sort_by=popularity.desc' }
    ];

    console.log(`Fetching movies from ${movieCategories.length} categories...`);

    const allMovies: any[] = [];
    let totalFetched = 0;

    // Fetch from multiple pages and categories
    for (const category of movieCategories) {
      console.log(`Fetching ${category.name}...`);
      
      for (let page = 1; page <= 3; page++) { // Fetch 3 pages per category
        try {
          const endpoint = `${category.endpoint}${category.endpoint.includes('?') ? '&' : '?'}page=${page}`;
          const response = await fetchTMDB(endpoint);
          
          if (response.results && response.results.length > 0) {
            allMovies.push(...response.results);
            totalFetched += response.results.length;
            console.log(`${category.name} page ${page}: ${response.results.length} movies`);
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          // Stop if no more results
          if (!response.results || response.results.length === 0) break;
          
        } catch (error) {
          console.error(`Error fetching ${category.name} page ${page}:`, error);
          break;
        }
      }
    }

    // Deduplicate movies
    const uniqueMovies = allMovies.reduce((acc, movie) => {
      if (!acc.find(m => m.id === movie.id)) {
        acc.push(movie);
      }
      return acc;
    }, []);

    console.log(`Total fetched: ${totalFetched}, Unique movies: ${uniqueMovies.length}`);

    // Filter movies: only those with release dates in reasonable range
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, 0, 1);
    const twoYearsFromNow = new Date(now.getFullYear() + 2, 11, 31);

    const filteredMovies = uniqueMovies.filter(movie => {
      if (!movie.release_date) return false;
      const releaseDate = new Date(movie.release_date);
      return releaseDate >= twoYearsAgo && releaseDate <= twoYearsFromNow;
    });

    console.log(`Filtered movies (${twoYearsAgo.getFullYear()}-${twoYearsFromNow.getFullYear()}): ${filteredMovies.length}`);

    // Process movies (remove artificial limit)
    for (const movie of filteredMovies) {
      try {
        console.log(`Processing: ${movie.title} (${movie.id})`);
        
        // Check if movie exists and when it was last updated
        const { data: existingMovie } = await supabase
          .from('movie')
          .select('id, tmdb_id, updated_ext_at')
          .eq('tmdb_id', movie.id)
          .maybeSingle();
        
        // Skip if updated recently (less than 7 days ago)
        if (existingMovie?.updated_ext_at) {
          const lastUpdate = new Date(existingMovie.updated_ext_at);
          const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceUpdate < 7) {
            console.log(`Skipping ${movie.title} - updated ${Math.round(daysSinceUpdate)} days ago`);
            continue;
          }
        }
        
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

        // Longer delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
        
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