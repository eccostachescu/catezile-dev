import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

async function tmdbFetch(endpoint: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY!);
  url.searchParams.set('language', 'ro-RO');
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  console.log('🔧 TMDB URL:', url.toString());
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

function buildImageUrl(path: string | null, size = 'w500'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

async function getPopularMovies(limit = 20) {
  try {
    console.log('🔧 Fetching popular movies...');
    
    // Get popular, upcoming, and now playing movies
    const [popular, upcoming, nowPlaying] = await Promise.all([
      tmdbFetch('/movie/popular', { page: 1 }),
      tmdbFetch('/movie/upcoming', { page: 1 }),
      tmdbFetch('/movie/now_playing', { page: 1 })
    ]);

    console.log('🔧 Raw TMDB responses:', {
      popular: popular.results?.length || 0,
      upcoming: upcoming.results?.length || 0,
      nowPlaying: nowPlaying.results?.length || 0
    });

    // Combine and deduplicate movies
    const allMovies = [
      ...(popular.results || []),
      ...(upcoming.results || []),
      ...(nowPlaying.results || [])
    ];

    const uniqueMovies = Array.from(
      new Map(allMovies.map(movie => [movie.id, movie])).values()
    );

    console.log('🔧 Unique movies found:', uniqueMovies.length);

    // Process movies with details
    const processedMovies = [];
    for (const movie of uniqueMovies.slice(0, limit)) {
      try {
        // Get movie details including release dates and providers
        const details = await tmdbFetch(`/movie/${movie.id}`, {
          append_to_response: 'release_dates,watch/providers,videos'
        });

        const processedMovie = {
          tmdb_id: movie.id,
          title: details.title || movie.title,
          original_title: details.original_title || movie.original_title,
          overview: details.overview || movie.overview,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          poster_url: buildImageUrl(movie.poster_path),
          backdrop_url: buildImageUrl(movie.backdrop_path, 'w1280'),
          release_date: details.release_date || movie.release_date,
          genres: (details.genres || []).map((g: any) => g.name),
          runtime: details.runtime,
          popularity: movie.popularity || details.popularity,
          vote_average: movie.vote_average || details.vote_average,
          vote_count: movie.vote_count || details.vote_count,
          status: details.status || 'Released',
          // Extract Romanian cinema release date
          cinema_release_ro: extractCinemaReleaseRO(details.release_dates?.results || []),
          // Extract Romanian streaming providers
          streaming_ro: extractStreamingRO(details['watch/providers']?.results?.RO),
          // Extract trailer
          trailer_youtube_key: extractTrailerKey(details.videos?.results || [])
        };

        processedMovies.push(processedMovie);
        console.log('🔧 Processed movie:', processedMovie.title);
      } catch (error) {
        console.error(`🔧 Error processing movie ${movie.id}:`, error);
        // Add basic movie info even if details fail
        processedMovies.push({
          tmdb_id: movie.id,
          title: movie.title,
          original_title: movie.original_title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          poster_url: buildImageUrl(movie.poster_path),
          backdrop_url: buildImageUrl(movie.backdrop_path, 'w1280'),
          release_date: movie.release_date,
          popularity: movie.popularity,
          vote_average: movie.vote_average,
          genres: [],
          runtime: null,
          status: 'Released'
        });
      }
    }

    console.log('🔧 Final movies processed:', processedMovies.length);
    return processedMovies;

  } catch (error) {
    console.error('🔧 Error in getPopularMovies:', error);
    throw error;
  }
}

function extractCinemaReleaseRO(releaseDates: any[]): string | null {
  const roRelease = releaseDates.find(r => r.iso_3166_1 === 'RO');
  if (roRelease && roRelease.release_dates?.length > 0) {
    // Look for theatrical release (type 3) or physical release (type 4)
    const theatrical = roRelease.release_dates.find((rd: any) => rd.type === 3);
    if (theatrical) {
      return theatrical.release_date?.split('T')[0] || null;
    }
    // Fallback to first release date
    return roRelease.release_dates[0]?.release_date?.split('T')[0] || null;
  }
  return null;
}

function extractStreamingRO(roProviders: any): any {
  if (!roProviders) return {};
  
  const streaming: any = {};
  
  // Extract flatrate (subscription) providers
  if (roProviders.flatrate) {
    roProviders.flatrate.forEach((provider: any) => {
      streaming[provider.provider_name] = {
        provider_id: provider.provider_id,
        provider_name: provider.provider_name,
        logo_path: buildImageUrl(provider.logo_path, 'w92'),
        type: 'flatrate'
      };
    });
  }
  
  return streaming;
}

function extractTrailerKey(videos: any[]): string | null {
  if (!videos || videos.length === 0) return null;
  
  // Look for YouTube trailer
  const trailer = videos.find(v => 
    v.site === 'YouTube' && 
    v.type === 'Trailer' && 
    v.official === true
  ) || videos.find(v => 
    v.site === 'YouTube' && 
    v.type === 'Trailer'
  ) || videos.find(v => 
    v.site === 'YouTube'
  );
  
  return trailer?.key || null;
}

serve(async (req) => {
  console.log('🔧 TMDB Popular Movies function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { type = 'popular', genre, limit = 20 } = body;
    
    console.log('🔧 Request params:', { type, genre, limit });

    let movies = [];

    if (type === 'popular') {
      movies = await getPopularMovies(limit);
    } else {
      throw new Error(`Unsupported type: ${type}`);
    }

    return new Response(JSON.stringify({
      success: true,
      movies,
      count: movies.length,
      debug: { type, genre, limit }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🔧 Error in tmdb_popular_movies:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      movies: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});