import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY') || 'demo';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

async function tmdbFetch(endpoint: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'ro-RO');
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  console.log('🔧 TMDB URL:', url.toString());
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

function buildImageUrl(path: string | null, size = 'w500'): string | null {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

async function getUpcomingTVShows(limit = 20) {
  try {
    console.log('🔧 Fetching upcoming TV shows...');
    // Fetch multiple sources for comprehensive results
    const [onAir, airingToday, popular] = await Promise.all([
      tmdbFetch('/tv/on_the_air', { page: 1 }),
      tmdbFetch('/tv/airing_today', { page: 1 }),
      tmdbFetch('/tv/popular', { page: 1 })
    ]);

    console.log('🔧 Raw TMDB responses:', {
      onAir: onAir.results?.length || 0,
      airingToday: airingToday.results?.length || 0,
      popular: popular.results?.length || 0
    });

    // Combine and deduplicate shows
    const allShows = [
      ...(onAir.results || []),
      ...(airingToday.results || []),
      ...(popular.results || [])
    ];
    
    const uniqueShows = allShows.filter((show, index, self) => 
      index === self.findIndex(s => s.id === show.id)
    );

    console.log('🔧 Unique shows found:', uniqueShows.length);

    // Get detailed info for each show with next episode
    const showsWithEpisodes = [];
    
    for (const show of uniqueShows.slice(0, limit)) {
      try {
        // Get detailed show info including next episode
        const showDetails = await tmdbFetch(`/tv/${show.id}`, {
          append_to_response: 'external_ids'
        });

        if (showDetails.next_episode_to_air) {
          const processedShow = {
            id: show.id,
            name: show.name,
            overview: show.overview,
            poster_path: show.poster_path,
            backdrop_path: show.backdrop_path,
            first_air_date: show.first_air_date,
            vote_average: show.vote_average,
            vote_count: show.vote_count,
            popularity: show.popularity,
            genres: show.genre_ids?.map(id => getGenreName(id)).filter(Boolean) || [],
            poster_url: buildImageUrl(show.poster_path, 'w500'),
            backdrop_url: buildImageUrl(show.backdrop_path, 'w1280'),
            slug: show.name.toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-'),
            
            // Next episode info
            next_episode: showDetails.next_episode_to_air,
            air_date: showDetails.next_episode_to_air.air_date,
            episode_name: showDetails.next_episode_to_air.name,
            season_number: showDetails.next_episode_to_air.season_number,
            episode_number: showDetails.next_episode_to_air.episode_number,
            
            // Additional show details
            status: showDetails.status,
            number_of_seasons: showDetails.number_of_seasons,
            number_of_episodes: showDetails.number_of_episodes
          };

          showsWithEpisodes.push(processedShow);
          console.log(`🔧 Added show with upcoming episode: ${show.name} - ${showDetails.next_episode_to_air.air_date}`);
        }
      } catch (error) {
        console.error(`Error processing show ${show.id}:`, error);
        continue;
      }
    }

    // Sort by air date (closest first)
    const sorted = showsWithEpisodes
      .filter(show => show.air_date)
      .sort((a, b) => new Date(a.air_date).getTime() - new Date(b.air_date).getTime());

    console.log('🔧 Final shows with episodes:', sorted.length);
    return sorted;

  } catch (error) {
    console.error('Error fetching upcoming TV shows:', error);
    return [];
  }
}

async function getPopularTVShows(genre?: string, limit = 12) {
  try {
    console.log('🔧 Fetching popular TV shows with genre:', genre);
    const params: Record<string, string | number> = { page: 1 };
    
    if (genre && genre !== '') {
      // Map genre names to IDs
      const genreMap: Record<string, number> = {
        'drama': 18,
        'comedy': 35,
        'crime': 80,
        'sci-fi': 10765,
        'fantasy': 10765,
        'action': 10759,
        'thriller': 9648,
        'animation': 16
      };
      
      if (genreMap[genre.toLowerCase()]) {
        params.with_genres = genreMap[genre.toLowerCase()];
      }
    }

    const data = await tmdbFetch('/tv/popular', params);
    console.log('🔧 Popular TV shows response:', data.results?.length || 0);
    
    const processedShows = (data.results || []).slice(0, limit).map((show: any) => ({
      id: show.id,
      name: show.name,
      overview: show.overview,
      poster_path: show.poster_path,
      backdrop_path: show.backdrop_path,
      first_air_date: show.first_air_date,
      vote_average: show.vote_average,
      vote_count: show.vote_count,
      popularity: show.popularity,
      genres: show.genre_ids?.map((id: number) => getGenreName(id)).filter(Boolean) || [],
      poster_url: buildImageUrl(show.poster_path, 'w500'),
      backdrop_url: buildImageUrl(show.backdrop_path, 'w1280'),
      slug: show.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
    }));

    return processedShows;

  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    return [];
  }
}

function getGenreName(genreId: number): string | null {
  const genreMap: Record<number, string> = {
    10759: 'Action & Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    10762: 'Kids',
    9648: 'Mystery',
    10763: 'News',
    10764: 'Reality',
    10765: 'Sci-Fi & Fantasy',
    10766: 'Soap',
    10767: 'Talk',
    10768: 'War & Politics',
    37: 'Western'
  };
  
  return genreMap[genreId] || null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 TMDB Popular TV function called');
    const { genre, limit = 12, type = 'popular' } = await req.json().catch(() => ({}));
    console.log('🔧 Request params:', { genre, limit, type });

    let shows = [];

    if (type === 'upcoming') {
      shows = await getUpcomingTVShows(limit);
    } else {
      shows = await getPopularTVShows(genre, limit);
    }

    console.log('🔧 Returning shows:', shows.length);

    return new Response(
      JSON.stringify({
        success: true,
        shows: shows,
        count: shows.length,
        debug: {
          tmdb_key_available: TMDB_API_KEY !== 'demo',
          type,
          genre,
          limit
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in TMDB TV function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        shows: []
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});